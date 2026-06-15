const nodemailer = require('nodemailer');

/**
 * Provider-agnostic mailer.
 *
 * Configure via .env (works with Gmail, Resend, SendGrid, Mailgun, etc.):
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=bsdgaragesupply@gmail.com
 *   SMTP_PASS=your-app-password
 *   MAIL_FROM="BSD Garage Supply <bsdgaragesupply@gmail.com>"
 *   ADMIN_EMAIL=bsdgaragesupply@gmail.com
 *
 * If SMTP is not configured, emails are logged to the console instead of sent,
 * so the app keeps working in development. Sending never throws — a mail
 * failure will never break registration or checkout.
 */

const isConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465, // true for 465, false for 587
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

const MAIL_FROM = process.env.MAIL_FROM || 'BSD Garage Supply <no-reply@bsdgaragesupply.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'bsdgaragesupply@gmail.com';

async function sendMail({ to, subject, html, text, replyTo }) {
  if (!to) return { ok: false, skipped: 'no recipient' };

  if (!isConfigured) {
    console.log('\n📧 [email not configured — would have sent]');
    console.log(`   To:      ${to}`);
    console.log(`   Subject: ${subject}\n`);
    return { ok: true, preview: true };
  }

  try {
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
      text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    });
    return { ok: true, id: info.messageId };
  } catch (err) {
    // Never let an email failure break the request flow.
    console.error('📧 Email send failed:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sendMail, isConfigured, ADMIN_EMAIL, MAIL_FROM };
