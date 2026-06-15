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

module.exports = router;
