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
  const loggedIn = !!user;
  const { retail_price, wholesale_price, ...rest } = product;
  return {
    ...rest,
    specifications: JSON.parse(product.specifications || '{}'),
    images: JSON.parse(product.images || '[]'),
    // Single price, only revealed to signed-in account holders
    price: loggedIn ? product.retail_price : null,
    requires_login: !loggedIn
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
  res.json(formatProduct(product, req.user));
});

module.exports = router;
