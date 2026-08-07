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

// Spring-rate constant: IPPT(per spring) = K * d^5 / ((ID + d) * L)   [in-lb per turn]
const K_IPPT = 3.1146e6;
// Steel density used for spring weight (lb/in^3).
const RHO = 0.2835;
// Stress→cycle-life calibration: 0.192" wire at the reference torque ≈ 11,000 cycles,
// and roughly doubles per ~22,000 psi of stress relief.
const CYC_REF_STRESS = 244460;
const CYC_REF_CYCLES = 11000;
const CYC_STRESS_PER_DOUBLE = 22000;

// Standard US garage-door torsion wire sizes (inches), smallest → largest.
export const WIRE_SIZES = [
  0.177, 0.192, 0.207, 0.218, 0.225, 0.234, 0.243, 0.250,
  0.262, 0.273, 0.283, 0.295, 0.306, 0.319, 0.331, 0.343,
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

// Estimated cycle life for a wire size at a fixed max torque (per spring).
// Torque is fixed by the door + drum, so a thicker wire → lower stress → more cycles.
export function cyclesForWire(d, maxTorque) {
  const rawStress = (32 * maxTorque) / (Math.PI * Math.pow(d, 3));
  const cyc = CYC_REF_CYCLES * Math.pow(2, (CYC_REF_STRESS - rawStress) / CYC_STRESS_PER_DOUBLE);
  return round1000(cyc);
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

  // Smallest standard wire that meets the requested cycle life.
  let chosen = null;
  for (const d of WIRE_SIZES) {
    const cyc = cyclesForWire(d, maxTorque);
    if (cyc >= targetCycles) { chosen = { d, cyc }; break; }
  }
  if (!chosen) {
    const d = WIRE_SIZES[WIRE_SIZES.length - 1];
    chosen = { d, cyc: cyclesForWire(d, maxTorque) };
    warnings.push('No standard wire fully meets the requested cycle life — showing the highest-cycle option.');
  }

  const d = chosen.d;
  const meanDia = innerDiameter + d;
  const springLength = (K_IPPT * Math.pow(d, 5)) / (meanDia * ipptPerSpring);
  const springWeight = (Math.PI / 4) * d * d * RHO * (springLength / d) * Math.PI * meanDia;

  return {
    wireSize: d,
    innerDiameter,
    springLength,
    springWeight,
    turns,
    tippt: tipptTotal,
    multiplier,
    cycles: chosen.cyc,
    ipptPerSpring,
    numberOfSprings: n,
    warnings,
  };
}

// Format a wire size the way the catalog stores it, e.g. 0.192 -> ".192\""
export const fmtWire = (d) => `.${String(Math.round(d * 1000)).padStart(3, '0')}"`;

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
