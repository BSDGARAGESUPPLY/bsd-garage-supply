require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Ensure the database is set up (admin, categories, products) on first boot.
const db = require('./db');
const { ensureSeed } = require('./seed-prod');
try { ensureSeed(db); } catch (e) { console.error('Seed error:', e.message); }

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Stripe webhook needs the RAW body for signature verification — mount BEFORE express.json()
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), require('./routes/stripe-webhook'));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth/', authLimiter);

// Public runtime config — exposes the Stripe PUBLISHABLE key (safe to be public).
// Served at runtime so it always reflects the current env var, no rebuild needed.
app.get('/api/config', (req, res) => {
  res.json({
    stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLIC_KEY || '',
    taxPercent: parseFloat(process.env.SALES_TAX_PERCENT || '6.5')
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/contact', require('./routes/contact'));

// Serve static uploads (from the persistent data directory)
const { UPLOADS_DIR } = require('./config');
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve built client in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
