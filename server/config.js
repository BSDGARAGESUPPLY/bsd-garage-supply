const path = require('path');

/**
 * Central place for filesystem paths.
 *
 * In production (e.g. Railway), set DATA_DIR to a persistent volume mount
 * (like /data) so the SQLite database and uploaded product photos survive
 * restarts and redeploys. Locally it defaults to the project root.
 */
const ROOT = path.join(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR || ROOT;

module.exports = {
  DATA_DIR,
  DB_PATH: path.join(DATA_DIR, 'data.db'),
  UPLOADS_DIR: path.join(DATA_DIR, 'uploads'),
};
