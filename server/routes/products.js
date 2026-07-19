const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// Optionally attach user context (not required)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      req.user = db.prepare('SELECT * FROM users WHERE id=?').get(decoded.id);
    } catch {}
  }
  next();
};

const formatProduct = (product, user) => {
  const approved = user && (user.status === 'approved' || user.is_admin);
  // Tier: 'tech' → wholesale price, 'client' → retail price. Admins see tech pricing.
  const tier = approved ? (user.price_tier || (user.is_admin ? 'tech' : 'client')) : null;
  const { retail_price, wholesale_price, ...rest } = product;
  let price = null;
  if (approved) price = tier === 'tech' ? product.wholesale_price : product.retail_price;
  return {
    ...rest,
    specifications: JSON.parse(product.specifications || '{}'),
    images: JSON.parse(product.images || '[]'),
    price,
    price_tier: tier,
    requires_login: !user,        // not logged in
    pending: !!user && !approved  // logged in but awaiting approval
  };
};

router.get('/', optionalAuth, (req, res) => {
  const { category, search, sort = 'name', page = 1, limit = 24 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
  `;
  const params = [];

  if (category) {
    query += ' AND c.slug = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const sortMap = {
    name: 'p.name ASC',
    price_asc: 'p.retail_price ASC',
    price_desc: 'p.retail_price DESC',
    newest: 'p.created_at DESC'
  };
  query += ` ORDER BY ${sortMap[sort] || 'p.name ASC'}`;

  const total = db.prepare(`SELECT COUNT(*) as count FROM (${query})`).get(...params).count;
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const products = db.prepare(query).all(...params).map(p => formatProduct(p, req.user));
  res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

router.get('/:slug', optionalAuth, (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE (p.slug = ? OR p.id = ?) AND p.is_active = 1
  `).get(req.params.slug, parseInt(req.params.slug) || 0);

  if (!product) return res.status(404).json({ error: 'Product not found' });
  const result = formatProduct(product, req.user);

  // Torsion-spring L/R pair: attach both winds as selectable variants + a size-only pair name.
  const m = product.sku && product.sku.match(/^(.*)-([LR])$/);
  if (m) {
    const siblings = db.prepare('SELECT * FROM products WHERE sku LIKE ? AND is_active = 1').all(m[1] + '-%');
    if (siblings.length > 1) {
      result.variants = siblings.map(s => {
        const fs = formatProduct(s, req.user);
        return {
          id: s.id, slug: s.slug, sku: s.sku,
          wind: fs.specifications['Wind Direction'] || (s.sku.endsWith('-L') ? 'Left Wind' : 'Right Wind'),
          stock_qty: s.stock_qty, price: fs.price, weight: s.weight
        };
      }).sort((a, b) => a.wind.localeCompare(b.wind)); // Left before Right
      result.pair_name = product.name.replace(/\s*[—-]\s*(Left|Right)\s*Wind\s*$/i, '').trim();
    }
  }
  res.json(result);
});

module.exports = router;
