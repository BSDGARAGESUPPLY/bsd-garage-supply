import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import {
  computeSpring, matchProduct, fmtWire,
  WIRE_SIZES, ID_OPTIONS, CYCLE_OPTIONS, HEIGHT_OPTIONS, WIDTH_OPTIONS, TRACK_RADII, DRUMS,
} from '../lib/springEngine';
import './SpringEngineer.css';

const Section = ({ n, title, extra, children }) => (
  <div className="se-section">
    <div className="se-section-head">
      <span className="se-num">{n}</span>
      <h2>{title}</h2>
      <span className="se-rule" />
      {extra}
    </div>
    <div className="se-section-body">{children}</div>
  </div>
);

const Seg = ({ options, value, onChange }) => (
  <div className="se-seg">
    {options.map((o) => (
      <button key={o.value ?? o} type="button"
        className={`se-seg-btn ${(o.value ?? o) === value ? 'active' : ''}`}
        onClick={() => onChange(o.value ?? o)}>
        {o.label ?? o}
      </button>
    ))}
  </div>
);

export default function SpringEngineer() {
  // Defaults mirror the reference example so the page shows a live result immediately.
  const [widthIn, setWidthIn] = useState(192);
  const [heightIn, setHeightIn] = useState(84);
  const [weight, setWeight] = useState(150);
  const [assembly, setAssembly] = useState('single');
  const [numSprings, setNumSprings] = useState(2);
  const [innerDiameter, setInnerDiameter] = useState(2);
  const [cycles, setCycles] = useState(10000);
  const [liftType, setLiftType] = useState('standard');
  const [radius, setRadius] = useState(15);
  const [drumId, setDrumId] = useState('d400-96');
  const [customArm, setCustomArm] = useState(2.2646);
  const [customDrop, setCustomDrop] = useState(10.63);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products?category=torsion-springs&limit=200')
      .then((r) => setProducts(r.data.products || r.data || []))
      .catch(() => {});
  }, []);

  const drum = useMemo(() => {
    const base = DRUMS.find((d) => d.id === drumId) || DRUMS[0];
    return base.custom ? { ...base, momentArm: Number(customArm), dropPerTurn: Number(customDrop) } : base;
  }, [drumId, customArm, customDrop]);

  const result = useMemo(() => computeSpring({
    doorHeightIn: heightIn, doorWeight: weight, numberOfSprings: numSprings,
    innerDiameter, targetCycles: cycles, drum,
  }), [heightIn, weight, numSprings, innerDiameter, cycles, drum]);

  const match = useMemo(() => {
    if (result.error) return null;
    return matchProduct(products, result.wireSize, result.innerDiameter, result.springLength);
  }, [products, result]);

  const adjWeight = (delta) => setWeight((w) => Math.max(0, (Number(w) || 0) + delta));

  return (
    <div className="se-page">
      <div className="se-hero">
        <div className="container">
          <h1>Spring Engineer</h1>
          <p>Enter the door and hardware — we'll size the torsion spring for you and point you to the matching part in stock.</p>
        </div>
      </div>

      <div className="container se-grid">
        {/* 1 — Door */}
        <Section n="1" title="Door">
          <div className="se-fields">
            <div className="se-field">
              <label>Width</label>
              <select value={widthIn} onChange={(e) => setWidthIn(Number(e.target.value))}>
                {WIDTH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="se-field">
              <label>Height</label>
              <select value={heightIn} onChange={(e) => setHeightIn(Number(e.target.value))}>
                {HEIGHT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="se-field se-field-weight">
              <label>Weight</label>
              <div className="se-weight-row">
                <input type="number" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} />
                <span className="se-unit">lbs</span>
                <button type="button" className="se-adj" onClick={() => adjWeight(50)}>+50</button>
                <button type="button" className="se-adj" onClick={() => adjWeight(-50)}>−50</button>
              </div>
            </div>
          </div>
        </Section>

        {/* 2 — Spring */}
        <Section n="2" title="Spring">
          <div className="se-row"><span className="se-label">Assembly</span>
            <Seg options={[{ value: 'single', label: 'Single' }, { value: 'duplex', label: 'Duplex' }, { value: 'triplex', label: 'Triplex' }]} value={assembly} onChange={setAssembly} />
          </div>
          <div className="se-row"><span className="se-label">Number of Springs</span>
            <Seg options={[1, 2, 3, 4]} value={numSprings} onChange={setNumSprings} />
          </div>
          <div className="se-row"><span className="se-label">Inner Diameter</span>
            <select value={innerDiameter} onChange={(e) => setInnerDiameter(Number(e.target.value))}>
              {ID_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="se-row"><span className="se-label">Cycles</span>
            <select value={cycles} onChange={(e) => setCycles(Number(e.target.value))}>
              {CYCLE_OPTIONS.map((c) => <option key={c} value={c}>{c.toLocaleString()}</option>)}
            </select>
          </div>
        </Section>

        {/* 3 — Lift Type and Track */}
        <Section n="3" title="Lift Type and Track">
          <div className="se-row"><span className="se-label">Lift Type</span>
            <Seg options={[{ value: 'standard', label: 'Standard' }, { value: 'vertical', label: 'Vertical' }, { value: 'hilift', label: 'Hi-Lift' }]} value={liftType} onChange={setLiftType} />
          </div>
          <div className="se-row"><span className="se-label">Track Radius</span>
            <Seg options={TRACK_RADII} value={radius} onChange={setRadius} />
          </div>
          {liftType !== 'standard' && (
            <p className="se-note">Standard-lift math is used here. Vertical/hi-lift use different drum geometry — pick a matching drum or use Custom.</p>
          )}
        </Section>

        {/* 4 — Drum */}
        <Section n="4" title="Drum">
          <div className="se-row"><span className="se-label">Select Your Drum</span>
            <select value={drumId} onChange={(e) => setDrumId(e.target.value)}>
              {DRUMS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          {drum.custom ? (
            <div className="se-fields se-custom">
              <div className="se-field"><label>High-point radius (in)</label>
                <input type="number" step="0.01" value={customArm} onChange={(e) => setCustomArm(e.target.value)} /></div>
              <div className="se-field"><label>Cable per turn (in)</label>
                <input type="number" step="0.01" value={customDrop} onChange={(e) => setCustomDrop(e.target.value)} /></div>
            </div>
          ) : (
            <div className="se-drum-details">
              <div><span>Max Height</span><strong>{drum.maxHeight}"</strong></div>
              <div><span>Max Weight</span><strong>{drum.maxWeight} lbs</strong></div>
              <div><span>Max Cable</span><strong>{drum.maxCable}"</strong></div>
              <div><span>Cable Length</span><strong>{drum.cableFormula}</strong></div>
            </div>
          )}
        </Section>
      </div>

      {/* Results */}
      <div className="container">
        <div className={`se-results ${result.error ? 'is-empty' : ''}`}>
          <div className="se-results-head">
            <span className="se-check">{result.error ? 'i' : '✓'}</span>
            <h2>Results</h2>
          </div>
          {result.error ? (
            <div className="se-results-empty">{result.error}</div>
          ) : (
            <>
              <div className="se-tiles">
                <Tile label="Wire Size" value={fmtWire(result.wireSize)} />
                <Tile label="Inner Diameter" value={`${result.innerDiameter}"`} />
                <Tile label="Spring Length" value={`${result.springLength.toFixed(2)}"`} />
                <Tile label="Spring Weight" value={<>{result.springWeight.toFixed(2)} <small>lbs</small></>} />
                <Tile label="Turns" value={result.turns.toFixed(1)} />
                <Tile label="TIPPT" value={Math.round(result.tippt)} />
                <Tile label="Multiplier" value={result.multiplier.toFixed(6)} />
                <Tile label="Cycles" value={result.cycles.toLocaleString()} />
              </div>
              <p className="se-perspring">
                {result.numberOfSprings} × spring — each {fmtWire(result.wireSize)} wire, {result.innerDiameter}" ID, {result.springLength.toFixed(2)}" long.
              </p>

              {result.warnings.map((w, i) => <div key={i} className="se-warn">⚠️ {w}</div>)}

              <div className="se-cta">
                {match ? (
                  <>
                    <div className="se-match">
                      <span className="se-match-badge">In stock</span>
                      <div>
                        <strong>{match.pair_name || match.name}</strong>
                        <span className="se-match-sku">SKU: {match.sku?.replace(/-[LR]$/, '')} · {(match.specifications || {})['Coil Length']} coil</span>
                      </div>
                    </div>
                    <Link to={`/catalog/${match.slug}`} className="btn btn-primary btn-lg">View this spring →</Link>
                  </>
                ) : (
                  <>
                    <p className="se-nomatch">We may not stock this exact size — browse our torsion springs or contact us and we'll source it.</p>
                    <Link to="/catalog?category=torsion-springs" className="btn btn-primary btn-lg">Shop torsion springs →</Link>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="se-disclaimer">
          <strong>For reference only.</strong> These are engineering estimates. Garage door springs are under extreme tension and are safety-critical — a qualified technician must verify the wire size, length, wind, and cycle rating before winding or installing. BSD Garage Supply is not liable for installation decisions.
        </div>
      </div>
    </div>
  );
}

const Tile = ({ label, value }) => (
  <div className="se-tile">
    <span className="se-tile-label">{label}</span>
    <span className="se-tile-value">{value}</span>
  </div>
);
