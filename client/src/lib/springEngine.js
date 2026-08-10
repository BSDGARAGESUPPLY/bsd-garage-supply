// ─────────────────────────────────────────────────────────────────────────────
// BSD Spring Engineer — torsion spring calculation engine
//
// Original implementation built on standard, published garage-door torsion-spring
// engineering (spring-rate and wire-stress formulas). The drum constants below are
// calibrated so a known reference case reproduces exactly:
//   16'×7' door, 150 lb, 2 springs, 2" ID, 15" radius, 400 standard-lift drum
//   → 0.192" wire, 17.25" length, 5.08 lb, 7.9 turns, TIPPT 43, ~11,000 cycles
//
// IMPORTANT: results are engineering ESTIMATES for reference. A qualified
// technician must verify spring specs before winding/installing — garage door
// springs are under high tension and are safety-critical.
// ─────────────────────────────────────────────────────────────────────────────

// Spring-rate: IPPT(per spring) = IPPT_C * d^IPPT_EXP / ((ID + d) * L)  [in-lb per turn]
// Exponent + constant calibrated against two ServiceSpring reference cases
// (150 lb → 0.192"×17.25" and 189 lb → 0.2187"×25.5"), reproducing both lengths.
const IPPT_C = 2.5169e6;
const IPPT_EXP = 4.87;
// Steel density used for spring weight (lb/in^3).
const RHO = 0.2835;
// Fatigue: max wire stress for a 10,000-cycle life, and how life scales with stress.
// life(stress) = 10000 * (SIGMA_10K / stress)^LIFE_EXP  — calibrated to both cases.
const SIGMA_10K = 245000;
const LIFE_REF_CYCLES = 10000;
const LIFE_EXP = 4.28;

// Standard US garage-door torsion wire sizes (inches), smallest → largest.
export const WIRE_SIZES = [
  0.177, 0.192, 0.207, 0.2187, 0.225, 0.234, 0.243, 0.250,
  0.262, 0.273, 0.283, 0.295, 0.3065, 0.319, 0.331, 0.343,
];

export const ID_OPTIONS = [
  { value: 1.75, label: '1 3/4"' },
  { value: 2.0, label: '2"' },
  { value: 2.625, label: '2 5/8"' },
];

export const CYCLE_OPTIONS = [10000, 15000, 25000, 50000, 100000];

// Door dimension pickers (value in inches).
export const HEIGHT_OPTIONS = [
  { value: 84, label: `7' 0"` }, { value: 90, label: `7' 6"` },
  { value: 96, label: `8' 0"` }, { value: 108, label: `9' 0"` },
  { value: 120, label: `10' 0"` }, { value: 144, label: `12' 0"` },
  { value: 168, label: `14' 0"` },
];
export const WIDTH_OPTIONS = [8, 9, 10, 11, 12, 14, 16, 18].map(ft => ({ value: ft * 12, label: `${ft}' 0"` }));

export const TRACK_RADII = [10, 12, 15];

// Starter drum set. 400-series share the same cable-drum geometry (moment arm +
// inches-per-turn); they differ by cable capacity (max height/weight). "custom"
// lets a tech enter a drum's high-point radius and inches-per-turn directly.
export const DRUMS = [
  {
    id: 'd400-96', name: 'CANIMEX / TF D400-96 · Standard Lift', lift: 'standard',
    momentArm: 2.2646, dropPerTurn: 10.63, maxHeight: 96, maxWeight: 530, maxCable: 0.125,
    cableFormula: 'Floor to shaft center + 8"',
  },
  {
    id: 'd400-84', name: '400 · Standard Lift (up to 7′)', lift: 'standard',
    momentArm: 2.2646, dropPerTurn: 10.63, maxHeight: 84, maxWeight: 530, maxCable: 0.125,
    cableFormula: 'Floor to shaft center + 8"',
  },
  {
    id: 'custom', name: 'Custom drum (enter specs)', lift: 'standard', custom: true,
    momentArm: 2.2646, dropPerTurn: 10.63, maxHeight: null, maxWeight: null, maxCable: null,
  },
];

const round1000 = (n) => Math.max(1000, Math.round(n / 1000) * 1000);

