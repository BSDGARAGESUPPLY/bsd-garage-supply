require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

console.log('Seeding database...');

// Categories
const cats = [
  { name: 'Torsion Springs', slug: 'torsion-springs', description: 'High-cycle torsion springs for sectional garage doors. Available in standard and heavy-duty wire gauges.', image_url: '/images/cat-torsion.jpg', sort_order: 1 },
  { name: 'Extension Springs', slug: 'extension-springs', description: 'Stretch-type extension springs for one-piece and older sectional doors. Color-coded by weight rating.', image_url: '/images/cat-extension.jpg', sort_order: 2 },
  { name: 'Spring Hardware Kits', slug: 'hardware-kits', description: 'Complete spring replacement kits including hardware, cables, and installation components.', image_url: '/images/cat-kits.jpg', sort_order: 3 },
  { name: 'Cables & Drums', slug: 'cables-drums', description: 'Galvanized lift cables, safety cables, and cable drums for all door sizes.', image_url: '/images/cat-cables.jpg', sort_order: 4 },
  { name: 'Winding Bars & Tools', slug: 'tools', description: 'Professional winding bars and installation tools for safe spring replacement.', image_url: '/images/cat-tools.jpg', sort_order: 5 }
];

const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name,slug,description,image_url,sort_order) VALUES (?,?,?,?,?)');
cats.forEach(c => insertCat.run(c.name, c.slug, c.description, c.image_url, c.sort_order));

const catIds = {};
db.prepare('SELECT id,slug FROM categories').all().forEach(c => { catIds[c.slug] = c.id; });

