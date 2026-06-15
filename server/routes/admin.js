const router = require('express').Router();
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { sendMail } = require('../lib/mailer');
const templates = require('../lib/emailTemplates');

router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', (req, res) => {
  const totalRevenue = db.prepare(`SELECT COALESCE(SUM(total),0) as val FROM orders WHERE payment_status='paid'`).get().val;
  const totalOrders = db.prepare(`SELECT COUNT(*) as val FROM orders`).get().val;
  const pendingApprovals = db.prepare(`SELECT COUNT(*) as val FROM users WHERE status='pending'`).get().val;
  const lowStock = db.prepare(`SELECT COUNT(*) as val FROM products WHERE stock_qty <= min_stock_alert AND is_active=1`).get().val;
  const recentOrders = db.prepare(`
    SELECT o.*, u.company_name FROM orders o JOIN users u ON o.user_id=u.id
    ORDER BY o.created_at DESC LIMIT 10
  `).all();
  const monthRevenue = db.prepare(`
    SELECT COALESCE(SUM(total),0) as val FROM orders
    WHERE payment_status='paid' AND created_at >= date('now','-30 days')
  `).get().val;
  res.json({ totalRevenue, totalOrders, pendingApprovals, lowStock, recentOrders, monthRevenue });
});

// Products CRUD
router.get('/products', (req, res) => {
  const { page = 1, limit = 50, search } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let q = `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id`;
  const params = [];
  if (search) { q += ` WHERE p.name LIKE ? OR p.sku LIKE ?`; params.push(`%${search}%`, `%${search}%`); }
  const total = db.prepare(`SELECT COUNT(*) as count FROM (${q})`).get(...params).count;
  q += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);
  const products = db.prepare(q).all(...params).map(p => ({ ...p, specifications: JSON.parse(p.specifications || '{}'), images: JSON.parse(p.images || '[]') }));
  res.json({ products, total });
});

