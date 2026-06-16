const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  // Count Left/Right spring pairs as a single product (matches the merged catalog view).
  const categories = db.prepare(`
    SELECT c.*,
      (SELECT COUNT(DISTINCT
         CASE WHEN p.sku GLOB '*-[LR]' THEN substr(p.sku, 1, length(p.sku) - 2) ELSE p.sku END
       ) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) AS product_count
    FROM categories c
    ORDER BY c.sort_order, c.name
  `).all();
  res.json(categories);
});

module.exports = router;
