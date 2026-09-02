const db = require('../db');

// Default door-builder configuration. Prices are estimates the owner can edit
// from Admin → Door Builder. Structure (sizes/colors) is fixed; prices + labels edit.
const DEFAULT = {
  showPrices: true,
  sizes: [
    { id: '8x7', label: `8′ × 7′`, w: 8, h: 7, base: 640 },
    { id: '9x7', label: `9′ × 7′`, w: 9, h: 7, base: 690 },
    { id: '10x7', label: `10′ × 7′`, w: 10, h: 7, base: 740 },
    { id: '9x8', label: `9′ × 8′`, w: 9, h: 8, base: 760 },
    { id: '16x7', label: `16′ × 7′`, w: 16, h: 7, base: 1160 },
    { id: '16x8', label: `16′ × 8′`, w: 16, h: 8, base: 1290 },
    { id: '18x7', label: `18′ × 7′`, w: 18, h: 7, base: 1360 },
  ],
  styles: [
    { id: 'short', label: 'Short Panel', add: 0 },
    { id: 'long', label: 'Long Panel', add: 0 },
    { id: 'flush', label: 'Flush', add: 0 },
    { id: 'carriage', label: 'Carriage House', add: 260 },
  ],
  colors: [
    { id: 'white', label: 'White', hex: '#f3f3f0', add: 0 },
    { id: 'almond', label: 'Almond', hex: '#e7ddc6', add: 0 },
    { id: 'sandstone', label: 'Sandstone', hex: '#d6c6a3', add: 40 },
    { id: 'clay', label: 'Terra Clay', hex: '#a9603f', add: 60 },
    { id: 'brown', label: 'Brown', hex: '#5c4030', add: 60 },
    { id: 'charcoal', label: 'Charcoal', hex: '#3b3e43', add: 60 },
    { id: 'black', label: 'Black', hex: '#1e1f21', add: 80 },
  ],
  windows: [
    { id: 'none', label: 'No Windows', add: 0 },
    { id: 'plain', label: 'Top Row', add: 190 },
    { id: 'arched', label: 'Arched', add: 270 },
    { id: 'cathedral', label: 'Cathedral', add: 320 },
  ],
  insulation: [
    { id: 'none', label: 'Non-Insulated', add: 0 },
    { id: 'r9', label: 'Insulated · R-9', add: 210 },
    { id: 'r16', label: 'Premium · R-16', add: 390 },
  ],
  hardware: [
    { id: 'none', label: 'None', add: 0 },
    { id: 'carriage', label: 'Handles + Hinges', add: 130 },
  ],
};

function getConfig() {
  const row = db.prepare("SELECT value FROM settings WHERE key='door_builder_config'").get();
  if (!row) return DEFAULT;
  try {
    const saved = JSON.parse(row.value);
    return { ...DEFAULT, ...saved };
  } catch {
    return DEFAULT;
  }
}

// Merge incoming edits onto the default by id — keeps structure (w/h, ids) safe,
// only accepts label / price / hex / showPrices from the admin.
function saveConfig(incoming) {
  const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : d; };
  const str = (v, d) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 60) : d);
  const mergeGroup = (defaults, saved, priceKey) => defaults.map(def => {
    const s = Array.isArray(saved) ? saved.find(x => x && x.id === def.id) : null;
    const out = { ...def, label: str(s && s.label, def.label), [priceKey]: num(s && s[priceKey], def[priceKey]) };
    if (def.hex !== undefined) out.hex = /^#[0-9a-fA-F]{3,8}$/.test(s && s.hex) ? s.hex : def.hex;
    return out;
  });
  const cfg = {
    showPrices: incoming && incoming.showPrices === false ? false : true,
    sizes: mergeGroup(DEFAULT.sizes, incoming && incoming.sizes, 'base'),
    styles: mergeGroup(DEFAULT.styles, incoming && incoming.styles, 'add'),
    colors: mergeGroup(DEFAULT.colors, incoming && incoming.colors, 'add'),
    windows: mergeGroup(DEFAULT.windows, incoming && incoming.windows, 'add'),
    insulation: mergeGroup(DEFAULT.insulation, incoming && incoming.insulation, 'add'),
    hardware: mergeGroup(DEFAULT.hardware, incoming && incoming.hardware, 'add'),
  };
  db.prepare(`INSERT INTO settings (key, value, updated_at) VALUES ('door_builder_config', ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`).run(JSON.stringify(cfg));
  return cfg;
}

module.exports = { DEFAULT, getConfig, saveConfig };
