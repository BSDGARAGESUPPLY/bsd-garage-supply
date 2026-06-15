const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../db');
const { fulfillOrder } = require('../lib/fulfillment');

/**
 * Stripe webhook handler. Mounted at POST /api/webhooks/stripe with a RAW body
 * parser (required for signature verification) BEFORE express.json().
 *
 * This is the safety net: even if the customer's browser closes right after
 * paying, Stripe notifies us here and the order is still captured.
 */
module.exports = function stripeWebhook(req, res) {
  // If no webhook secret is configured, accept nothing (avoids unverified writes).
  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.includes('placeholder')) {
    return res.status(200).json({ received: true, skipped: 'webhook not configured' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const order = db.prepare('SELECT id FROM orders WHERE payment_intent_id = ?').get(intent.id);
    if (order) {
      try { fulfillOrder(order.id); } catch (err) { console.error('Webhook fulfill error:', err.message); }
    }
  }

  res.json({ received: true });
};
