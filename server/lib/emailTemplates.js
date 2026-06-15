/**
 * Branded HTML email templates for BSD Garage Supply.
 * Uses table layout + inline styles for maximum email-client compatibility.
 */

const SITE_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const GOLD = '#C8922A';
const DARK = '#0A0A0A';

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

function layout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background:${DARK};padding:24px 32px;text-align:center;">
          <span style="font-size:26px;font-weight:800;letter-spacing:-0.5px;color:${GOLD};">BSD</span>
          <span style="font-size:11px;font-weight:700;letter-spacing:3px;color:#ffffff;text-transform:uppercase;display:block;margin-top:2px;">Garage Supply</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 32px;">
          ${bodyHtml}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#fafafa;border-top:1px solid #eee;padding:24px 32px;text-align:center;font-size:12px;color:#888;">
          BSD Garage Supply &nbsp;·&nbsp; 1-800-BSD-SPRING &nbsp;·&nbsp; bsdgaragesupply@gmail.com<br>
          <a href="${SITE_URL}" style="color:${GOLD};text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, '')}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function button(label, href) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr>
    <td style="border-radius:980px;background:${GOLD};">
      <a href="${href}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:700;color:#1a1407;text-decoration:none;border-radius:980px;">${label}</a>
    </td></tr></table>`;
}

function itemsTable(items) {
  const rows = items.map(it => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;">
        <strong>${it.product_name || it.name}</strong><br>
        <span style="color:#999;font-size:12px;">SKU: ${it.product_sku || it.sku} &nbsp;·&nbsp; Qty: ${it.quantity}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;text-align:right;white-space:nowrap;">
        ${money(it.total_price ?? (it.unit_price * it.quantity))}
      </td>
    </tr>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;">${rows}</table>`;
}

// ── Welcome ──────────────────────────────────────────────────────────────────
function welcome(user) {
  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;">Welcome, ${user.contact_name || user.company_name}! 👋</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">
      Your BSD Garage Supply account is ready. You can now see live pricing on our full
      catalog of torsion springs and hardware, place orders online, and track every shipment.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#444;">
      Need a part fast? Orders placed before 2pm CT ship the same day.
    </p>
    ${button('Browse the Catalog', SITE_URL + '/catalog')}
    <p style="margin:16px 0 0;font-size:13px;color:#888;">Signed in as <strong>${user.email}</strong></p>`;
  return { subject: 'Welcome to BSD Garage Supply', html: layout('Welcome', body) };
}

// ── Order confirmation (to customer) ─────────────────────────────────────────
function orderConfirmation(order, items) {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;">Order confirmed ✅</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#444;">Thanks for your order! We're getting it ready.</p>
    <p style="margin:0 0 20px;font-size:14px;color:#888;">Order <strong style="color:${GOLD};">${order.order_number}</strong></p>
    ${itemsTable(items)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;">Subtotal</td><td style="padding:4px 0;text-align:right;">${money(order.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Shipping</td><td style="padding:4px 0;text-align:right;">${money(order.shipping_cost)}</td></tr>
      <tr><td style="padding:8px 0;font-weight:800;font-size:16px;border-top:2px solid #eee;">Total</td>
          <td style="padding:8px 0;text-align:right;font-weight:800;font-size:16px;border-top:2px solid #eee;color:${GOLD};">${money(order.total)}</td></tr>
    </table>
    <p style="margin:18px 0 0;font-size:14px;color:#444;">
      Shipping to:<br>
      <span style="color:#666;">${order.shipping_name}<br>${order.shipping_address}<br>${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}</span>
    </p>
    ${button('View Your Order', SITE_URL + '/orders/' + order.id)}`;
  return { subject: `Order ${order.order_number} confirmed — BSD Garage Supply`, html: layout('Order confirmed', body) };
}

// ── New order alert (to admin/owner) ─────────────────────────────────────────
function newOrderAdmin(order, items, customer) {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;">🛒 New order received</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#444;"><strong>${order.order_number}</strong> &nbsp;·&nbsp; ${money(order.total)}</p>
    <p style="margin:0 0 20px;font-size:14px;color:#888;">
      ${customer?.company_name || ''} (${customer?.contact_name || ''})<br>${customer?.email || ''} &nbsp;·&nbsp; ${customer?.phone || ''}
    </p>
    ${itemsTable(items)}
    <p style="margin:8px 0 0;font-size:15px;font-weight:700;">Total: <span style="color:${GOLD};">${money(order.total)}</span></p>
    <p style="margin:18px 0 0;font-size:14px;color:#444;">Ship to:<br>
      <span style="color:#666;">${order.shipping_name}<br>${order.shipping_address}<br>${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}</span></p>
    ${button('Open in Admin', SITE_URL + '/admin/orders')}`;
  return { subject: `New order ${order.order_number} — ${money(order.total)}`, html: layout('New order', body) };
}

// ── Shipped (to customer) ────────────────────────────────────────────────────
function orderShipped(order) {
  const tracking = order.tracking_number
    ? `<p style="margin:0 0 4px;font-size:15px;color:#444;">Carrier: <strong>${order.shipping_carrier || 'See tracking'}</strong></p>
       <p style="margin:0 0 16px;font-size:15px;color:#444;">Tracking #: <strong style="color:${GOLD};">${order.tracking_number}</strong></p>`
    : '';
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;">Your order shipped 📦</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#444;">Good news — order <strong>${order.order_number}</strong> is on its way.</p>
    ${tracking}
    ${button('Track Your Order', SITE_URL + '/orders/' + order.id)}`;
  return { subject: `Order ${order.order_number} has shipped — BSD Garage Supply`, html: layout('Shipped', body) };
}

// ── Password reset (to customer) ─────────────────────────────────────────────
function passwordReset(user, resetUrl) {
  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;">Reset your password</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">
      We received a request to reset the password for your BSD Garage Supply account
      (<strong>${user.email}</strong>). Click the button below to choose a new one.
    </p>
    ${button('Reset Password', resetUrl)}
    <p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:#888;">
      This link expires in 1 hour. If you didn't request this, you can safely ignore
      this email — your password won't change.
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:#aaa;word-break:break-all;">
      Button not working? Copy and paste this link:<br>${resetUrl}
    </p>`;
  return { subject: 'Reset your BSD Garage Supply password', html: layout('Reset password', body) };
}

// ── Contact form message (to owner) ──────────────────────────────────────────
function contactMessage({ name, email, phone, subject, message }) {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;">📨 New contact message</h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      <tr><td style="padding:6px 0;color:#888;width:90px;">From</td><td style="padding:6px 0;"><strong>${name}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:${GOLD};">${email}</a></td></tr>
      ${phone ? `<tr><td style="padding:6px 0;color:#888;">Phone</td><td style="padding:6px 0;">${phone}</td></tr>` : ''}
      ${subject ? `<tr><td style="padding:6px 0;color:#888;">Subject</td><td style="padding:6px 0;">${subject}</td></tr>` : ''}
    </table>
    <div style="margin-top:16px;padding:16px;background:#f7f7f7;border-radius:10px;font-size:14px;line-height:1.6;color:#333;white-space:pre-wrap;">${(message || '').replace(/</g, '&lt;')}</div>
    <p style="margin:16px 0 0;font-size:13px;color:#888;">Reply directly to this email to respond to ${name}.</p>`;
  return { subject: `Contact form: ${subject || 'New message'} — from ${name}`, html: layout('Contact message', body) };
}

module.exports = { welcome, orderConfirmation, newOrderAdmin, orderShipped, passwordReset, contactMessage };