router.post('/products', (req, res) => {
  const { category_id, name, sku, description, weight, stock_qty, min_stock_alert, specifications, images } = req.body;
  // Single price model: accept `price` (fall back to legacy fields).
  const price = req.body.price ?? req.body.retail_price ?? req.body.wholesale_price;
  if (!name || !sku || price == null || price === '') return res.status(400).json({ error: 'Missing required fields (name, SKU, price)' });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
  const result = db.prepare(`
    INSERT INTO products (category_id,name,slug,sku,description,retail_price,wholesale_price,weight,stock_qty,min_stock_alert,specifications,images)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(category_id || null, name, slug, sku, description || null, price, price, weight||0, stock_qty||0, min_stock_alert||10,
    JSON.stringify(specifications||{}), JSON.stringify(images||[]));
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(result.lastInsertRowid);
  res.status(201).json({ ...product, specifications: JSON.parse(product.specifications), images: JSON.parse(product.images) });
});

router.put('/products/:id', (req, res) => {
  const { category_id, name, sku, description, weight, stock_qty, min_stock_alert, specifications, images, is_active } = req.body;
  const price = req.body.price ?? req.body.retail_price ?? req.body.wholesale_price;
  db.prepare(`
    UPDATE products SET category_id=?,name=?,sku=?,description=?,retail_price=?,wholesale_price=?,
    weight=?,stock_qty=?,min_stock_alert=?,specifications=?,images=?,is_active=? WHERE id=?
  `).run(category_id || null, name, sku, description || null, price, price, weight||0, stock_qty||0, min_stock_alert||10,
    JSON.stringify(specifications||{}), JSON.stringify(images||[]), is_active ?? 1, req.params.id);
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  res.json({ ...product, specifications: JSON.parse(product.specifications), images: JSON.parse(product.images) });
});

router.delete('/products/:id', (req, res) => {
  db.prepare('UPDATE products SET is_active=0 WHERE id=?').run(req.params.id);
  res.json({ message: 'Product deactivated' });
});

router.put('/products/:id/stock', (req, res) => {
  const { stock_qty } = req.body;
  db.prepare('UPDATE products SET stock_qty=? WHERE id=?').run(stock_qty, req.params.id);
  res.json({ stock_qty });
});

// Categories
router.get('/categories', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY sort_order').all());
});

router.post('/categories', (req, res) => {
  const { name, description, image_url, sort_order } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const result = db.prepare('INSERT INTO categories (name,slug,description,image_url,sort_order) VALUES (?,?,?,?,?)').run(name, slug, description || null, image_url || null, sort_order||0);
  res.status(201).json(db.prepare('SELECT * FROM categories WHERE id=?').get(result.lastInsertRowid));
});

router.put('/categories/:id', (req, res) => {
  const { name, description, image_url, sort_order } = req.body;
  db.prepare('UPDATE categories SET name=?,description=?,image_url=?,sort_order=? WHERE id=?').run(name, description || null, image_url || null, sort_order || 0, req.params.id);
  res.json(db.prepare('SELECT * FROM categories WHERE id=?').get(req.params.id));
});

// Customers
router.get('/customers', (req, res) => {
  const { status, page = 1 } = req.query;
  const offset = (parseInt(page) - 1) * 50;
  let q = `SELECT id,email,company_name,contact_name,phone,city,state,business_type,status,created_at,approved_at FROM users WHERE is_admin=0`;
  const params = [];
  if (status) { q += ' AND status=?'; params.push(status); }
  const total = db.prepare(`SELECT COUNT(*) as c FROM (${q})`).get(...params).c;
  q += ' ORDER BY created_at DESC LIMIT 50 OFFSET ?';
  params.push(offset);
  res.json({ customers: db.prepare(q).all(...params), total });
});

router.put('/customers/:id/status', (req, res) => {
  const { status, notes } = req.body;
  if (!['approved','rejected','pending'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const approved_at = status === 'approved' ? new Date().toISOString() : null;
  db.prepare('UPDATE users SET status=?, notes=?, approved_at=? WHERE id=?').run(status, notes || null, approved_at, req.params.id);
  res.json(db.prepare('SELECT id,email,company_name,status,approved_at FROM users WHERE id=?').get(req.params.id));
});

router.get('/customers/:id', (req, res) => {
  const user = db.prepare('SELECT id,email,company_name,contact_name,phone,address,city,state,zip,business_type,status,created_at,approved_at,notes FROM users WHERE id=?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  const orders = db.prepare('SELECT id,order_number,status,total,created_at FROM orders WHERE user_id=? ORDER BY created_at DESC').all(req.params.id);
  res.json({ ...user, orders });
});

// Orders
router.get('/orders', (req, res) => {
  const { status, page = 1 } = req.query;
  const offset = (parseInt(page) - 1) * 50;
  let q = `SELECT o.*, u.company_name, u.email as customer_email FROM orders o JOIN users u ON o.user_id=u.id`;
  const params = [];
  if (status) { q += ' WHERE o.status=?'; params.push(status); }
  const total = db.prepare(`SELECT COUNT(*) as c FROM (${q})`).get(...params).c;
  q += ' ORDER BY o.created_at DESC LIMIT 50 OFFSET ?';
  params.push(offset);
  res.json({ orders: db.prepare(q).all(...params), total });
});

router.put('/orders/:id', (req, res) => {
  const { status, tracking_number, shipping_carrier, notes } = req.body;
  const prev = db.prepare('SELECT status FROM orders WHERE id=?').get(req.params.id);
  db.prepare(`UPDATE orders SET status=?,tracking_number=?,shipping_carrier=?,notes=?,updated_at=datetime('now') WHERE id=?`)
    .run(status, tracking_number || null, shipping_carrier || null, notes || null, req.params.id);
  const order = db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(order.id);

  // Email the customer when the order first transitions to "shipped".
  if (status === 'shipped' && prev?.status !== 'shipped') {
    const customer = db.prepare('SELECT email FROM users WHERE id=?').get(order.user_id);
    if (customer?.email) {
      const { subject, html } = templates.orderShipped(order);
      sendMail({ to: customer.email, subject, html });
    }
  }
  res.json({ ...order, items });
});

// Low stock report
router.get('/inventory/low-stock', (req, res) => {
  const products = db.prepare(`
    SELECT p.*, c.name as category_name FROM products p
    LEFT JOIN categories c ON p.category_id=c.id
    WHERE p.stock_qty <= p.min_stock_alert AND p.is_active=1
    ORDER BY p.stock_qty ASC
  `).all().map(p => ({ ...p, specifications: JSON.parse(p.specifications), images: JSON.parse(p.images) }));
  res.json(products);
});

module.exports = router;
