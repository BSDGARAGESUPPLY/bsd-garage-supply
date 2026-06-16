const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const categories = db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) AS product_count
    FROM categories c
    ORDER BY c.sort_order, c.name
  `).all();
  res.json(categories);
});

module.exports = router;
