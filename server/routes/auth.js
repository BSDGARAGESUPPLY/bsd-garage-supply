const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { sendMail } = require('../lib/mailer');
const templates = require('../lib/emailTemplates');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

router.post('/register', async (req, res) => {
  const { email, password, company_name, contact_name, phone, address, city, state, zip, business_type } = req.body;
  if (!email || !password || !company_name || !contact_name || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hash = await bcrypt.hash(password, 12);
  // Open-account model: every new account is active immediately.
  const insert = db.prepare(`
    INSERT INTO users (email, password_hash, company_name, contact_name, phone, address, city, state, zip, business_type, status, approved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', datetime('now'))
  `);
  const result = insert.run(email.toLowerCase(), hash, company_name, contact_name, phone,
    address || null, city || null, state || null, zip || null, business_type || null);
  const full = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  const { password_hash, ...user } = full;
  // Log them in right away so they can shop immediately.
  const token = signToken(user.id);
  res.status(201).json({ token, user, message: 'Account created' });

  // Fire-and-forget welcome email (never blocks or breaks the response).
  const { subject, html } = templates.welcome(user);
  sendMail({ to: user.email, subject, html });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user.id);
  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

router.get('/me', authenticate, (req, res) => {
  const { password_hash, ...safeUser } = req.user;
  res.json(safeUser);
});

router.put('/profile', authenticate, async (req, res) => {
  const { contact_name, phone, address, city, state, zip } = req.body;
  db.prepare(`
    UPDATE users SET contact_name=?, phone=?, address=?, city=?, state=?, zip=? WHERE id=?
  `).run(contact_name, phone, address, city, state, zip, req.user.id);
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  const { password_hash, ...safeUser } = user;
  res.json(safeUser);
});

router.put('/change-password', authenticate, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ error: 'Both passwords required' });
  if (new_password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const valid = await bcrypt.compare(current_password, req.user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Current password incorrect' });

  const hash = await bcrypt.hash(new_password, 12);
  db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash, req.user.id);
  res.json({ message: 'Password updated' });
});

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

// Request a password reset link
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  // Always respond the same way so attackers can't probe which emails exist.
  const generic = { message: 'If an account exists for that email, a reset link is on its way.' };
  if (!email) return res.json(generic);

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return res.json(generic);

  // Create a single-use token (store only its hash).
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  // Invalidate any prior unused tokens for this user, then store the new one.
  db.prepare('UPDATE password_resets SET used=1 WHERE user_id=? AND used=0').run(user.id);
  db.prepare('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?,?,?)')
    .run(user.id, tokenHash, expiresAt);

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;
  const { subject, html } = templates.passwordReset(user, resetUrl);
  sendMail({ to: user.email, subject, html });

  res.json(generic);
});

// Complete a password reset
router.post('/reset-password', async (req, res) => {
  const { token, new_password } = req.body;
  if (!token || !new_password) return res.status(400).json({ error: 'Token and new password required' });
  if (new_password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const tokenHash = sha256(token);
  const row = db.prepare(`
    SELECT * FROM password_resets
    WHERE token_hash = ? AND used = 0 AND expires_at > datetime('now')
  `).get(tokenHash);

  if (!row) return res.status(400).json({ error: 'This reset link is invalid or has expired. Please request a new one.' });

  const hash = await bcrypt.hash(new_password, 12);
  db.exec('BEGIN');
  try {
    db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash, row.user_id);
    db.prepare('UPDATE password_resets SET used=1 WHERE id=?').run(row.id);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    return res.status(500).json({ error: 'Could not reset password' });
  }

  res.json({ message: 'Password reset successfully. You can now sign in with your new password.' });
});

module.exports = router;
