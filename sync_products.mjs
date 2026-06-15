/**
 * Sync products from Invoice OK02-260507005LXL
 * Replaces all existing products with the actual BSD Garage Supply inventory
 */
import { DatabaseSync } from 'node:sqlite';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(join(__dirname, 'data.db'));

// ── Helpers ──────────────────────────────────────────────────────────────────
function slug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Wipe existing products & categories ──────────────────────────────────────
db.exec('DELETE FROM order_items');
db.exec('DELETE FROM cart_items');
db.exec('DELETE FROM products');
db.exec('DELETE FROM categories');

// ── Create categories ─────────────────────────────────────────────────────────
const insertCat = db.prepare(`INSERT INTO categories (name, slug, description) VALUES (?,?,?)`);
const catTorsion = insertCat.run('Torsion Springs', 'torsion-springs',
  'High-cycle galvanized torsion springs. Format: Wire Dia × ID × Length. Available in Left (L) and Right (R) wind.').lastInsertRowid;
const catHardware = insertCat.run('Brackets & Hardware', 'brackets-hardware',
  'End bearing brackets, center mounts, hinges, and bearings for complete garage door assemblies.').lastInsertRowid;

// ── Product insert statement ──────────────────────────────────────────────────
const insertProd = db.prepare(`
  INSERT INTO products
    (name, slug, sku, category_id, description, specifications, retail_price, wholesale_price, stock_qty, weight, is_active)
  VALUES (?,?,?,?,?,?,?,?,?,?,1)
`);

// ── Torsion Springs ───────────────────────────────────────────────────────────
// Format: WireSize(thousandths) × InsideDiameter(in) × Length(in)  L or R wind
// EXW prices are factory cost. Wholesale ≈ EXW × 3.2, Retail ≈ EXW × 5.2
const springs = [
  // size,       wind, qty, exw,   unit_weight_kg
  ['225x2x25', 'L', 80, 6.22,  4.24],
  ['225x2x25', 'R', 80, 6.22,  4.24],
  ['225x2x27', 'L', 80, 6.59,  4.56],
  ['225x2x27', 'R', 80, 6.59,  4.56],
  ['234x2x25', 'L', 80, 6.42,  4.42],
  ['234x2x25', 'R', 80, 6.42,  4.42],
  ['234x2x27', 'L', 80, 6.81,  4.75],
  ['234x2x27', 'R', 80, 6.81,  4.75],
  ['243x2x28', 'L', 80, 7.23,  5.12],
  ['243x2x28', 'R', 80, 7.23,  5.12],
  ['243x2x32', 'L', 40, 8.03,  5.81],
  ['243x2x32', 'R', 40, 8.03,  5.81],
  ['250x2x30', 'L', 90, 7.82,  5.63],
  ['250x2x30', 'R', 90, 7.82,  5.63],
  ['250x2x34', 'L', 40, 8.65,  6.34],
  ['250x2x34', 'R', 40, 8.65,  6.34],
  ['262x2x36', 'L', 90, 9.46,  7.04],
  ['262x2x36', 'R', 90, 9.46,  7.04],
  ['262x2x39', 'L', 50, 10.11, 7.61],
  ['262x2x39', 'R', 50, 10.11, 7.61],
  ['273x2x36', 'L', 90, 9.83,  7.36],
  ['273x2x36', 'R', 90, 9.83,  7.36],
  ['273x2x40', 'L', 50, 10.74, 8.15],
  ['273x2x40', 'R', 50, 10.74, 8.15],
  ['283x2x37', 'L', 10, 10.40, 7.86],
  ['283x2x37', 'R', 10, 10.40, 7.86],
  ['283x2x40', 'L', 10, 11.11, 8.47],
  ['283x2x40', 'R', 10, 11.11, 8.47],
];

for (const [size, wind, qty, exw, wt_kg] of springs) {
  const [wire, id, len] = size.split('x');
  const windFull = wind === 'L' ? 'Left Wind' : 'Right Wind';
  const windOpposite = wind === 'L' ? 'Right Wind' : 'Left Wind';
  const name = `Torsion Spring .${wire}" × ${id}" × ${len}" — ${windFull}`;
  const skuStr = `TS-${size}-${wind}`;
  const wholesale = Math.round(exw * 3.2 * 100) / 100;
  const retail    = Math.round(exw * 5.2 * 100) / 100;
  const wt_lbs    = Math.round(wt_kg * 2.205 * 100) / 100;

  const desc = `High-cycle galvanized torsion spring. Wire diameter .${wire}", ` +
    `inside diameter ${id}", coil length ${len}". ${windFull} (wound ${wind === 'L' ? 'counterclockwise' : 'clockwise'} when viewed from the winding end). ` +
    `Pairs with the ${windOpposite} for complete installations. ` +
    `Heavy-duty galvanized finish for maximum corrosion resistance and cycle life.`;

  const specs = JSON.stringify({
    'Wire Diameter': `.${wire}"`,
    'Inside Diameter': `${id}"`,
    'Coil Length': `${len}"`,
    'Wind Direction': windFull,
    'Finish': 'Galvanized',
    'Unit Weight': `${wt_lbs} lbs`,
  });

  insertProd.run(name, slug(skuStr), skuStr, catTorsion, desc, specs, retail, wholesale, qty, wt_lbs);
}

