/**
 * Idempotent production seed.
 * Runs on startup. Safe to run every boot — it only creates what's missing:
 *   - the admin account (from ADMIN_EMAIL / ADMIN_PASSWORD env, with sensible defaults)
 *   - the two product categories
 *   - the 35 catalog products (only if the products table is empty)
 *
 * Single-price model: retail_price and wholesale_price are both set to `price`.
 */
const bcrypt = require('bcryptjs');

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── Catalog data (from invoice OK02-260507005LXL) ────────────────────────────
const SPRINGS = [
  ['225x2x25','L',80,6.22,4.24],['225x2x25','R',80,6.22,4.24],
  ['225x2x27','L',80,6.59,4.56],['225x2x27','R',80,6.59,4.56],
  ['234x2x25','L',80,6.42,4.42],['234x2x25','R',80,6.42,4.42],
  ['234x2x27','L',80,6.81,4.75],['234x2x27','R',80,6.81,4.75],
  ['243x2x28','L',80,7.23,5.12],['243x2x28','R',80,7.23,5.12],
  ['243x2x32','L',40,8.03,5.81],['243x2x32','R',40,8.03,5.81],
  ['250x2x30','L',90,7.82,5.63],['250x2x30','R',90,7.82,5.63],
  ['250x2x34','L',40,8.65,6.34],['250x2x34','R',40,8.65,6.34],
  ['262x2x36','L',90,9.46,7.04],['262x2x36','R',90,9.46,7.04],
  ['262x2x39','L',50,10.11,7.61],['262x2x39','R',50,10.11,7.61],
  ['273x2x36','L',90,9.83,7.36],['273x2x36','R',90,9.83,7.36],
  ['273x2x40','L',50,10.74,8.15],['273x2x40','R',50,10.74,8.15],
  ['283x2x37','L',10,10.40,7.86],['283x2x37','R',10,10.40,7.86],
  ['283x2x40','L',10,11.11,8.47],['283x2x40','R',10,11.11,8.47],
];

const HARDWARE = [
  { name:'Garage Door Hinge #1', sku:'HNG-1', exw:0.47, qty:100, wt:0.40,
    desc:'Galvanized steel hinge for the bottom section of a garage door. 14 gauge, width 2-3/4", length 7-9/25".',
    specs:{ 'Type':'#1 Bottom Hinge','Material':'Galvanized Steel','Gauge':'14 GA','Width':'2-3/4"','Length':'7-9/25"' } },
  { name:'Garage Door Hinge #2', sku:'HNG-2', exw:0.51, qty:100, wt:0.51,
    desc:'Galvanized steel hinge for the second joint of a garage door. 14 gauge, width 2-3/4", length 7-9/25".',
    specs:{ 'Type':'#2 Hinge','Material':'Galvanized Steel','Gauge':'14 GA','Width':'2-3/4"','Length':'7-9/25"' } },
  { name:'Garage Door Hinge #3', sku:'HNG-3', exw:0.52, qty:100, wt:0.51,
    desc:'Galvanized steel hinge for the third joint of a garage door. 14 gauge, width 2-3/4", length 7-9/25".',
    specs:{ 'Type':'#3 Hinge','Material':'Galvanized Steel','Gauge':'14 GA','Width':'2-3/4"','Length':'7-9/25"' } },
  { name:'Garage Door Hinge #4', sku:'HNG-4', exw:0.56, qty:100, wt:0.53,
    desc:'Galvanized steel hinge for the fourth joint of a garage door. 14 gauge, width 2-3/4", length 7-9/25".',
    specs:{ 'Type':'#4 Top Hinge','Material':'Galvanized Steel','Gauge':'14 GA','Width':'2-3/4"','Length':'7-9/25"' } },
  { name:'End Bearing Bracket (Pair)', sku:'EBB-25', exw:2.32, qty:100, wt:1.65,
    desc:'Galvanized steel end bearing brackets sold as a left/right pair. 2.5mm thickness, 25.6mm shaft diameter, 86mm center distance.',
    specs:{ 'Material':'Galvanized Steel','Thickness':'2.5mm','Shaft Diameter':'25.6mm','Center Distance':'86mm','Sold As':'Pair (L+R)' } },
  { name:'3-3/8" Center Bearing Mount', sku:'CBM-338', exw:0.88, qty:120, wt:0.53,
    desc:'Galvanized steel center bearing mount, 3-3/8" size. 2.5mm thickness. Fits springs with 1-3/4" to 2-5/8" inside diameter.',
    specs:{ 'Size':'3-3/8"','Material':'Galvanized Steel','Thickness':'2.5mm','Spring ID Range':'1-3/4" – 2-5/8"' } },
  { name:'1" Flange Bearing', sku:'BRG-1', exw:0.52, qty:150, wt:0.26,
    desc:'Flange bearing with 1" inside diameter. Used with end bearing brackets and center mounts on torsion spring shafts.',
    specs:{ 'Type':'Flange Bearing','Inside Diameter':'1"','Application':'Torsion Spring Shaft' } },
];

