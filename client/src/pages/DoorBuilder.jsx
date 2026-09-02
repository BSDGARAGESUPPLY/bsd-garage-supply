import { useState, useMemo } from 'react';
import api from '../api';
import './DoorBuilder.css';

const money = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// ── Options (estimates — owner can adjust) ───────────────────────────────────
const OPTIONS = {
  size: {
    label: 'Size', type: 'pill',
    choices: [
      { id: '8x7', label: `8′ × 7′`, w: 8, h: 7, base: 640 },
      { id: '9x7', label: `9′ × 7′`, w: 9, h: 7, base: 690 },
      { id: '10x7', label: `10′ × 7′`, w: 10, h: 7, base: 740 },
      { id: '9x8', label: `9′ × 8′`, w: 9, h: 8, base: 760 },
      { id: '16x7', label: `16′ × 7′`, w: 16, h: 7, base: 1160 },
      { id: '16x8', label: `16′ × 8′`, w: 16, h: 8, base: 1290 },
      { id: '18x7', label: `18′ × 7′`, w: 18, h: 7, base: 1360 },
    ],
  },
  style: {
    label: 'Panel Style', type: 'pill',
    choices: [
      { id: 'short', label: 'Short Panel', add: 0 },
      { id: 'long', label: 'Long Panel', add: 0 },
      { id: 'flush', label: 'Flush', add: 0 },
      { id: 'carriage', label: 'Carriage House', add: 260 },
    ],
  },
  color: {
    label: 'Color', type: 'swatch',
    choices: [
      { id: 'white', label: 'White', hex: '#f3f3f0', add: 0 },
      { id: 'almond', label: 'Almond', hex: '#e7ddc6', add: 0 },
      { id: 'sandstone', label: 'Sandstone', hex: '#d6c6a3', add: 40 },
      { id: 'clay', label: 'Terra Clay', hex: '#a9603f', add: 60 },
      { id: 'brown', label: 'Brown', hex: '#5c4030', add: 60 },
      { id: 'charcoal', label: 'Charcoal', hex: '#3b3e43', add: 60 },
      { id: 'black', label: 'Black', hex: '#1e1f21', add: 80 },
    ],
  },
  windows: {
    label: 'Windows', type: 'pill',
    choices: [
      { id: 'none', label: 'No Windows', add: 0 },
      { id: 'plain', label: 'Top Row', add: 190 },
      { id: 'arched', label: 'Arched', add: 270 },
      { id: 'cathedral', label: 'Cathedral', add: 320 },
    ],
  },
  insulation: {
    label: 'Insulation', type: 'pill',
    choices: [
      { id: 'none', label: 'Non-Insulated', add: 0 },
      { id: 'r9', label: 'Insulated · R-9', add: 210 },
      { id: 'r16', label: 'Premium · R-16', add: 390 },
    ],
  },
  hardware: {
    label: 'Decorative Hardware', type: 'pill',
    choices: [
      { id: 'none', label: 'None', add: 0 },
      { id: 'carriage', label: 'Handles + Hinges', add: 130 },
    ],
  },
};

