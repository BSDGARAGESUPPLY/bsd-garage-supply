const jwt = require('jsonwebtoken');
const db = require('../db');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Only approved accounts may add to cart / order.
const requireApproved = (req, res, next) => {
  if (req.user.status !== 'approved' && !req.user.is_admin) {
    return res.status(403).json({ error: 'Your account is pending approval. We\'ll email you once it\'s active.' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, requireApproved, requireAdmin };