function ensureSeed(db) {
  // ── Admin user ──
  const adminEmail = (process.env.ADMIN_EMAIL || 'bsdgaragesupply@gmail.com').toLowerCase();
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email=?').get(adminEmail);
  if (!existingAdmin) {
    const adminPass = process.env.ADMIN_PASSWORD || 'B1sd15378!$';
    const hash = bcrypt.hashSync(adminPass, 12);
    db.prepare(`
      INSERT INTO users (email,password_hash,company_name,contact_name,phone,status,is_admin,approved_at)
      VALUES (?,?,?,?,?,'approved',1,datetime('now'))
    `).run(adminEmail, hash, 'BSD Garage Supply', 'Admin', '1-888-844-4701');
    console.log('🌱 Seeded admin account:', adminEmail);
  }

  // ── Categories ──
  const ensureCat = (name, s, description) => {
    let row = db.prepare('SELECT id FROM categories WHERE slug=?').get(s);
    if (!row) {
      const r = db.prepare('INSERT INTO categories (name,slug,description) VALUES (?,?,?)').run(name, s, description);
      return r.lastInsertRowid;
    }
    return row.id;
  };
  const catTorsion = ensureCat('Torsion Springs', 'torsion-springs',
    'High-cycle galvanized torsion springs. Format: Wire Dia × ID × Length. Available in Left (L) and Right (R) wind.');
  const catHardware = ensureCat('Brackets & Hardware', 'brackets-hardware',
    'End bearing brackets, center mounts, hinges, and bearings for complete garage door assemblies.');

  // ── Products (only if empty) ──
  const productCount = db.prepare('SELECT COUNT(*) c FROM products').get().c;
  if (productCount > 0) return;

  const insertProd = db.prepare(`
    INSERT INTO products (name,slug,sku,category_id,description,specifications,retail_price,wholesale_price,stock_qty,weight,is_active)
    VALUES (?,?,?,?,?,?,?,?,?,?,1)
  `);

  for (const [size, wind, qty, exw, wt_kg] of SPRINGS) {
    const [wire, id, len] = size.split('x');
    const windFull = wind === 'L' ? 'Left Wind' : 'Right Wind';
    const windOpp = wind === 'L' ? 'Right Wind' : 'Left Wind';
    const name = `Torsion Spring .${wire}" × ${id}" × ${len}" — ${windFull}`;
    const skuStr = `TS-${size}-${wind}`;
    const price = Math.round(exw * 5.2 * 100) / 100;
    const wt_lbs = Math.round(wt_kg * 2.205 * 100) / 100;
    const desc = `High-cycle galvanized torsion spring. Wire diameter .${wire}", inside diameter ${id}", coil length ${len}". ${windFull}. Pairs with the ${windOpp} for complete installations. Heavy-duty galvanized finish for maximum corrosion resistance and cycle life.`;
    const specs = JSON.stringify({ 'Wire Diameter': `.${wire}"`, 'Inside Diameter': `${id}"`, 'Coil Length': `${len}"`, 'Wind Direction': windFull, 'Finish': 'Galvanized', 'Unit Weight': `${wt_lbs} lbs` });
    insertProd.run(name, slug(skuStr), skuStr, catTorsion, desc, specs, price, price, qty, wt_lbs);
  }

  for (const h of HARDWARE) {
    const price = Math.round(h.exw * 6.0 * 100) / 100;
    insertProd.run(h.name, slug(h.sku), h.sku, catHardware, h.desc, JSON.stringify(h.specs), price, price, h.qty, h.wt);
  }

  console.log(`🌱 Seeded ${SPRINGS.length + HARDWARE.length} products`);
}

module.exports = { ensureSeed };