// Products
const products = [
  // --- Torsion Springs ---
  {
    category: 'torsion-springs', name: '0.162" × 1-3/4" × 25" Torsion Spring — Left Wind',
    sku: 'TS-162-175-25L', retail_price: 34.99, wholesale_price: 18.50,
    weight: 3.2, stock_qty: 148, min_stock_alert: 20,
    description: 'Standard residential torsion spring for single-car doors up to 100 lbs. 0.162" wire diameter, 1-3/4" inside diameter, 25" length. Left-wind (standard). 10,000-cycle life.',
    specifications: { 'Wire Diameter': '0.162"', 'Inside Diameter': '1-3/4"', 'Length': '25"', 'Wind Direction': 'Left', 'Cycle Life': '10,000', 'Door Weight': 'Up to 100 lbs', 'Finish': 'Oil-Tempered' },
    images: ['https://placehold.co/600x450/1a2332/f97316?text=Torsion+Spring+0.162%22']
  },
  {
    category: 'torsion-springs', name: '0.162" × 1-3/4" × 25" Torsion Spring — Right Wind',
    sku: 'TS-162-175-25R', retail_price: 34.99, wholesale_price: 18.50,
    weight: 3.2, stock_qty: 134, min_stock_alert: 20,
    description: 'Standard residential torsion spring, right-wind. 0.162" wire diameter, 1-3/4" inside diameter, 25" length. Right-wind configuration. 10,000-cycle life.',
    specifications: { 'Wire Diameter': '0.162"', 'Inside Diameter': '1-3/4"', 'Length': '25"', 'Wind Direction': 'Right', 'Cycle Life': '10,000', 'Door Weight': 'Up to 100 lbs', 'Finish': 'Oil-Tempered' },
    images: ['https://placehold.co/600x450/1a2332/f97316?text=Torsion+Spring+0.162%22+R']
  },
  {
    category: 'torsion-springs', name: '0.177" × 2" × 27" Torsion Spring — Left Wind',
    sku: 'TS-177-200-27L', retail_price: 42.99, wholesale_price: 22.75,
    weight: 4.5, stock_qty: 210, min_stock_alert: 25,
    description: 'Heavy-duty residential torsion spring for doors 100–130 lbs. Popular for standard 9×7 and 9×8 single-car doors. Left-wind.',
    specifications: { 'Wire Diameter': '0.177"', 'Inside Diameter': '2"', 'Length': '27"', 'Wind Direction': 'Left', 'Cycle Life': '10,000', 'Door Weight': '100–130 lbs', 'Finish': 'Oil-Tempered' },
    images: ['https://placehold.co/600x450/1a2332/f97316?text=Torsion+Spring+0.177%22']
  },
  {
    category: 'torsion-springs', name: '0.177" × 2" × 27" Torsion Spring — Right Wind',
    sku: 'TS-177-200-27R', retail_price: 42.99, wholesale_price: 22.75,
    weight: 4.5, stock_qty: 198, min_stock_alert: 25,
    description: 'Heavy-duty residential torsion spring for doors 100–130 lbs. Right-wind configuration.',
    specifications: { 'Wire Diameter': '0.177"', 'Inside Diameter': '2"', 'Length': '27"', 'Wind Direction': 'Right', 'Cycle Life': '10,000', 'Door Weight': '100–130 lbs', 'Finish': 'Oil-Tempered' },
    images: ['https://placehold.co/600x450/1a2332/f97316?text=Torsion+Spring+0.177%22+R']
  },
  {
    category: 'torsion-springs', name: '0.192" × 2" × 28" Torsion Spring — Left Wind',
    sku: 'TS-192-200-28L', retail_price: 49.99, wholesale_price: 26.50,
    weight: 5.8, stock_qty: 175, min_stock_alert: 20,
    description: 'High-tensile torsion spring for insulated 16×7 and 16×8 single-car doors. 0.192" wire, 2" ID, 28" length. Left-wind. Ideal for heavier 130–160 lb doors.',
    specifications: { 'Wire Diameter': '0.192"', 'Inside Diameter': '2"', 'Length': '28"', 'Wind Direction': 'Left', 'Cycle Life': '10,000', 'Door Weight': '130–160 lbs', 'Finish': 'Oil-Tempered' },
    images: ['https://placehold.co/600x450/1a2332/f97316?text=Torsion+Spring+0.192%22']
  },
  {
    category: 'torsion-springs', name: '0.207" × 2" × 30" Torsion Spring — Left Wind',
    sku: 'TS-207-200-30L', retail_price: 58.99, wholesale_price: 31.25,
    weight: 7.2, stock_qty: 120, min_stock_alert: 15,
    description: 'Commercial-grade torsion spring for heavy 2-car doors 160–200 lbs. 0.207" wire, 2" ID, 30" length. Left-wind. Common on 16×7 double-car doors.',
    specifications: { 'Wire Diameter': '0.207"', 'Inside Diameter': '2"', 'Length': '30"', 'Wind Direction': 'Left', 'Cycle Life': '10,000', 'Door Weight': '160–200 lbs', 'Finish': 'Oil-Tempered' },
    images: ['https://placehold.co/600x450/1a2332/f97316?text=Torsion+Spring+0.207%22']
  },
  {
    category: 'torsion-springs', name: '0.207" × 2" × 30" Torsion Spring — Right Wind',
    sku: 'TS-207-200-30R', retail_price: 58.99, wholesale_price: 31.25,
    weight: 7.2, stock_qty: 115, min_stock_alert: 15,
    description: 'Commercial-grade torsion spring, right-wind. 0.207" wire, 2" ID, 30" length. For heavy 2-car doors 160–200 lbs.',
    specifications: { 'Wire Diameter': '0.207"', 'Inside Diameter': '2"', 'Length': '30"', 'Wind Direction': 'Right', 'Cycle Life': '10,000', 'Door Weight': '160–200 lbs', 'Finish': 'Oil-Tempered' },
    images: ['https://placehold.co/600x450/1a2332/f97316?text=Torsion+Spring+0.207%22+R']
  },
  {
    category: 'torsion-springs', name: '0.225" × 2-1/4" × 32" Torsion Spring — Left Wind',
    sku: 'TS-225-225-32L', retail_price: 72.99, wholesale_price: 38.50,
    weight: 9.4, stock_qty: 85, min_stock_alert: 12,
    description: 'Heavy-duty commercial torsion spring for large 2-car insulated doors 200–250 lbs. 0.225" wire, 2-1/4" ID, 32" length.',
    specifications: { 'Wire Diameter': '0.225"', 'Inside Diameter': '2-1/4"', 'Length': '32"', 'Wind Direction': 'Left', 'Cycle Life': '10,000', 'Door Weight': '200–250 lbs', 'Finish': 'Oil-Tempered' },
    images: ['https://placehold.co/600x450/1a2332/f97316?text=Torsion+Spring+0.225%22']
  },
  {
    category: 'torsion-springs', name: '0.250" × 2-1/4" × 36" Torsion Spring — Pair (L+R)',
    sku: 'TS-250-225-36-PAIR', retail_price: 149.99, wholesale_price: 79.50,
    weight: 22.0, stock_qty: 60, min_stock_alert: 10,
    description: 'Matched pair of heavy commercial torsion springs for large 3-car or heavy residential doors up to 350 lbs. Includes one left-wind and one right-wind spring.',
    specifications: { 'Wire Diameter': '0.250"', 'Inside Diameter': '2-1/4"', 'Length': '36"', 'Wind Direction': 'Pair (L+R)', 'Cycle Life': '10,000', 'Door Weight': 'Up to 350 lbs', 'Finish': 'Oil-Tempered', 'Quantity': '2 Springs' },
    images: ['https://placehold.co/600x450/1a2332/f97316?text=Torsion+Spring+Pair+0.250%22']
  },
  {
    category: 'torsion-springs', name: '0.273" × 2" High-Cycle Torsion Spring (25,000 cycles) — Left Wind',
    sku: 'TS-273-200-HC-L', retail_price: 89.99, wholesale_price: 47.75,
    weight: 10.5, stock_qty: 45, min_stock_alert: 8,
    description: 'Extended-life high-cycle torsion spring rated for 25,000 cycles. Ideal for commercial properties or high-use residential doors. Oil-tempered, galvanized finish.',
    specifications: { 'Wire Diameter': '0.273"', 'Inside Diameter': '2"', 'Length': '34"', 'Wind Direction': 'Left', 'Cycle Life': '25,000', 'Door Weight': '150–200 lbs', 'Finish': 'Galvanized' },
    images: ['https://placehold.co/600x450/1a2332/f97316?text=Hi-Cycle+0.273%22']
  },

  // --- Extension Springs ---
  {
    category: 'extension-springs', name: 'Extension Spring — 100 lb (Gold) Single',
    sku: 'EX-100-GOLD', retail_price: 18.99, wholesale_price: 9.75,
    weight: 0.8, stock_qty: 320, min_stock_alert: 40,
    description: 'Standard residential extension spring, gold (100 lb) rated. For doors up to 100 lbs. 1" × 25" stretched length. Color-coded per industry standard.',
    specifications: { 'Weight Rating': '100 lbs', 'Color Code': 'Gold', 'Stretched Length': '25"', 'Wire Diameter': '0.080"', 'Inside Diameter': '1"', 'Cycles': '10,000' },
    images: ['https://placehold.co/600x450/243447/f97316?text=Extension+Spring+Gold+100lb']
  },
  {
    category: 'extension-springs', name: 'Extension Spring — 110 lb (Purple) Single',
    sku: 'EX-110-PURP', retail_price: 18.99, wholesale_price: 9.75,
    weight: 0.9, stock_qty: 280, min_stock_alert: 40,
    description: 'Purple (110 lb) extension spring for standard doors. 1" × 25" stretched length. Sold individually.',
    specifications: { 'Weight Rating': '110 lbs', 'Color Code': 'Purple', 'Stretched Length': '25"', 'Wire Diameter': '0.090"', 'Inside Diameter': '1"', 'Cycles': '10,000' },
    images: ['https://placehold.co/600x450/243447/f97316?text=Extension+Spring+Purple+110lb']
  },
  {
    category: 'extension-springs', name: 'Extension Spring — 130 lb (Red) Single',
    sku: 'EX-130-RED', retail_price: 21.99, wholesale_price: 11.50,
    weight: 1.1, stock_qty: 240, min_stock_alert: 35,
    description: 'Red (130 lb) extension spring for medium-duty residential doors. 1" × 27" stretched length.',
    specifications: { 'Weight Rating': '130 lbs', 'Color Code': 'Red', 'Stretched Length': '27"', 'Wire Diameter': '0.100"', 'Inside Diameter': '1"', 'Cycles': '10,000' },
    images: ['https://placehold.co/600x450/243447/f97316?text=Extension+Spring+Red+130lb']
  },
  {
    category: 'extension-springs', name: 'Extension Spring — 150 lb (White) Pair',
    sku: 'EX-150-WHT-PR', retail_price: 44.99, wholesale_price: 23.50,
    weight: 2.5, stock_qty: 150, min_stock_alert: 25,
    description: 'White (150 lb) extension springs sold in matched pair. For heavier residential doors. Includes safety cable hooks.',
    specifications: { 'Weight Rating': '150 lbs each', 'Color Code': 'White', 'Stretched Length': '29"', 'Wire Diameter': '0.110"', 'Quantity': 'Pair (2)', 'Cycles': '10,000' },
    images: ['https://placehold.co/600x450/243447/f97316?text=Extension+Spring+White+150lb']
  },
  {
    category: 'extension-springs', name: 'Extension Spring — 160 lb (Green) Pair',
    sku: 'EX-160-GRN-PR', retail_price: 48.99, wholesale_price: 25.75,
    weight: 2.8, stock_qty: 120, min_stock_alert: 20,
    description: 'Green (160 lb) heavy-duty extension spring pair. Ideal for insulated 9×7 doors.',
    specifications: { 'Weight Rating': '160 lbs each', 'Color Code': 'Green', 'Stretched Length': '30"', 'Wire Diameter': '0.120"', 'Quantity': 'Pair (2)', 'Cycles': '10,000' },
    images: ['https://placehold.co/600x450/243447/f97316?text=Extension+Spring+Green+160lb']
  },
  {
    category: 'extension-springs', name: 'Extension Spring — 200 lb (Yellow) Pair',
    sku: 'EX-200-YEL-PR', retail_price: 59.99, wholesale_price: 31.50,
    weight: 3.5, stock_qty: 90, min_stock_alert: 15,
    description: 'Yellow (200 lb) heavy commercial extension spring pair. For heavier or older sectional doors.',
    specifications: { 'Weight Rating': '200 lbs each', 'Color Code': 'Yellow', 'Stretched Length': '32"', 'Wire Diameter': '0.135"', 'Quantity': 'Pair (2)', 'Cycles': '10,000' },
    images: ['https://placehold.co/600x450/243447/f97316?text=Extension+Spring+Yellow+200lb']
  },

  // --- Hardware Kits ---
  {
    category: 'hardware-kits', name: 'Standard Residential Torsion Spring Replacement Kit — Single Car',
    sku: 'KIT-TORS-SINGLE', retail_price: 89.99, wholesale_price: 47.50,
    weight: 8.5, stock_qty: 75, min_stock_alert: 10,
    description: 'Complete torsion spring replacement kit for single-car (9×7, 9×8, 10×7) doors. Includes matched spring pair, cables, drums, and all hardware. Specify left or right wind when ordering.',
    specifications: { 'Includes': 'Spring pair, cables, drums, center bracket, end brackets', 'Door Size': '8–10 ft wide single car', 'Door Height': '7\' or 8\'', 'Compatibility': 'Standard residential track' },
    images: ['https://placehold.co/600x450/1a3322/f97316?text=Single+Car+Kit']
  },
  {
    category: 'hardware-kits', name: 'Standard Residential Torsion Spring Replacement Kit — Double Car',
    sku: 'KIT-TORS-DOUBLE', retail_price: 139.99, wholesale_price: 74.50,
    weight: 15.0, stock_qty: 55, min_stock_alert: 8,
    description: 'Complete torsion spring replacement kit for standard 16×7 or 18×7 double-car doors. Includes matched spring pair, cables, drums, and all hardware. Ready to install.',
    specifications: { 'Includes': 'Spring pair, cables, drums, center bracket, end brackets', 'Door Size': '14–18 ft wide double car', 'Door Height': '7\'', 'Compatibility': 'Standard residential track' },
    images: ['https://placehold.co/600x450/1a3322/f97316?text=Double+Car+Kit']
  },
  {
    category: 'hardware-kits', name: 'Extension Spring Safety Cable Kit (Pair)',
    sku: 'KIT-EXT-SAFETY', retail_price: 24.99, wholesale_price: 12.75,
    weight: 1.2, stock_qty: 200, min_stock_alert: 30,
    description: 'Safety cable kit for extension springs. Prevents spring fragments from becoming projectiles if spring breaks. Includes 2 cables with hardware. Required by code in many jurisdictions.',
    specifications: { 'Length': '8 ft per cable', 'Material': 'Galvanized steel', 'Quantity': '2 cables + hardware', 'Diameter': '1/8"' },
    images: ['https://placehold.co/600x450/1a3322/f97316?text=Safety+Cable+Kit']
  },

  // --- Cables & Drums ---
  {
    category: 'cables-drums', name: 'Galvanized Lift Cable — 7\'6" Door (Pair)',
    sku: 'CAB-76-PR', retail_price: 19.99, wholesale_price: 10.25,
    weight: 1.0, stock_qty: 350, min_stock_alert: 50,
    description: 'Pre-cut galvanized steel lift cables for 7\'6" door height. 1/8" diameter, loop end. Sold as a pair.',
    specifications: { 'Door Height': '7\'6"', 'Length': '~8\'8"', 'Diameter': '1/8"', 'Material': 'Galvanized Steel', 'End': 'Loop + Swaged Stop', 'Quantity': 'Pair (2)' },
    images: ['https://placehold.co/600x450/2a1a32/f97316?text=Lift+Cable+7ft6in']
  },
  {
    category: 'cables-drums', name: 'Galvanized Lift Cable — 8\'0" Door (Pair)',
    sku: 'CAB-80-PR', retail_price: 21.99, wholesale_price: 11.25,
    weight: 1.1, stock_qty: 420, min_stock_alert: 50,
    description: 'Pre-cut galvanized steel lift cables for 8\'0" door height. Most common residential cable. Sold as a pair.',
    specifications: { 'Door Height': '8\'0"', 'Length': '~9\'2"', 'Diameter': '1/8"', 'Material': 'Galvanized Steel', 'End': 'Loop + Swaged Stop', 'Quantity': 'Pair (2)' },
    images: ['https://placehold.co/600x450/2a1a32/f97316?text=Lift+Cable+8ft']
  },
  {
    category: 'cables-drums', name: 'Galvanized Lift Cable — 9\'0" Door (Pair)',
    sku: 'CAB-90-PR', retail_price: 24.99, wholesale_price: 12.75,
    weight: 1.3, stock_qty: 180, min_stock_alert: 30,
    description: 'Pre-cut galvanized steel lift cables for 9\'0" door height. Commercial/high-ceiling applications. Sold as a pair.',
    specifications: { 'Door Height': '9\'0"', 'Length': '~10\'2"', 'Diameter': '1/8"', 'Material': 'Galvanized Steel', 'End': 'Loop + Swaged Stop', 'Quantity': 'Pair (2)' },
    images: ['https://placehold.co/600x450/2a1a32/f97316?text=Lift+Cable+9ft']
  },
  {
    category: 'cables-drums', name: 'Standard Lift Drum — 2" Bore (Pair)',
    sku: 'DRM-STD-2-PR', retail_price: 34.99, wholesale_price: 17.75,
    weight: 2.8, stock_qty: 130, min_stock_alert: 20,
    description: 'Standard residential cable drums. 2" bore, set screw attachment. For most residential 2" torsion bar applications. Sold as a pair (left and right).',
    specifications: { 'Bore': '2"', 'Attachment': '3/8" Set Screw', 'Material': 'Steel (Zinc Plated)', 'Cable Groove': 'Standard 1/8" Cable', 'Quantity': 'Pair (L+R)' },
    images: ['https://placehold.co/600x450/2a1a32/f97316?text=Cable+Drums+2%22+Bore']
  },
  {
    category: 'cables-drums', name: 'Hi-Lift Cable Drum Set — 12" Extension',
    sku: 'DRM-HILIFT-12', retail_price: 59.99, wholesale_price: 31.50,
    weight: 4.2, stock_qty: 65, min_stock_alert: 10,
    description: 'Hi-lift cable drum set for garage conversions requiring extra vertical clearance. Provides 12" of additional lift for commercial or custom applications.',
    specifications: { 'Lift': '12" Hi-Lift', 'Bore': '2"', 'Attachment': 'Set Screw', 'Material': 'Heavy-Duty Steel', 'Quantity': 'Pair (L+R)' },
    images: ['https://placehold.co/600x450/2a1a32/f97316?text=Hi-Lift+Drums+12%22']
  },

  // --- Tools ---
  {
    category: 'tools', name: 'Professional Winding Bar Set (18" × 1/2") — Pair',
    sku: 'TOOL-WB-18-PR', retail_price: 29.99, wholesale_price: 14.75,
    weight: 1.8, stock_qty: 95, min_stock_alert: 15,
    description: 'Professional solid steel winding bars, 18" length, 1/2" diameter. Fits all standard torsion spring cones. Sold as a pair. Do not use extensions or substitute tools — safety critical.',
    specifications: { 'Length': '18"', 'Diameter': '1/2"', 'Material': 'Solid Steel', 'Finish': 'Black Oxide', 'Quantity': 'Pair (2)', 'Compatibility': 'Standard residential cones' },
    images: ['https://placehold.co/600x450/32221a/f97316?text=Winding+Bars+18%22']
  },
  {
    category: 'tools', name: 'Center Support Bearing — 1" Bore',
    sku: 'TOOL-CSB-1', retail_price: 12.99, wholesale_price: 6.25,
    weight: 0.5, stock_qty: 210, min_stock_alert: 30,
    description: 'Center support bearing plate for 1" torsion spring shaft. Includes bearing and mounting hardware.',
    specifications: { 'Shaft Bore': '1"', 'Bearing Type': 'Ball Bearing', 'Plate Size': '4" × 4"', 'Material': 'Steel' },
    images: ['https://placehold.co/600x450/32221a/f97316?text=Center+Bearing']
  },
  {
    category: 'tools', name: 'End Bearing Plate — 1" Bore (Pair)',
    sku: 'TOOL-EBP-1-PR', retail_price: 22.99, wholesale_price: 11.50,
    weight: 1.2, stock_qty: 160, min_stock_alert: 20,
    description: 'End bearing plate set with ball bearings for 1" torsion shaft. Mounts to vertical track and supports shaft ends. Sold as a pair.',
    specifications: { 'Shaft Bore': '1"', 'Bearing Type': 'Ball Bearing', 'Plate Size': '3" × 6"', 'Material': 'Steel (Galvanized)', 'Quantity': 'Pair (2)' },
    images: ['https://placehold.co/600x450/32221a/f97316?text=End+Bearing+Plates']
  }
];

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (category_id,name,slug,sku,description,retail_price,wholesale_price,weight,stock_qty,min_stock_alert,specifications,images)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
`);

products.forEach(p => {
  const slug = p.sku.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  insertProduct.run(
    catIds[p.category], p.name, slug, p.sku, p.description,
    p.retail_price, p.wholesale_price, p.weight, p.stock_qty, p.min_stock_alert,
    JSON.stringify(p.specifications), JSON.stringify(p.images)
  );
});

// Admin user
const adminHash = bcrypt.hashSync('B1sd15378!$', 12);
db.prepare(`
  INSERT OR IGNORE INTO users (email,password_hash,company_name,contact_name,phone,status,is_admin)
  VALUES (?,?,?,?,?,?,?)
