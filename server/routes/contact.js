const router = require('express').Router();
const { sendMail, ADMIN_EMAIL } = require('../lib/mailer');
const templates = require('../lib/emailTemplates');

// Public contact form — emails the owner. Reply-To is the sender.
router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: 'Message is too long' });
  }

  const tpl = templates.contactMessage({ name, email, phone, subject, message });
  const result = await sendMail({ to: ADMIN_EMAIL, subject: tpl.subject, html: tpl.html, replyTo: email });

  if (!result.ok) return res.status(500).json({ error: 'Could not send your message. Please email us directly.' });
  res.json({ message: "Thanks for reaching out! We'll get back to you within one business day." });
});

// Door builder quote request — emails the owner the exact configuration.
router.post('/door-quote', async (req, res) => {
  const { name, email, phone, zip, notes, config, estPrice } = req.body;
  if (!name || !email || !config || typeof config !== 'object') {
    return res.status(400).json({ error: 'Name, email, and your door selections are required.' });
  }
  const owner = templates.doorQuoteOwner({ name, email, phone, zip, notes, config, estPrice });
  const result = await sendMail({ to: ADMIN_EMAIL, subject: owner.subject, html: owner.html, replyTo: email });
  // Confirmation to the customer (best effort — never blocks the request).
  try {
    const cust = templates.doorQuoteCustomer({ name, config, estPrice });
    await sendMail({ to: email, subject: cust.subject, html: cust.html });
  } catch { /* ignore */ }

  if (!result.ok) return res.status(500).json({ error: 'Could not send your request. Please call us at 1-888-844-4701.' });
  res.json({ message: "Your custom door request is in! We'll get back to you with a quote within one business day." });
});

module.exports = router;
