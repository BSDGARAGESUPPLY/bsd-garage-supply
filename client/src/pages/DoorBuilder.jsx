import { useState, useMemo, useEffect } from 'react';
import api from '../api';
import './DoorBuilder.css';

const money = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// Static labels/types per option group — the choices + prices come from the API
// (Admin → Door Builder), so the owner can edit prices without touching code.
const GROUP_META = {
  size: { key: 'sizes', label: 'Size', type: 'pill' },
  style: { key: 'styles', label: 'Panel Style', type: 'pill' },
  color: { key: 'colors', label: 'Color', type: 'swatch' },
  windows: { key: 'windows', label: 'Windows', type: 'pill' },
  insulation: { key: 'insulation', label: 'Insulation', type: 'pill' },
  hardware: { key: 'hardware', label: 'Decorative Hardware', type: 'pill' },
};

// ── Door illustration ────────────────────────────────────────────────────────
// Lighten (pct>0) or darken (pct<0) a hex color toward white/black.
function shade(hex, pct) {
  let h = String(hex || '#f3f3f0').replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  let r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const t = pct < 0 ? 0 : 255, p = Math.min(1, Math.abs(pct));
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return `rgb(${r},${g},${b})`;
}

// A raised, beveled rectangular panel: highlight on top/left, shadow on bottom/right,
// sitting in a recessed groove — the classic embossed steel short-panel look.
function raisedPanel(kp, x, y, w, h, color) {
  const b = Math.max(2.4, Math.min(6, Math.min(w, h) * 0.17));
  return [
    <rect key={kp + 'g'} x={x - 1.2} y={y - 1.2} width={w + 2.4} height={h + 2.4} rx="3.5" fill={shade(color, -0.17)} />,
    <polygon key={kp + 't'} points={`${x},${y} ${x + w},${y} ${x + w - b},${y + b} ${x + b},${y + b}`} fill={shade(color, 0.34)} />,
    <polygon key={kp + 'l'} points={`${x},${y} ${x + b},${y + b} ${x + b},${y + h - b} ${x},${y + h}`} fill={shade(color, 0.15)} />,
    <polygon key={kp + 'r'} points={`${x + w},${y} ${x + w},${y + h} ${x + w - b},${y + h - b} ${x + w - b},${y + b}`} fill={shade(color, -0.15)} />,
    <polygon key={kp + 'bo'} points={`${x},${y + h} ${x + w},${y + h} ${x + w - b},${y + h - b} ${x + b},${y + h - b}`} fill={shade(color, -0.27)} />,
    <rect key={kp + 'c'} x={x + b} y={y + b} width={w - 2 * b} height={h - 2 * b} rx="1.5" fill={shade(color, 0.05)} />,
  ];
}