`).run('bsdgaragesupply@gmail.com', adminHash, 'BSD Garage Supply', 'Admin', '1-800-BSD-SPRING', 'approved', 1);

// Sample approved customer
const custHash = bcrypt.hashSync('Customer123!', 12);
db.prepare(`
  INSERT OR IGNORE INTO users (email,password_hash,company_name,contact_name,phone,address,city,state,zip,business_type,status)
  VALUES (?,?,?,?,?,?,?,?,?,?,?)
`).run('demo@acmedoors.com', custHash, 'Acme Door Services', 'John Smith', '555-0200', '123 Main St', 'Dallas', 'TX', '75201', 'Garage Door Contractor', 'approved');

// Sample pending customer
const pendHash = bcrypt.hashSync('Pending123!', 12);
db.prepare(`
  INSERT OR IGNORE INTO users (email,password_hash,company_name,contact_name,phone,city,state,business_type,status)
  VALUES (?,?,?,?,?,?,?,?,?)
`).run('pending@newbiz.com', pendHash, 'New Door Co', 'Jane Doe', '555-0300', 'Austin', 'TX', 'Garage Door Installer', 'pending');

console.log(`✓ Seeded ${products.length} products across ${cats.length} categories`);
console.log('✓ Admin: admin@precisionsupply.com / Admin123!');
console.log('✓ Approved customer: demo@acmedoors.com / Customer123!');
console.log('✓ Pending customer: pending@newbiz.com / Pending123!');
