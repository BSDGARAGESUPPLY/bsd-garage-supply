import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api';

export default function AdminCustomers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ customers: [], total: 0 });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const status = searchParams.get('status') || '';

  const fetchCustomers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    api.get(`/admin/customers?${params}`).then(r => setData(r.data)).finally(() => setLoading(false));
  };

  useEffect(fetchCustomers, [status]);

  const handleStatus = async (id, newStatus, price_tier) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/customers/${id}/status`, { status: newStatus, notes, price_tier });
      setSelected(null);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update the account.');
    } finally {
      setActionLoading(false);
    }
  };

  const tierBadge = (t) => t === 'tech' ? '🔧 Tech' : t === 'client' ? '🛒 Retail' : null;

  const openCustomer = async (id) => {
    const { data: customer } = await api.get(`/admin/customers/${id}`);
    setSelected(customer);
    setNotes(customer.notes || '');
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove ${name || 'this customer'}? This permanently deletes their account and cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/customers/${id}`);
      setSelected(null);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not remove customer.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Customers</h1>
        <span style={{color:'var(--text-secondary)', fontSize:'14px'}}>{data.total} total</span>
      </div>

      <div className="table-toolbar">
        <div style={{display:'flex', gap:'8px'}}>
          {[['','All'],['pending','Pending'],['approved','Approved'],['rejected','Rejected']].map(([val, label]) => (
            <button
              key={val}
              className={`btn btn-sm ${status === val ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => { const n = new URLSearchParams(); if(val) n.set('status',val); setSearchParams(n); }}
            >{label}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <table>
              <thead><tr><th>Company</th><th>Contact</th><th>Business Type</th><th>Location</th><th>Applied</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {data.customers.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.company_name}</strong></td>
                    <td>
                      <div style={{fontSize:'13px'}}>{c.contact_name}</div>
                      <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>{c.email}</div>
                    </td>
                    <td style={{fontSize:'13px'}}>{c.business_type || '—'}</td>
                    <td style={{fontSize:'13px'}}>{c.city && c.state ? `${c.city}, ${c.state}` : '—'}</td>
                    <td style={{fontSize:'13px', color:'var(--text-secondary)'}}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge status-${c.status}`}>{c.status}</span>
                      {c.price_tier && <div style={{fontSize:'11px', color:'var(--text-secondary)', marginTop:'4px'}}>{tierBadge(c.price_tier)}</div>}
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'6px'}}>
                        <button className="btn btn-outline btn-sm" onClick={() => openCustomer(c.id)}>Review</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.company_name)}>Remove</button>
                      </div>
                    </td>
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
              <h2>{selected.company_name}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px'}}>
                {[['Contact', selected.contact_name], ['Email', selected.email], ['Phone', selected.phone], ['Business Type', selected.business_type], ['Address', `${selected.address || ''} ${selected.city || ''} ${selected.state || ''} ${selected.zip || ''}`], ['Applied', new Date(selected.created_at).toLocaleString()], ['Status', selected.status.toUpperCase()], ['Pricing Tier', tierBadge(selected.price_tier)]].map(([k, v]) => v && (
                  <div key={k}>
                    <div style={{fontSize:'11px', fontWeight:700, textTransform:'uppercase', color:'var(--text-secondary)', marginBottom:'3px'}}>{k}</div>
                    <div style={{fontSize:'14px', fontWeight: k === 'Status' ? 700 : 400}}>{v}</div>
                  </div>
                ))}
              </div>

              {selected.orders?.length > 0 && (
                <div style={{marginBottom:'20px'}}>
                  <div style={{fontSize:'12px', fontWeight:700, textTransform:'uppercase', color:'var(--text-secondary)', marginBottom:'8px'}}>Order History ({selected.orders.length})</div>
                  {selected.orders.map(o => (
                    <div key={o.id} style={{display:'flex', justifyContent:'space-between', fontSize:'13px', padding:'6px 0', borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontFamily:'monospace'}}>{o.order_number}</span>
                      <span>{new Date(o.created_at).toLocaleDateString()}</span>
                      <span><strong>${o.total?.toFixed(2)}</strong></span>
                      <span className={`badge status-${o.status}`}>{o.status}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Admin Notes (optional)</label>
                <textarea className="form-textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes about this customer..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" style={{marginRight:'auto'}} onClick={() => handleDelete(selected.id, selected.company_name)} disabled={actionLoading}>Remove Customer</button>
              {selected.status === 'approved' ? (
                <button className="btn btn-outline" onClick={() => handleStatus(selected.id, 'pending')} disabled={actionLoading}>Revoke Access</button>
              ) : (
                <>
                  <button className="btn btn-outline" onClick={() => handleStatus(selected.id, 'rejected')} disabled={actionLoading}>Reject</button>
                  <button className="btn btn-secondary" onClick={() => handleStatus(selected.id, 'approved', 'client')} disabled={actionLoading}>Approve · 🛒 Retail</button>
                  <button className={`btn btn-primary ${actionLoading ? 'btn-loading' : ''}`} onClick={() => handleStatus(selected.id, 'approved', 'tech')} disabled={actionLoading}>Approve · 🔧 Technician</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
