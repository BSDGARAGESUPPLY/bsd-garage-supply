const router = require('express').Router();
const { authenticate, requireApproved } = require('../middleware/auth');

// Shipping zones by state
const ZONES = {
  1: ['CT','DE','MA','MD','ME','NH','NJ','NY','PA','RI','VT'],
  2: ['AL','FL','GA','IL','IN','KY','MI','MS','NC','OH','SC','TN','VA','WV','WI'],
  3: ['AR','IA','KS','LA','MN','MO','NE','ND','OK','SD','TX'],
  4: ['AZ','CO','ID','MT','NM','NV','OR','UT','WA','WY'],
  5: ['AK','CA','HI']
};

const BASE_RATES = {
  ground:   { name: 'Ground Shipping (5-7 business days)',   carrier: 'UPS',   base: [0,8.50,9.75,11.25,13.50,18.00] },
  express3: { name: '3-Day Express',                          carrier: 'UPS',   base: [0,15.00,17.50,20.00,24.00,32.00] },
  express2: { name: '2-Day Air',                              carrier: 'FedEx', base: [0,22.00,25.00,29.00,34.00,45.00] },
  overnight:{ name: 'Overnight',                              carrier: 'FedEx', base: [0,45.00,52.00,60.00,70.00,90.00] }
};
const PER_LB = 0.35;
const FREE_GROUND_THRESHOLD = 500;

function getZone(state) {
  for (const [zone, states] of Object.entries(ZONES)) {
    if (states.includes(state?.toUpperCase())) return parseInt(zone);
  }
  return 3; // default
}

router.post('/rates', authenticate, requireApproved, (req, res) => {
  const { state, weight, subtotal } = req.body;
  if (!state) return res.status(400).json({ error: 'State required' });

  const zone = getZone(state);
  const weightNum = parseFloat(weight) || 5;

  const rates = Object.entries(BASE_RATES).map(([id, method]) => {
    let cost = method.base[zone] + weightNum * PER_LB;
    let note = '';
    if (id === 'ground' && subtotal >= FREE_GROUND_THRESHOLD) {
      cost = 0;
      note = 'FREE on orders over $500';
    }
    return {
      id,
      name: method.name,
      carrier: method.carrier,
      cost: parseFloat(cost.toFixed(2)),
      note,
      estimated_days: { ground: '5-7', express3: '3', express2: '2', overnight: '1' }[id]
    };
  });

  res.json({ rates, zone });
});

module.exports = router;
