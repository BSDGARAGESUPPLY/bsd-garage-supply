const router = require('express').Router();
const db = require('../db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticate, requireApproved } = require('../middleware/auth');
const { sendMail, ADMIN_EMAIL } = require('../lib/mailer');
const templates = require('../lib/emailTemplates');

// Send order confirmation to the customer + new-order alert to the owner.
function sendOrderEmails(orderId) {
  try {
    const order = db.prepare(`
      SELECT o.*, u.email as customer_email, u.company_name, u.contact_name, u.phone
      FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?
    `).get(orderId);
    if (!order) return;
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    const conf = templates.orderConfirmation(order, items);
    sendMail({ to: order.customer_email, subject: conf.subject, html: conf.html });

    const customer = { company_name: order.company_name, contact_name: order.contact_name, email: order.customer_email, phone: order.phone };
    const alert = templates.newOrderAdmin(order, items, customer);
    sendMail({ to: ADMIN_EMAIL, subject: alert.subject, html: alert.html });
  } catch (err) {
    console.error('Order email error:', err.message);
  }
}

const generateOrderNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `BSD-${ts}-${rand}`;
};

// Create order from cart
router.post('/', authenticate, requireApproved, (req, res) => {
  const { shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_method, shipping_cost, notes } = req.body;
  if (!shipping_name || !shipping_address || !shipping_city || !shipping_state || !shipping_zip || !shipping_method) {
    return res.status(400).json({ error: 'Shipping information required' });
  }

  const cartItems = db.prepare(`
    SELECT ci.quantity, p.id as product_id, p.name, p.sku, p.retail_price as price, p.stock_qty
    FROM cart_items ci JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ? AND p.is_active = 1
  `).all(req.user.id);

  if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

  for (const item of cartItems) {
    if (item.stock_qty < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
    }
  }

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = parseFloat(shipping_cost) || 0;
  const total = parseFloat((subtotal + shippingCost).toFixed(2));
  const orderNumber = generateOrderNumber();

  try {
    db.exec('BEGIN');
    const orderResult = db.prepare(`
      INSERT INTO orders (order_number, user_id, subtotal, shipping_cost, tax, total,
        shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip,
        shipping_method, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(orderNumber, req.user.id, subtotal, shippingCost, 0, total,
      shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip,
      shipping_method, notes);

    const orderId = orderResult.lastInsertRowid;
    for (const item of cartItems) {
      db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, product_name, product_sku)
        VALUES (?,?,?,?,?,?,?)
      `).run(orderId, item.product_id, item.quantity, item.price, item.price * item.quantity, item.name, item.sku);
    }
    db.exec('COMMIT');
    res.status(201).json({ order_id: orderId, order_number: orderNumber, total });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Create Stripe payment intent
router.post('/:id/payment-intent', authenticate, requireApproved, async (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.payment_status === 'paid') return res.status(400).json({ error: 'Order already paid' });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: 'usd',
      metadata: { order_id: order.id.toString(), order_number: order.order_number, user_id: req.user.id.toString() }
    });
    db.prepare('UPDATE orders SET payment_intent_id=? WHERE id=?').run(paymentIntent.id, order.id);
    res.json({ client_secret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: 'Payment service error: ' + err.message });
  }
});

// Confirm payment (called after Stripe confirms on frontend)
router.post('/:id/confirm', authenticate, requireApproved, async (req, res) => {
  const { payment_intent_id } = req.body;
  const order = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  try {
    const intent = await stripe.paymentIntents.retrieve(payment_intent_id || order.payment_intent_id);
    if (intent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not confirmed' });
    }

    db.exec('BEGIN');
    const items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(order.id);
    for (const item of items) {
      db.prepare('UPDATE products SET stock_qty = stock_qty - ? WHERE id=?').run(item.quantity, item.product_id);
    }
    db.prepare('DELETE FROM cart_items WHERE user_id=?').run(order.user_id);
    db.prepare(`UPDATE orders SET status='processing', payment_status='paid', updated_at=datetime('now') WHERE id=?`).run(order.id);
    db.exec('COMMIT');

    sendOrderEmails(order.id);

    const updated = db.prepare('SELECT * FROM orders WHERE id=?').get(order.id);
    res.json(updated);
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'Payment verification error: ' + err.message });
  }
});

// Stripe webhook
router.post('/webhooks/stripe', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const order = db.prepare('SELECT * FROM orders WHERE payment_intent_id=?').get(intent.id);
    if (order && order.payment_status !== 'paid') {
      try {
        db.exec('BEGIN');
        const items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(order.id);
        for (const item of items) {
          db.prepare('UPDATE products SET stock_qty = stock_qty - ? WHERE id=?').run(item.quantity, item.product_id);
        }
        db.prepare('DELETE FROM cart_items WHERE user_id=?').run(order.user_id);
        db.prepare(`UPDATE orders SET status='processing', payment_status='paid', updated_at=datetime('now') WHERE id=?`).run(order.id);
        db.exec('COMMIT');
        sendOrderEmails(order.id);
      } catch {
        db.exec('ROLLBACK');
      }
    }
  }
  res.json({ received: true });
});

// Get user's orders
router.get('/', authenticate, (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, COUNT(oi.id) as item_count
    FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id ORDER BY o.created_at DESC
  `).all(req.user.id);
  res.json(orders);
});

// Get order detail
router.get('/:id', authenticate, (req, res) => {
  const where = req.user.is_admin ? 'o.id=?' : 'o.id=? AND o.user_id=?';
  const params = req.user.is_admin ? [req.params.id] : [req.params.id, req.user.id];
  const order = db.prepare(`SELECT o.*, u.company_name, u.email as customer_email FROM orders o JOIN users u ON o.user_id=u.id WHERE ${where}`).get(...params);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = db.prepare('SELECT oi.*, p.images FROM order_items oi LEFT JOIN products p ON oi.product_id=p.id WHERE oi.order_id=?').all(order.id)
    .map(i => ({ ...i, images: JSON.parse(i.images || '[]') }));
  res.json({ ...order, items });
});

module.exports = router;
