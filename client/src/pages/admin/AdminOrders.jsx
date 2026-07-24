import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const STATUSES = ['pending_approval','pending_payment','processing','shipped','delivered','cancelled'];
const PAY_LABEL = { card:'Card', zelle:'Zelle', cash:'Cash' };

export default function AdminOrders() {
  const [data, setData] = useState({ orders: [], total: 0 });
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    api.get(`/admin/orders?${params}`).then(r => setData(r.data)).finally(() => setLoading(false));
  };

  useEffect(fetchOrders, [filter]);

  const openOrder = (order) => {
    setSelected(order);
    setEditForm({ status: order.status, tracking_number: order.tracking_number || '', shipping_carrier: order.shipping_carrier || '', notes: order.notes || '', payment_method: order.payment_method || 'card' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/orders/${selected.id}`, editForm);
      setSelected(null);
      fetchOrders();
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (paid) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/orders/${selected.id}/paid`, { paid });
      setSelected({ ...selected, payment_status: data.payment_status, status: data.status });
      setEditForm(f => ({ ...f, status: data.status }));
      fetchOrders();
    } finally {
      setSaving(false);
    }
  };

  const approveOrder = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/orders/${selected.id}/approve`);
      setSelected({ ...selected, status: data.status });
      setEditForm(f => ({ ...f, status: data.status }));
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not approve this order.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Orders</h1>
        <span style={{color:'var(--text-secondary)', fontSize:'14px'}}>{data.total} total</span>
      </div>

      <div className="table-toolbar">
        <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
          <button className={`btn btn-sm ${!filter ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setFilter('')}>All</button>
          {STATUSES.map(s => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setFilter(s)}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <table>
              <thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {data.orders.map(o => (
                  <tr key={o.id}>
                    <td style={{fontFamily:'monospace', fontSize:'13px', fontWeight:600}}>{o.order_number}</td>
                    <td>
                      <div style={{fontSize:'13px', fontWeight:600}}>{o.company_name}</div>
                      <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>{o.customer_email}</div>
                    </td>
                    <td style={{fontSize:'13px', color:'var(--text-secondary)'}}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td><strong>{fmt(o.total)}</strong></td>
                    <td>
                      <span className={`badge ${o.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{o.payment_status}</span>
                      <div style={{fontSize:'11px', color:'var(--text-secondary)', marginTop:'3px'}}>{PAY_LABEL[o.payment_method] || 'Card'}</div>
                    </td>
                    <td><span className={`badge status-${o.status}`}>{o.status.replace('_', ' ')}</span></td>
                    <td><button className="btn btn-outline btn-sm" onClick={() => openOrder(o)}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order {selected.order_number}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px', fontSize:'14px'}}>
                <div><span style={{color:'var(--text-secondary)'}}>Customer:</span> <strong>{selected.company_name}</strong></div>
                <div><span style={{color:'var(--text-secondary)'}}>Total:</span> <strong>{fmt(selected.total)}</strong></div>
                <div><span style={{color:'var(--text-secondary)'}}>Payment:</span> <span className={`badge ${selected.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{selected.payment_status}</span></div>
                <div><span style={{color:'var(--text-secondary)'}}>Method:</span> <strong>{PAY_LABEL[selected.payment_method] || 'Card'}</strong></div>
              </div>

              {selected.status === 'pending_approval' && (
                <div style={{marginBottom:'20px', padding:'14px 16px', background:'var(--gold-bg)', border:'1px solid var(--gold-border)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap'}}>
                  <span style={{fontSize:'13px', color:'var(--text-secondary)'}}>
                    New {PAY_LABEL[selected.payment_method] || 'offline'} order awaiting your approval. Approving reserves stock and emails the invoice to the customer.
                  </span>
                  <button className={`btn btn-primary btn-sm ${saving ? 'btn-loading' : ''}`} onClick={approveOrder} disabled={saving}>✓ Approve &amp; Send Invoice</button>
                </div>
              )}
              {selected.status !== 'pending_approval' && selected.payment_status !== 'paid' && (
                <div style={{marginBottom:'20px', padding:'14px 16px', background:'var(--gold-bg)', border:'1px solid var(--gold-border)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap'}}>
                  <span style={{fontSize:'13px', color:'var(--text-secondary)'}}>
                    {selected.payment_method === 'zelle' ? 'Received the Zelle payment?' : selected.payment_method === 'cash' ? 'Collected cash at pickup?' : 'Payment not completed yet.'}
                  </span>
                  <button className={`btn btn-primary btn-sm ${saving ? 'btn-loading' : ''}`} onClick={() => markPaid(true)} disabled={saving}>✓ Mark as Paid</button>
                </div>
              )}
              {selected.payment_status === 'paid' && selected.payment_method !== 'card' && (
                <div style={{marginBottom:'20px'}}>
                  <button className="btn btn-outline btn-sm" onClick={() => markPaid(false)} disabled={saving}>Undo — mark unpaid</button>
                </div>
              )}

              <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Order Status</label>
                    <select className="form-select" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" value={editForm.payment_method} onChange={e => setEditForm({...editForm, payment_method: e.target.value})}>
                      <option value="card">Card</option>
                      <option value="zelle">Zelle</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Carrier</label>
                    <input className="form-input" value={editForm.shipping_carrier} onChange={e => setEditForm({...editForm, shipping_carrier: e.target.value})} placeholder="UPS, FedEx, USPS..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tracking Number</label>
                    <input className="form-input" value={editForm.tracking_number} onChange={e => setEditForm({...editForm, tracking_number: e.target.value})} placeholder="1Z999AA10123456784" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Internal Notes</label>
                  <textarea className="form-textarea" rows={2} value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} placeholder="Notes visible to admin only..." />
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{justifyContent:'space-between'}}>
              <a href={`/orders/${selected.id}`} target="_blank" rel="noreferrer" className="btn btn-outline">🖨 View / Print Invoice</a>
              <div style={{display:'flex', gap:'8px'}}>
                <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
                <button className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
