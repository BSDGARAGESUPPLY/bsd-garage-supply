const router = require('express').Router();
const { getConfig } = require('../lib/doorConfig');

// Public — the builder page reads its options + prices from here.
router.get('/config', (req, res) => res.json(getConfig()));

module.exports = router;