// ── Door illustration ────────────────────────────────────────────────────────
function DoorPreview({ ratio, colorHex, style, windows, hardware, dark }) {
  const VBW = 460, VBH = 360, groundY = 318;
  const BOX_W = 360, BOX_H = 236, boxRatio = BOX_W / BOX_H;
  let doorW, doorH;
  if (ratio > boxRatio) { doorW = BOX_W; doorH = BOX_W / ratio; }
  else { doorH = BOX_H; doorW = BOX_H * ratio; }
  const left = (VBW - doorW) / 2;
  const top = groundY - doorH;
  const sections = 4;
  const secH = doorH / sections;
  const cols = Math.min(6, Math.max(2, Math.round(doorW / 72)));
  const frame = 'rgba(0,0,0,0.28)';
  const showHardware = hardware === 'carriage';

  const els = [];
  // Panels per section
  for (let s = 0; s < sections; s++) {
    const y = top + s * secH;
    els.push(<rect key={`sec${s}`} x={left} y={y} width={doorW} height={secH} fill={colorHex} stroke={frame} strokeWidth="1" />);
    const mY = secH * 0.17, mX = Math.min(14, doorW * 0.03);
    const pTop = y + mY, pH = secH - mY * 2;

    if (style === 'flush') {
      els.push(<line key={`fl${s}`} x1={left} y1={y} x2={left + doorW} y2={y} stroke="rgba(0,0,0,0.14)" strokeWidth="1" />);
    } else if (style === 'long') {
      const n = doorW > 300 ? 2 : 1;
      const gap = 10, pw = (doorW - mX * 2 - gap * (n - 1)) / n;
      for (let i = 0; i < n; i++) {
        const px = left + mX + i * (pw + gap);
        els.push(<rect key={`lp${s}-${i}`} x={px} y={pTop} width={pw} height={pH} rx="3" fill={colorHex} stroke="rgba(0,0,0,0.22)" strokeWidth="1.4" />);
        els.push(<line key={`lh${s}-${i}`} x1={px + 2} y1={pTop + 2} x2={px + pw - 2} y2={pTop + 2} stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" />);
      }
    } else if (style === 'carriage') {
      const planks = Math.min(10, cols * 2), gap = 3;
      const pw = (doorW - mX * 2 - gap * (planks - 1)) / planks;
      for (let i = 0; i < planks; i++) {
        const px = left + mX + i * (pw + gap);
        els.push(<rect key={`cp${s}-${i}`} x={px} y={pTop} width={pw} height={pH} rx="1.5" fill={colorHex} stroke="rgba(0,0,0,0.26)" strokeWidth="1" />);
        els.push(<line key={`ch${s}-${i}`} x1={px + pw / 2} y1={pTop} x2={px + pw / 2} y2={pTop + pH} stroke="rgba(0,0,0,0.10)" strokeWidth="0.8" />);
      }
    } else { // short
      const gap = 8, pw = (doorW - mX * 2 - gap * (cols - 1)) / cols;
      for (let i = 0; i < cols; i++) {
        const px = left + mX + i * (pw + gap);
        els.push(<rect key={`sp${s}-${i}`} x={px} y={pTop} width={pw} height={pH} rx="3" fill={colorHex} stroke="rgba(0,0,0,0.22)" strokeWidth="1.4" />);
        els.push(<line key={`sh${s}-${i}`} x1={px + 2} y1={pTop + 2} x2={px + pw - 2} y2={pTop + 2} stroke="rgba(255,255,255,0.28)" strokeWidth="1.3" />);
      }
    }
  }

  // Windows on the top section
  if (windows !== 'none') {
    const y = top, mY = secH * 0.2, mX = Math.min(14, doorW * 0.03);
    const wCount = Math.min(6, Math.max(3, cols));
    const gap = 8, ww = (doorW - mX * 2 - gap * (wCount - 1)) / wCount;
    const wy = y + mY, wh = secH - mY * 2;
    for (let i = 0; i < wCount; i++) {
      const wx = left + mX + i * (ww + gap);
      const arch = windows === 'arched' || windows === 'cathedral';
      if (arch) {
        const r = ww / 2;
        const d = `M${wx},${wy + wh} L${wx},${wy + r} A${r},${r} 0 0 1 ${wx + ww},${wy + r} L${wx + ww},${wy + wh} Z`;
        els.push(<path key={`w${i}`} d={d} fill="#d7e6f1" stroke="rgba(0,0,0,0.35)" strokeWidth="1.4" />);
      } else {
        els.push(<rect key={`w${i}`} x={wx} y={wy} width={ww} height={wh} rx="2" fill="#d7e6f1" stroke="rgba(0,0,0,0.35)" strokeWidth="1.4" />);
      }
      if (windows === 'cathedral') {
        els.push(<line key={`wm${i}`} x1={wx + ww / 2} y1={wy} x2={wx + ww / 2} y2={wy + wh} stroke="rgba(0,0,0,0.28)" strokeWidth="1.1" />);
      }
    }
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
      </defs>
      <rect x="0" y="0" width={VBW} height={groundY} fill="url(#wallg)" />
      <rect x="0" y={groundY} width={VBW} height={VBH - groundY} fill={dark ? '#0f1116' : '#cfd3d9'} />
      {/* soft shadow under the door */}
      <ellipse cx={VBW / 2} cy={groundY + 8} rx={doorW * 0.55} ry="10" fill="rgba(0,0,0,0.18)" />
      {/* opening surround */}
      <rect x={left - 8} y={top - 8} width={doorW + 16} height={doorH + 8} fill="none" stroke={dark ? '#3a4150' : '#cbd0d8'} strokeWidth="7" />
      {els}
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DoorBuilder() {
  const [sel, setSel] = useState({ size: '16x7', style: 'short', color: 'white', windows: 'none', insulation: 'none', hardware: 'none' });
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [lead, setLead] = useState({ name: '', email: '', phone: '', zip: '', notes: '' });
  const [status, setStatus] = useState({ sending: false, done: false, error: '' });

  const chosen = useMemo(() => {
    const o = {};
    for (const key of Object.keys(OPTIONS)) o[key] = OPTIONS[key].choices.find(c => c.id === sel[key]);
    return o;
  }, [sel]);

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
      const { data } = await api.post('/contact/door-quote', { ...lead, config: configForEmail, estPrice: price });
      setStatus({ sending: false, done: true, error: '', message: data.message });
    } catch (err) {
      setStatus({ sending: false, done: false, error: err.response?.data?.error || 'Could not send. Please call us at 1-888-844-4701.' });
    }
  };

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
            <DoorPreview ratio={ratio} colorHex={chosen.color?.hex || '#f3f3f0'} style={sel.style} windows={sel.windows} hardware={sel.hardware} />
          </div>
          <div className="db-summary">
            <div className="db-price">
              <span className="db-price-label">Estimated from</span>
              <span className="db-price-value">{money(price)}</span>
            </div>
            <ul className="db-config">
              {Object.entries(configForEmail).map(([k, v]) => (
                <li key={k}><span>{k}</span><strong>{v}</strong></li>
              ))}
            </ul>
            <button className="btn btn-primary btn-lg btn-full" onClick={() => { setStatus({ sending: false, done: false, error: '' }); setQuoteOpen(true); }}>Request My Quote →</button>
            <p className="db-price-note">Estimate only — we'll confirm your exact price in your quote. Free local delivery in Cape Coral, FL.</p>
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
                      {c.label}{c.add > 0 && <span className="db-add">+{money(c.add)}</span>}
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
                    <span className="db-quote-price">Est. {money(price)}</span>
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
