import { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import ImageUploader from '../../components/ImageUploader';

const EMPTY = { category_id: '', name: '', sku: '', description: '', tech_price: '', retail_price: '', weight: '', stock_qty: '', min_stock_alert: 10, specifications: '{}', images: [], is_active: 1 };

export default function AdminProducts() {
  const [data, setData] = useState({ products: [], total: 0 });
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 25 });
    if (search) params.set('search', search);
    api.get(`/admin/products?${params}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { api.get('/admin/categories').then(r => setCategories(r.data)); }, []);
  useEffect(fetchProducts, [fetchProducts]);

  const openNew = () => { setEditing(null); setForm(EMPTY); setError(''); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      ...p,
      tech_price: p.wholesale_price ?? '',
      retail_price: p.retail_price ?? '',
      specifications: typeof p.specifications === 'object' ? JSON.stringify(p.specifications, null, 2) : p.specifications,
      images: Array.isArray(p.images) ? p.images : (p.images ? JSON.parse(p.images) : [])
    });
    setError('');
    setModalOpen(true);
  };

  const set = (f) => (e) => setForm({...form, [f]: e.target.value});

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      let specs;
      try { specs = JSON.parse(form.specifications || '{}'); } catch { setError('Specifications must be valid JSON'); setSaving(false); return; }

      const payload = { ...form, specifications: specs, images: Array.isArray(form.images) ? form.images : [] };
      if (editing) {
        await api.put(`/admin/products/${editing.id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this product? It will be hidden from the catalog.')) return;
    await api.delete(`/admin/products/${id}`);
    fetchProducts();
  };

  const totalPages = Math.ceil(data.total / 25);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Products ({data.total})</h1>
        <button className="btn btn-primary" onClick={openNew}>+ Add Product</button>
      </div>

      <div className="table-toolbar">
        <input
          className="search-input" placeholder="Search products by name or SKU..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <table>
              <thead>
                <tr><th>Product</th><th>SKU</th><th>Category</th><th>Tech</th><th>Retail</th><th>Stock</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {data.products.map(p => (
                  <tr key={p.id}>
                    <td><strong style={{fontSize:'13px'}}>{p.name}</strong></td>
                    <td style={{fontFamily:'monospace', fontSize:'12px'}}>{p.sku}</td>
                    <td style={{fontSize:'13px'}}>{p.category_name || '—'}</td>
                    <td style={{color:'var(--gold-dark)', fontWeight:700}}>${Number(p.wholesale_price).toFixed(2)}</td>
                    <td style={{color:'var(--text-secondary)'}}>${Number(p.retail_price).toFixed(2)}</td>
                    <td>
                      <span style={{color: p.stock_qty === 0 ? 'var(--error)' : p.stock_qty <= p.min_stock_alert ? 'var(--warning)' : 'var(--success)', fontWeight:600}}>
                        {p.stock_qty}
                      </span>
                    </td>
                    <td><span className={`badge ${p.is_active ? 'badge-success' : 'badge-gray'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{display:'flex', gap:'6px'}}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        {p.is_active && <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(p.id)}>Hide</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({length: totalPages}, (_, i) => i+1).filter(p => Math.abs(p - page) <= 2).map(p => (
            <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Product' : 'New Product'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error" style={{marginBottom:'16px'}}>{error}</div>}
              <form id="product-form" onSubmit={handleSave} className="product-form">
                <div className="form-section">
                  <div className="form-section-title">Basic Info</div>
                  <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label required">Product Name</label>
                        <input className="form-input" required value={form.name} onChange={set('name')} />
                      </div>
                      <div className="form-group">
                        <label className="form-label required">SKU</label>
                        <input className="form-input" required value={form.sku} onChange={set('sku')} placeholder="TS-162-175-25L" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={form.category_id} onChange={set('category_id')}>
                          <option value="">No category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Active</label>
                        <select className="form-select" value={form.is_active} onChange={e => setForm({...form, is_active: parseInt(e.target.value)})}>
                          <option value={1}>Active</option>
                          <option value={0}>Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" rows={3} value={form.description} onChange={set('description')} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Pricing & Inventory</div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px'}}>
                    <div className="form-group">
                      <label className="form-label required">🔧 Tech Price ($)</label>
                      <input className="form-input" type="number" step="0.01" min="0" value={form.tech_price} onChange={set('tech_price')} />
                      <span className="form-hint">Trade / technician pricing</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label required">🛒 Retail Price ($)</label>
                      <input className="form-input" type="number" step="0.01" min="0" value={form.retail_price} onChange={set('retail_price')} />
                      <span className="form-hint">Retail client pricing</span>
                    </div>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
                    {[['weight','Weight (lbs)'],['stock_qty','Stock Qty'],['min_stock_alert','Min Alert']].map(([f, label]) => (
                      <div key={f} className="form-group">
                        <label className="form-label">{label}</label>
                        <input className="form-input" type="number" step="0.01" min="0" value={form[f]} onChange={set(f)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Specifications (JSON)</div>
                  <div className="form-group">
                    <textarea className="form-textarea" rows={6} value={form.specifications} onChange={set('specifications')} style={{fontFamily:'monospace', fontSize:'13px'}} placeholder='{"Wire Diameter": "0.162\"", "Length": "25\""}' />
                    <span className="form-hint">Must be valid JSON object. Each key-value pair appears in the specifications table.</span>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Product Images</div>
                  <ImageUploader
                    value={Array.isArray(form.images) ? form.images : []}
                    onChange={imgs => setForm({ ...form, images: imgs })}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button form="product-form" type="submit" className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} disabled={saving}>
                {editing ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
