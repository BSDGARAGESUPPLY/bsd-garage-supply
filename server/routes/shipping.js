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
  // Pickup only for now — shipping rates will be added once finalized.
  // (Zone/rate tables above are kept for when shipping is re-enabled.)
  res.json({
    rates: [{
      id: 'pickup',
      name: 'Local Pickup',
      carrier: 'BSD Garage Supply',
      cost: 0,
      note: 'FREE',
      estimated_days: '1',
      details: "Pick up at our Estero, FL location — we'll notify you when your order is ready."
    }],
    zone: 0
  });
});

module.exports = router;
