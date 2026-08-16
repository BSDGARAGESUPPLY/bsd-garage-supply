import { useState, useEffect } from 'react';
import api from '../../api';

const fmt = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const num = (n) => Number(n || 0).toLocaleString();

export default function AdminInventory() {
  const [data, setData] = useState({ summary: null, categories: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const fetchData = () => {
    setLoading(true);
    api.get('/admin/inventory/summary').then(r => setData(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const handleSave = async (id) => {
    setSaving(true);
    try {
      await api.put(`/admin/products/${id}/stock`, { stock_qty: parseInt(editQty) });
      setEditingId(null);
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const s = data.summary;
  const rows = showAll ? data.products : data.products.filter(p => p.stock_qty <= p.min_stock_alert);

  const cards = s ? [
    { label: 'Products in stock', value: `${num(s.in_stock_count)} / ${num(s.product_count)}`, sub: `${num(s.out_of_stock)} out of stock` },
    { label: 'Total units on hand', value: num(s.total_units), sub: 'across all products' },
    { label: 'Inventory Value (Tech)', value: fmt(s.value_tech), sub: 'at your tech / cost prices', gold: true },
    { label: 'If sold at retail', value: fmt(s.value_retail), sub: 'retail (client) prices' },
  ] : [];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Inventory &amp; Value</h1>
        {s && <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{num(s.total_units)} units · {fmt(s.value_tech)} value</span>}
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {cards.map(c => (
              <div key={c.label} className="card" style={{ padding: '18px 20px', borderTop: c.gold ? '3px solid var(--gold)' : undefined }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>{c.label}</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: c.gold ? 'var(--gold-dark)' : 'var(--text-primary)', margin: '6px 0 2px' }}>{c.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Per-category breakdown */}
          {data.categories.length > 0 && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header"><h3 style={{ fontWeight: 700 }}>By category</h3></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Category</th><th>SKUs</th><th>Units</th><th>Value (Tech)</th><th>Value (Retail)</th></tr></thead>
                  <tbody>
                    {data.categories.map(c => (
                      <tr key={c.category}>
                        <td><strong style={{ fontSize: '13px' }}>{c.category}</strong></td>
                        <td>{num(c.skus)}</td>
                        <td>{num(c.units)}</td>
                        <td style={{ fontWeight: 700 }}>{fmt(c.value_tech)}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{fmt(c.value_retail)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Product table */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700 }}>{showAll ? 'All products' : 'Low stock'}</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAll(v => !v)}>
                {showAll ? 'Show low stock only' : `Show all ${num(data.products.length)} products`}
              </button>
            </div>
            <div className="table-wrap">
              {rows.length === 0 ? (
                <div className="text-center" style={{ padding: '48px 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
                  <h3>All inventory levels are healthy</h3>
                  <p className="text-muted">No products are below their minimum stock alert.</p>
                </div>
              ) : (
                <table>
                  <thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Tech</th><th>Retail</th><th>Value (Tech)</th><th>Update</th></tr></thead>
                  <tbody>
                    {rows.map(p => {
                      const low = p.stock_qty <= p.min_stock_alert;
                      const color = p.stock_qty === 0 ? 'var(--error)' : low ? 'var(--warning)' : 'var(--text-primary)';
                      return (
                        <tr key={p.id}>
                          <td><strong style={{ fontSize: '13px' }}>{p.name}</strong></td>
                          <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{p.sku}</td>
                          <td><strong style={{ color, fontSize: '15px' }}>{num(p.stock_qty)}</strong></td>
                          <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{fmt(p.wholesale_price)}</td>
                          <td style={{ fontSize: '13px' }}>{fmt(p.retail_price)}</td>
                          <td style={{ fontWeight: 700 }}>{fmt(p.stock_qty * p.wholesale_price)}</td>
                          <td>
                            {editingId === p.id ? (
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input type="number" min="0" className="form-input" style={{ width: '84px', padding: '6px 10px', fontSize: '14px' }}
                                  value={editQty} onChange={e => setEditQty(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave(p.id)} />
                                <button className={`btn btn-primary btn-sm ${saving ? 'btn-loading' : ''}`} onClick={() => handleSave(p.id)}>Save</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>✕</button>
                              </div>
                            ) : (
                              <button className="btn btn-outline btn-sm" onClick={() => { setEditingId(p.id); setEditQty(String(p.stock_qty)); }}>Update</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
