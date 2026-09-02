import { useState, useEffect } from 'react';
import api from '../../api';

const GROUPS = [
  { key: 'sizes', title: 'Sizes', priceKey: 'base', priceLabel: 'Base price' },
  { key: 'styles', title: 'Panel Styles', priceKey: 'add', priceLabel: 'Add-on' },
  { key: 'colors', title: 'Colors', priceKey: 'add', priceLabel: 'Add-on', color: true },
  { key: 'windows', title: 'Windows', priceKey: 'add', priceLabel: 'Add-on' },
  { key: 'insulation', title: 'Insulation', priceKey: 'add', priceLabel: 'Add-on' },
  { key: 'hardware', title: 'Decorative Hardware', priceKey: 'add', priceLabel: 'Add-on' },
];

export default function AdminDoorBuilder() {
  const [cfg, setCfg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchCfg = () => { setLoading(true); api.get('/admin/door-builder').then(r => setCfg(r.data)).finally(() => setLoading(false)); };
  useEffect(fetchCfg, []);

  const setField = (groupKey, id, field, value) => {
    setCfg(c => ({ ...c, [groupKey]: c[groupKey].map(item => item.id === id ? { ...item, [field]: value } : item) }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try { const { data } = await api.put('/admin/door-builder', cfg); setCfg(data); setSaved(true); }
    finally { setSaving(false); }
  };
  const reset = async () => {
    if (!confirm('Reset all door builder prices and labels back to defaults?')) return;
    setSaving(true);
    try { const { data } = await api.post('/admin/door-builder/reset'); setCfg(data); setSaved(true); }
    finally { setSaving(false); }
  };

  if (loading || !cfg) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Door Builder</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {saved && <span style={{ color: '#157347', fontSize: '13px', fontWeight: 600 }}>✓ Saved</span>}
          <button className="btn btn-outline btn-sm" onClick={reset} disabled={saving}>Reset to defaults</button>
          <button className={`btn btn-primary btn-sm ${saving ? 'btn-loading' : ''}`} onClick={save} disabled={saving}>Save changes</button>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
        Edit the prices and names shown on the public <strong>Design a Door</strong> builder. Base price is per size; every other option adds on top.
      </p>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <strong>Show prices on the builder</strong>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Turn off to hide all prices — customers just design and request a quote.</div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700 }}>
            <input type="checkbox" checked={cfg.showPrices !== false}
              onChange={e => { setCfg(c => ({ ...c, showPrices: e.target.checked })); setSaved(false); }}
              style={{ width: '18px', height: '18px', accentColor: 'var(--gold)' }} />
            {cfg.showPrices !== false ? 'Prices shown' : 'Quote-only'}
          </label>
        </div>
      </div>

      {GROUPS.map(g => (
        <div key={g.key} className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header"><h3 style={{ fontWeight: 700 }}>{g.title}</h3></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Option name</th>{g.color && <th style={{ width: '80px' }}>Color</th>}<th style={{ width: '200px' }}>{g.priceLabel} ($)</th></tr></thead>
              <tbody>
                {(cfg[g.key] || []).map(item => (
                  <tr key={item.id}>
                    <td><input className="form-input" value={item.label} onChange={e => setField(g.key, item.id, 'label', e.target.value)} /></td>
                    {g.color && (
                      <td><input type="color" value={item.hex} onChange={e => setField(g.key, item.id, 'hex', e.target.value)}
                        style={{ width: '46px', height: '38px', border: '1px solid var(--border-strong)', borderRadius: '6px', background: 'none', cursor: 'pointer', padding: '2px' }} /></td>
                    )}
                    <td><input className="form-input" type="number" min="0" step="1" value={item[g.priceKey]}
                      onChange={e => setField(g.key, item.id, g.priceKey, e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className={`btn btn-primary btn-lg ${saving ? 'btn-loading' : ''}`} onClick={save} disabled={saving}>Save changes</button>
      </div>
    </div>
  );
}
