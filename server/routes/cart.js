const router = require('express').Router();
const db = require('../db');
const { authenticate, requireApproved } = require('../middleware/auth');

const getCart = (userId) => {
  return db.prepare(`
    SELECT ci.id, ci.quantity, ci.product_id,
      p.name, p.sku, p.retail_price as unit_price, p.stock_qty, p.weight,
      p.images
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ? AND p.is_active = 1
  `).all(userId).map(item => ({
    ...item,
    images: JSON.parse(item.images || '[]'),
    total_price: item.unit_price * item.quantity
  }));
};

router.get('/', authenticate, requireApproved, (req, res) => {
  const items = getCart(req.user.id);
  const subtotal = items.reduce((sum, i) => sum + i.total_price, 0);
  res.json({ items, subtotal, item_count: items.reduce((sum, i) => sum + i.quantity, 0) });
});

router.post('/', authenticate, requireApproved, (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id || quantity < 1) return res.status(400).json({ error: 'Invalid product or quantity' });

  const product = db.prepare('SELECT * FROM products WHERE id=? AND is_active=1').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.stock_qty < 1) return res.status(400).json({ error: 'Product out of stock' });

  db.prepare(`
    INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
    ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity
  `).run(req.user.id, product_id, quantity);

  const items = getCart(req.user.id);
  res.json({ items, subtotal: items.reduce((sum, i) => sum + i.total_price, 0) });
});

router.put('/:id', authenticate, requireApproved, (req, res) => {
  const { quantity } = req.body;
  if (quantity < 1) {
    db.prepare('DELETE FROM cart_items WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  } else {
    db.prepare('UPDATE cart_items SET quantity=? WHERE id=? AND user_id=?').run(quantity, req.params.id, req.user.id);
  }
  const items = getCart(req.user.id);
  res.json({ items, subtotal: items.reduce((sum, i) => sum + i.total_price, 0) });
});

router.delete('/:id', authenticate, requireApproved, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  const items = getCart(req.user.id);
  res.json({ items, subtotal: items.reduce((sum, i) => sum + i.total_price, 0) });
});

router.delete('/', authenticate, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id=?').run(req.user.id);
  res.json({ items: [], subtotal: 0 });
});

module.exports = router;