// ── Hardware items ─────────────────────────────────────────────────────────────
const hardware = [
  {
    name: 'Garage Door Hinge #1',
    sku: 'HNG-1',
    desc: 'Galvanized steel hinge for the bottom section of a garage door. 14 gauge, width 2-3/4", length 7-9/25". Used at the joint between panel 1 and panel 2.',
    specs: { 'Type': '#1 Bottom Hinge', 'Material': 'Galvanized Steel', 'Gauge': '14 GA', 'Width': '2-3/4"', 'Length': '7-9/25"' },
    exw: 0.47, qty: 100, wt: 0.40,
  },
  {
    name: 'Garage Door Hinge #2',
    sku: 'HNG-2',
    desc: 'Galvanized steel hinge for the second joint of a garage door. 14 gauge, width 2-3/4", length 7-9/25". Connects panel 2 to panel 3.',
    specs: { 'Type': '#2 Hinge', 'Material': 'Galvanized Steel', 'Gauge': '14 GA', 'Width': '2-3/4"', 'Length': '7-9/25"' },
    exw: 0.51, qty: 100, wt: 0.51,
  },
  {
    name: 'Garage Door Hinge #3',
    sku: 'HNG-3',
    desc: 'Galvanized steel hinge for the third joint of a garage door. 14 gauge, width 2-3/4", length 7-9/25". Connects panel 3 to panel 4.',
    specs: { 'Type': '#3 Hinge', 'Material': 'Galvanized Steel', 'Gauge': '14 GA', 'Width': '2-3/4"', 'Length': '7-9/25"' },
    exw: 0.52, qty: 100, wt: 0.51,
  },
  {
    name: 'Garage Door Hinge #4',
    sku: 'HNG-4',
    desc: 'Galvanized steel hinge for the fourth joint of a garage door. 14 gauge, width 2-3/4", length 7-9/25". Connects panel 4 to panel 5 (top).',
    specs: { 'Type': '#4 Top Hinge', 'Material': 'Galvanized Steel', 'Gauge': '14 GA', 'Width': '2-3/4"', 'Length': '7-9/25"' },
    exw: 0.56, qty: 100, wt: 0.53,
  },
  {
    name: 'End Bearing Bracket (Pair)',
    sku: 'EBB-25',
    desc: 'Galvanized steel end bearing brackets sold as a left/right pair. 2.5mm thickness, 25.6mm shaft diameter, 86mm center distance. Required at each end of the torsion spring shaft.',
    specs: { 'Material': 'Galvanized Steel', 'Thickness': '2.5mm', 'Shaft Diameter': '25.6mm', 'Center Distance': '86mm', 'Sold As': 'Pair (L+R)' },
    exw: 2.32, qty: 100, wt: 1.65,
  },
  {
    name: '3-3/8" Center Bearing Mount',
    sku: 'CBM-338',
    desc: 'Galvanized steel center bearing mount, 3-3/8" size. 2.5mm thickness. Fits springs with 1-3/4" to 2-5/8" inside diameter. Mounts at the center of the torsion bar above the door.',
    specs: { 'Size': '3-3/8"', 'Material': 'Galvanized Steel', 'Thickness': '2.5mm', 'Spring ID Range': '1-3/4" – 2-5/8"' },
    exw: 0.88, qty: 120, wt: 0.53,
  },
  {
    name: '1" Flange Bearing',
    sku: 'BRG-1',
    desc: 'Flange bearing with 1" inside diameter. Used with end bearing brackets and center mounts on torsion spring shafts. Smooth operation and long service life.',
    specs: { 'Type': 'Flange Bearing', 'Inside Diameter': '1"', 'Application': 'Torsion Spring Shaft' },
    exw: 0.52, qty: 150, wt: 0.26,
  },
];

for (const h of hardware) {
  const wholesale = Math.round(h.exw * 3.5 * 100) / 100;
  const retail    = Math.round(h.exw * 6.0 * 100) / 100;
  insertProd.run(
    h.name, slug(h.sku), h.sku, catHardware,
    h.desc, JSON.stringify(h.specs),
    retail, wholesale, h.qty, h.wt
  );
}

// ── Summary ───────────────────────────────────────────────────────────────────
const total = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
const cats  = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
console.log(`\n✅ Done! Synced ${total} products across ${cats} categories.\n`);

const rows = db.prepare(`
  SELECT p.sku, p.name, p.stock_qty, p.wholesale_price, p.retail_price, c.name as cat
  FROM products p JOIN categories c ON p.category_id = c.id ORDER BY c.id, p.id
`).all();

for (const r of rows) {
  console.log(`  [${r.sku}] ${r.name.padEnd(55)} | Stock: ${String(r.stock_qty).padStart(3)} | W: $${r.wholesale_price.toFixed(2).padStart(7)} | R: $${r.retail_price.toFixed(2).padStart(7)}`);
}

db.close();
