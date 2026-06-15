const db = require('../db');
const { sendMail, ADMIN_EMAIL } = require('./mailer');
const templates = require('./emailTemplates');

/**
 * Mark an order paid: decrement stock, clear the cart, set status, send emails.
 * Idempotent — safe to call from both the checkout "confirm" call and the
 * Stripe webhook. If the order is already paid, it does nothing.
 * Returns true if it fulfilled the order on this call.
 */
function fulfillOrder(orderId) {
  const order = db.prepare(`
    SELECT o.*, u.email AS customer_email, u.company_name, u.contact_name, u.phone
    FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?
  `).get(orderId);
  if (!order) return false;
  if (order.payment_status === 'paid') return false; // already handled

  db.exec('BEGIN');
  try {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    for (const item of items) {
      db.prepare('UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?').run(item.quantity, item.product_id);
    }
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(order.user_id);
    db.prepare(`UPDATE orders SET status='processing', payment_status='paid', updated_at=datetime('now') WHERE id = ?`).run(orderId);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // Emails after commit — never let a mail issue affect fulfillment.
  try {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    const conf = templates.orderConfirmation(order, items);
    sendMail({ to: order.customer_email, subject: conf.subject, html: conf.html });
    const customer = { company_name: order.company_name, contact_name: order.contact_name, email: order.customer_email, phone: order.phone };
    const alert = templates.newOrderAdmin(order, items, customer);
    sendMail({ to: ADMIN_EMAIL, subject: alert.subject, html: alert.html });
  } catch (err) {
    console.error('Order email error:', err.message);
  }

  return true;
}

module.exports = { fulfillOrder };
