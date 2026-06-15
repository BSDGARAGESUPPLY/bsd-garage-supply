const nodemailer = require('nodemailer');

/**
 * Email sender with two backends:
 *
 *  1. Resend (HTTPS API)  — preferred in production. Cloud hosts like Railway
 *     block outbound SMTP, so we send over HTTPS instead.
 *       RESEND_API_KEY=re_xxx
 *       MAIL_FROM="BSD Garage Supply <orders@bsdgaragesupply.com>"  (verified domain)
 *
 *  2. SMTP (nodemailer)   — fallback, mainly for local development.
 *       SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
 *
 * If neither is configured, emails are logged to the console. Sending never
 * throws — a mail failure will never break registration or checkout.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const useResend = !!RESEND_API_KEY;
const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const isConfigured = useResend || smtpConfigured;

const MAIL_FROM = process.env.MAIL_FROM || 'BSD Garage Supply <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'bsdgaragesupply@gmail.com';

// SMTP transport (only built if we're actually using SMTP). Timeouts prevent
// indefinite hangs if a host blocks the SMTP ports.
let transporter = null;
if (!useResend && smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

async function sendViaResend({ to, subject, html, replyTo }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
  const data = await res.json();
  return { ok: true, id: data.id };
}

async function sendMail({ to, subject, html, text, replyTo }) {
  if (!to) return { ok: false, skipped: 'no recipient' };

  if (!isConfigured) {
    console.log('\n📧 [email not configured — would have sent]');
    console.log(`   To:      ${to}`);
    console.log(`   Subject: ${subject}\n`);
    return { ok: true, preview: true };
  }

  try {
    if (useResend) {
      return await sendViaResend({ to, subject, html, replyTo });
    }
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
      text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    });
    return { ok: true, id: info.messageId };
  } catch (err) {
    console.error('📧 Email send failed:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sendMail, isConfigured, ADMIN_EMAIL, MAIL_FROM };
