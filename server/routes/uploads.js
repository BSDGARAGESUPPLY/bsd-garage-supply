const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { UPLOADS_DIR } = require('../config');

// Ensure upload directory exists
const UPLOAD_DIR = path.join(UPLOADS_DIR, 'products');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safe = path.basename(file.originalname, ext)
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);
    const unique = `${safe || 'image'}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, unique);
  }
});

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 8 }, // 8MB each, up to 8 files
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP, GIF, or AVIF images are allowed'));
  }
});

// POST /api/uploads/images  — admin only, multipart field name "images"
router.post('/images', authenticate, requireAdmin, (req, res) => {
  upload.array('images', 8)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    const urls = req.files.map(f => `/uploads/products/${f.filename}`);
    res.status(201).json({ urls });
  });
});

// DELETE /api/uploads/images — remove a previously uploaded file
router.delete('/images', authenticate, requireAdmin, (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith('/uploads/products/')) {
    return res.status(400).json({ error: 'Invalid url' });
  }
  const filename = path.basename(url);
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.unlink(filePath, (err) => {
    // Ignore "file not found" — treat as success so the UI can always clean up
    if (err && err.code !== 'ENOENT') return res.status(500).json({ error: 'Could not delete file' });
    res.json({ message: 'Deleted' });
  });
});

module.exports = router;