// Bending stress in the wire at full wind (per spring), psi.
function wireStress(d, maxTorque) {
  return (32 * maxTorque) / (Math.PI * Math.pow(d, 3));
}
// Continuous estimated cycle life for a wire at a fixed max torque (per spring).
// Torque is fixed by the door + drum, so a thicker wire → lower stress → longer life.
export function lifeForWire(d, maxTorque) {
  return LIFE_REF_CYCLES * Math.pow(SIGMA_10K / wireStress(d, maxTorque), LIFE_EXP);
}

/**
 * Compute the recommended torsion spring.
 * input: { doorHeightIn, doorWeight, numberOfSprings, innerDiameter, targetCycles, drum }
 * returns result object, or { error } when inputs are incomplete.
 */
export function computeSpring(input) {
  const { doorHeightIn, doorWeight, numberOfSprings, innerDiameter, targetCycles, drum } = input;
  if (!drum) return { error: 'Select a drum to continue.' };
  const weight = Number(doorWeight);
  if (!weight || weight <= 0) return { error: 'Enter the door weight to see a recommendation.' };
  const n = Number(numberOfSprings) || 1;

  const warnings = [];
  if (drum.maxHeight && doorHeightIn > drum.maxHeight)
    warnings.push(`This drum is rated up to ${(drum.maxHeight / 12).toFixed(1)}′ tall — your door is taller. Pick a higher-capacity drum.`);
  if (drum.maxWeight && weight > drum.maxWeight)
    warnings.push(`This drum is rated up to ${drum.maxWeight} lbs — your door is heavier. Pick a higher-capacity drum.`);

  const turns = doorHeightIn / drum.dropPerTurn;
  const multiplier = drum.momentArm / turns;      // required IPPT per lb of door
  const tipptTotal = multiplier * weight;          // combined required IPPT (all springs)
  const ipptPerSpring = tipptTotal / n;
  const maxTorque = ipptPerSpring * turns;         // per spring at full wind (fixed by door+drum)

  // Smallest standard wire whose estimated life meets the requested cycles.
  let d = null;
  for (const w of WIRE_SIZES) {
    if (lifeForWire(w, maxTorque) >= targetCycles) { d = w; break; }
  }
  if (d == null) {
    d = WIRE_SIZES[WIRE_SIZES.length - 1];
    warnings.push('No standard wire fully meets the requested cycle life — showing the thickest option.');
  }

  const meanDia = innerDiameter + d;
  const springLength = (IPPT_C * Math.pow(d, IPPT_EXP)) / (meanDia * ipptPerSpring);
  const springWeight = (Math.PI / 4) * d * d * RHO * (springLength / d) * Math.PI * meanDia;

  return {
    wireSize: d,
    innerDiameter,
    springLength,
    springWeight,
    turns,
    tippt: tipptTotal,
    multiplier,
    cycles: round1000(lifeForWire(d, maxTorque)),
    ipptPerSpring,
    numberOfSprings: n,
    warnings,
  };
}

// Format a wire size as its decimal, e.g. 0.192 -> ".192\"", 0.2187 -> ".2187\""
export const fmtWire = (d) => `${d.toFixed(4).replace(/0+$/, '').replace(/^0/, '')}"`;

// Parse a spec string like ".225\"" or "2\"" or "25\"" to a number.
const specNum = (s) => parseFloat(String(s || '').replace(/[^0-9.]/g, ''));

/**
 * Find the best matching in-stock spring for a result.
 * Matches wire size + inner diameter, then the shortest coil length >= needed
 * (falls back to the longest available). Returns the product or null.
 */
export function matchProduct(products, wireSize, innerDiameter, springLength) {
  if (!Array.isArray(products)) return null;
  const candidates = products.filter((p) => {
    const sp = p.specifications || {};
    const w = specNum(sp['Wire Diameter']);
    const id = specNum(sp['Inside Diameter']);
    return Math.abs(w - wireSize) < 0.001 && Math.abs(id - innerDiameter) < 0.01;
  });
  if (!candidates.length) return null;
  const withLen = candidates
    .map((p) => ({ p, len: specNum((p.specifications || {})['Coil Length']) }))
    .sort((a, b) => a.len - b.len);
  const fit = withLen.find((c) => c.len >= springLength - 0.01);
  return (fit || withLen[withLen.length - 1]).p;
}