// A window lite: beveled frame + glass, optionally arched.
function windowLite(kp, x, y, w, h, arch, cathedral, color) {
  const b = Math.max(2.2, Math.min(5, Math.min(w, h) * 0.14));
  const gx = x + b, gy = y + b, gw = w - 2 * b, gh = h - 2 * b, r = gw / 2;
  const out = [
    <rect key={kp + 'g'} x={x - 1} y={y - 1} width={w + 2} height={h + 2} rx="3" fill={shade(color, -0.15)} />,
    <polygon key={kp + 't'} points={`${x},${y} ${x + w},${y} ${x + w - b},${y + b} ${x + b},${y + b}`} fill={shade(color, 0.32)} />,
    <polygon key={kp + 'l'} points={`${x},${y} ${x + b},${y + b} ${x + b},${y + h - b} ${x},${y + h}`} fill={shade(color, 0.15)} />,
    <polygon key={kp + 'r'} points={`${x + w},${y} ${x + w},${y + h} ${x + w - b},${y + h - b} ${x + w - b},${y + b}`} fill={shade(color, -0.15)} />,
    <polygon key={kp + 'bo'} points={`${x},${y + h} ${x + w},${y + h} ${x + w - b},${y + h - b} ${x + b},${y + h - b}`} fill={shade(color, -0.25)} />,
  ];
  if (arch) {
    out.push(<path key={kp + 'gl'} d={`M${gx},${gy + gh} L${gx},${gy + r} A${r},${r} 0 0 1 ${gx + gw},${gy + r} L${gx + gw},${gy + gh} Z`} fill="url(#glass)" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" />);
  } else {
    out.push(<rect key={kp + 'gl'} x={gx} y={gy} width={gw} height={gh} rx="1" fill="url(#glass)" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" />);
  }
  if (cathedral) out.push(<line key={kp + 'm'} x1={gx + gw / 2} y1={gy} x2={gx + gw / 2} y2={gy + gh} stroke="rgba(0,0,0,0.22)" strokeWidth="1" />);
  return out;
}

function DoorPreview({ ratio, colorHex, style, windows, hardware, wFeet, dark }) {
  const VBW = 460, VBH = 360, groundY = 318;
  const BOX_W = 360, BOX_H = 236, boxRatio = BOX_W / BOX_H;
  let doorW, doorH;
  if (ratio > boxRatio) { doorW = BOX_W; doorH = BOX_W / ratio; }
  else { doorH = BOX_H; doorW = BOX_H * ratio; }
  const left = (VBW - doorW) / 2;
  const top = groundY - doorH;
  const sections = 4;
  const secH = doorH / sections;
  const color = colorHex || '#f3f3f0';
  const cols = Math.min(9, Math.max(2, Math.round((wFeet || 16) / 2))); // ~1 panel per 2 ft
  const field = shade(color, -0.05); // recessed section field
  const showHardware = hardware === 'carriage';
  const arch = windows === 'arched' || windows === 'cathedral';

  const els = [];
  for (let s = 0; s < sections; s++) {
    const y = top + s * secH;
    els.push(<rect key={`sec${s}`} x={left} y={y} width={doorW} height={secH} fill={field} />);
    const mX = Math.max(6, doorW * 0.025);

    if (s === 0 && windows !== 'none') {
      const mY = secH * 0.18, gap = 6, ww = (doorW - mX * 2 - gap * (cols - 1)) / cols;
      for (let i = 0; i < cols; i++) els.push(...windowLite(`w${i}`, left + mX + i * (ww + gap), y + mY, ww, secH - mY * 2, arch, windows === 'cathedral', color));
    } else if (style === 'flush') {
      // flat section — no raised panels
    } else if (style === 'long') {
      const mY = secH * 0.16, pTop = y + mY, pH = secH - mY * 2;
      const n = doorW > 300 ? 2 : 1, gap = 9, pw = (doorW - mX * 2 - gap * (n - 1)) / n;
      for (let i = 0; i < n; i++) els.push(...raisedPanel(`lp${s}-${i}`, left + mX + i * (pw + gap), pTop, pw, pH, color));
    } else if (style === 'carriage') {
      const mY = secH * 0.14, pTop = y + mY, pH = secH - mY * 2;
      const planks = Math.min(12, Math.max(4, cols * 2)), gap = 2.4, pw = (doorW - mX * 2 - gap * (planks - 1)) / planks;
      for (let i = 0; i < planks; i++) els.push(...raisedPanel(`cp${s}-${i}`, left + mX + i * (pw + gap), pTop, pw, pH, color));
    } else { // short
      const mY = secH * 0.16, pTop = y + mY, pH = secH - mY * 2;
      const gap = 6, pw = (doorW - mX * 2 - gap * (cols - 1)) / cols;
      for (let i = 0; i < cols; i++) els.push(...raisedPanel(`sp${s}-${i}`, left + mX + i * (pw + gap), pTop, pw, pH, color));
    }
    // recessed horizontal seam between sections
    if (s > 0) els.push(<rect key={`seam${s}`} x={left} y={y - 1} width={doorW} height="2" fill={shade(color, -0.2)} />);
  }

  // Decorative hardware — strap hinges at each side + two pull handles
  if (showHardware) {
    for (let s = 1; s < sections; s++) {
      const y = top + s * secH;
      els.push(<rect key={`hgl${s}`} x={left + 6} y={y - 4} width={doorW * 0.13} height="8" rx="2" fill="#17181a" />);
      els.push(<rect key={`hgr${s}`} x={left + doorW - 6 - doorW * 0.13} y={y - 4} width={doorW * 0.13} height="8" rx="2" fill="#17181a" />);
    }
    const hy = top + secH * 3 + secH * 0.5;
    els.push(<rect key="hl" x={left + doorW * 0.38} y={hy} width="7" height="18" rx="2" fill="#17181a" />);
    els.push(<rect key="hr" x={left + doorW * 0.62 - 7} y={hy} width="7" height="18" rx="2" fill="#17181a" />);
  }

  return (
    <svg viewBox={`0 0 ${VBW} ${VBH}`} className="door-svg" role="img" aria-label="Garage door preview">
      <defs>
        <linearGradient id="wallg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dark ? '#20242c' : '#eef1f4'} />
          <stop offset="1" stopColor={dark ? '#171a20' : '#e3e7ec'} />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#eaf2f8" />
          <stop offset="0.5" stopColor="#cfe0ec" />
          <stop offset="1" stopColor="#e3edf4" />
        </linearGradient>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.16 0 0 0 0" /></filter>
      </defs>
      <rect x="0" y="0" width={VBW} height={groundY} fill="url(#wallg)" />
      <rect x="0" y={groundY} width={VBW} height={VBH - groundY} fill={dark ? '#0f1116' : '#cfd3d9'} />
      {/* soft shadow under the door */}
      <ellipse cx={VBW / 2} cy={groundY + 8} rx={doorW * 0.55} ry="10" fill="rgba(0,0,0,0.18)" />
      {/* opening surround */}
      <rect x={left - 8} y={top - 8} width={doorW + 16} height={doorH + 8} fill="none" stroke={dark ? '#3a4150' : '#cbd0d8'} strokeWidth="7" />
      {els}
      {/* subtle steel/stucco grain over the door */}
      <rect x={left} y={top} width={doorW} height={doorH} filter="url(#grain)" opacity="0.5" pointerEvents="none" />
      {/* door outer edge */}
      <rect x={left} y={top} width={doorW} height={doorH} fill="none" stroke={shade(color, -0.28)} strokeWidth="1.4" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DoorBuilder() {
  const [sel, setSel] = useState({ size: '16x7', style: 'short', color: 'white', windows: 'none', insulation: 'none', hardware: 'none' });
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [lead, setLead] = useState({ name: '', email: '', phone: '', zip: '', notes: '' });
  const [status, setStatus] = useState({ sending: false, done: false, error: '' });
  const [cfg, setCfg] = useState(null);

  useEffect(() => { api.get('/door-builder/config').then(r => setCfg(r.data)).catch(() => setCfg(false)); }, []);

  // Build the option groups from the fetched config (choices + prices come from admin).
  const OPTIONS = useMemo(() => {
    if (!cfg) return {};
    const o = {};
    for (const [group, meta] of Object.entries(GROUP_META)) o[group] = { label: meta.label, type: meta.type, choices: cfg[meta.key] || [] };
    return o;
  }, [cfg]);
  const showPrices = cfg ? cfg.showPrices !== false : true;

  const chosen = useMemo(() => {
    const o = {};
    for (const key of Object.keys(OPTIONS)) o[key] = (OPTIONS[key].choices.find(c => c.id === sel[key]) || OPTIONS[key].choices[0]);
    return o;
  }, [OPTIONS, sel]);

  const price = useMemo(() => {
    return (chosen.size?.base || 0) + ['style', 'color', 'windows', 'insulation', 'hardware'].reduce((a, k) => a + (chosen[k]?.add || 0), 0);
  }, [chosen]);

  const ratio = (chosen.size?.w || 16) / (chosen.size?.h || 7);
  const configForEmail = {
    Size: chosen.size?.label, 'Panel Style': chosen.style?.label, Color: chosen.color?.label,
    Windows: chosen.windows?.label, Insulation: chosen.insulation?.label, Hardware: chosen.hardware?.label,
  };

  const pick = (group, id) => setSel(s => ({ ...s, [group]: id }));

  const submitQuote = async (e) => {
    e.preventDefault();
    setStatus({ sending: true, done: false, error: '' });
    try {
      const { data } = await api.post('/contact/door-quote', { ...lead, config: configForEmail, estPrice: showPrices ? price : null });
      setStatus({ sending: false, done: true, error: '', message: data.message });
    } catch (err) {
      setStatus({ sending: false, done: false, error: err.response?.data?.error || 'Could not send. Please call us at 1-888-844-4701.' });
    }
  };

  if (!cfg) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="db-page">
      <div className="db-hero">
        <div className="container">
          <h1>Build &amp; Personalize Your Garage Door</h1>
          <p>Pick your size, style, color, and options — see it come to life, then request your free quote.</p>
        </div>
      </div>

      <div className="container db-layout">
        {/* Preview */}
        <div className="db-preview-col">
          <div className="db-preview">
            <DoorPreview ratio={ratio} colorHex={chosen.color?.hex || '#f3f3f0'} style={sel.style} windows={sel.windows} hardware={sel.hardware} wFeet={chosen.size?.w} />
          </div>
          <div className="db-summary">
            {showPrices && (
              <div className="db-price">
                <span className="db-price-label">Estimated from</span>
                <span className="db-price-value">{money(price)}</span>
              </div>
            )}
            <ul className="db-config">
              {Object.entries(configForEmail).map(([k, v]) => (
                <li key={k}><span>{k}</span><strong>{v}</strong></li>
              ))}
            </ul>
            <button className="btn btn-primary btn-lg btn-full" onClick={() => { setStatus({ sending: false, done: false, error: '' }); setQuoteOpen(true); }}>Request My Quote →</button>
            <p className="db-price-note">{showPrices ? "Estimate only — we'll confirm your exact price in your quote. " : 'Design your door and request a free, no-obligation quote. '}Free local delivery in Cape Coral, FL.</p>
          </div>
        </div>

        {/* Options */}
        <div className="db-options-col">
          {Object.entries(OPTIONS).map(([key, group]) => (
            <div key={key} className="db-group">
              <div className="db-group-label">{group.label}</div>
              <div className={`db-choices ${group.type}`}>
                {group.choices.map(c => {
                  const active = sel[key] === c.id;
                  if (group.type === 'swatch') {
                    return (
                      <button key={c.id} className={`db-swatch ${active ? 'active' : ''}`} onClick={() => pick(key, c.id)} title={c.label}>
                        <span className="db-swatch-dot" style={{ background: c.hex }} />
                        <span className="db-swatch-label">{c.label}</span>
                      </button>
                    );
                  }
                  return (
                    <button key={c.id} className={`db-pill ${active ? 'active' : ''}`} onClick={() => pick(key, c.id)}>
                      {c.label}{showPrices && c.add > 0 && <span className="db-add">+{money(c.add)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote modal */}
      {quoteOpen && (
        <div className="modal-overlay" onClick={() => setQuoteOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Your Quote</h2>
              <button className="modal-close" onClick={() => setQuoteOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {status.done ? (
                <div className="text-center" style={{ padding: '24px 0' }}>
                  <div style={{ fontSize: '46px' }}>✅</div>
                  <h3 style={{ margin: '10px 0' }}>Request sent!</h3>
                  <p className="text-muted">{status.message}</p>
                </div>
              ) : (
                <form onSubmit={submitQuote} className="checkout-form">
                  {status.error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{status.error}</div>}
                  <div className="db-quote-config">
                    {Object.entries(configForEmail).map(([k, v]) => <span key={k}><b>{k}:</b> {v}</span>)}
                    {showPrices && <span className="db-quote-price">Est. {money(price)}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label required">Name</label>
                      <input className="form-input" required value={lead.name} onChange={e => setLead({ ...lead, name: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label required">Email</label>
                      <input className="form-input" type="email" required value={lead.email} onChange={e => setLead({ ...lead, email: e.target.value })} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Phone</label>
                      <input className="form-input" value={lead.phone} onChange={e => setLead({ ...lead, phone: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">ZIP</label>
                      <input className="form-input" value={lead.zip} onChange={e => setLead({ ...lead, zip: e.target.value })} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Notes (optional)</label>
                    <textarea className="form-textarea" rows={3} value={lead.notes} onChange={e => setLead({ ...lead, notes: e.target.value })} placeholder="Install needed? Timeline? Anything else…" /></div>
                  <button type="submit" className={`btn btn-primary btn-lg btn-full ${status.sending ? 'btn-loading' : ''}`} disabled={status.sending}>Send My Request</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
