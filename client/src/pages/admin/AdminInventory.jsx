import { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLowStock = () => {
    setLoading(true);
    api.get('/admin/inventory/low-stock').then(r => setProducts(r.data)).finally(() => setLoading(false));
  };

  useEffect(fetchLowStock, []);

  const handleSave = async (id) => {
    setSaving(true);
    try {
      await api.put(`/admin/products/${id}/stock`, { stock_qty: parseInt(editQty) });
      setEditingId(null);
      fetchLowStock();
    } finally {
      setSaving(false);
    }
  };

  const getStockStatus = (qty, min) => {
    if (qty === 0) return { label: 'Out of Stock', color: 'var(--error)' };
    if (qty <= min / 2) return { label: 'Critical', color: 'var(--error)' };
    return { label: 'Low', color: 'var(--warning)' };
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Inventory — Low Stock Alerts</h1>
        <span style={{color:'var(--text-secondary)', fontSize:'14px'}}>{products.length} items need attention</span>
      </div>

      {products.length === 0 && !loading ? (
        <div className="card">
          <div className="card-body text-center" style={{padding:'60px 0'}}>
            <div style={{fontSize:'48px', marginBottom:'12px'}}>✅</div>
            <h3>All inventory levels are healthy</h3>
            <p className="text-muted">No products are below their minimum stock alert threshold.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            {loading ? <div className="loading-center"><div className="spinner" /></div> : (
              <table>
                <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Stock</th><th>Min Alert</th><th>Status</th><th>Update Stock</th></tr></thead>
                <tbody>
                  {products.map(p => {
                    const st = getStockStatus(p.stock_qty, p.min_stock_alert);
                    return (
                      <tr key={p.id}>
                        <td><strong style={{fontSize:'13px'}}>{p.name}</strong></td>
                        <td style={{fontFamily:'monospace', fontSize:'12px'}}>{p.sku}</td>
                        <td style={{fontSize:'13px'}}>{p.category_name || '—'}</td>
                        <td>
                          <strong style={{color: st.color, fontSize:'16px'}}>{p.stock_qty}</strong>
                          <span style={{fontSize:'12px', color:'var(--text-secondary)'}}> units</span>
                        </td>
                        <td style={{color:'var(--text-secondary)', fontSize:'13px'}}>{p.min_stock_alert}</td>
                        <td><span className="badge" style={{background: st.color + '22', color: st.color}}>{st.label}</span></td>
                        <td>
                          {editingId === p.id ? (
                            <div style={{display:'flex', gap:'6px', alignItems:'center'}}>
                              <input
                                type="number" min="0" className="form-input"
                                style={{width:'90px', padding:'6px 10px', fontSize:'14px'}}
                                value={editQty}
                                onChange={e => setEditQty(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSave(p.id)}
                              />
                              <button className={`btn btn-primary btn-sm ${saving ? 'btn-loading' : ''}`} onClick={() => handleSave(p.id)}>Save</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>✕</button>
                            </div>
                          ) : (
                            <button className="btn btn-outline btn-sm" onClick={() => { setEditingId(p.id); setEditQty(p.stock_qty.toString()); }}>
                              Update
                            </button>
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
      )}
    </div>
  );
}
