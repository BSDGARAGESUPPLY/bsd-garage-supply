import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const STATUS_COLORS = { pending_payment:'#f59e0b', processing:'#3b82f6', shipped:'#0ea5e9', delivered:'#22c55e', cancelled:'#ef4444' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <span style={{color:'var(--text-secondary)', fontSize:'14px'}}>{new Date().toLocaleDateString('en-US', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</span>
      </div>

      <div className="admin-stats">
        {[
          { icon: '💰', value: fmt(stats?.totalRevenue), label: 'Total Revenue', sub: `${fmt(stats?.monthRevenue)} this month` },
          { icon: '🛒', value: stats?.totalOrders, label: 'Total Orders', sub: 'All time' },
          { icon: '👥', value: stats?.pendingApprovals, label: 'Pending Approvals', sub: <Link to="/admin/customers?status=pending" style={{color:'var(--accent)'}}>Review now →</Link> },
          { icon: '⚠️', value: stats?.lowStock, label: 'Low Stock Alerts', sub: <Link to="/admin/inventory" style={{color:'var(--accent)'}}>View inventory →</Link> },
        ].map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-icon">{s.icon}</div>
            <div className="admin-stat-value">{s.value}</div>
            <div className="admin-stat-label">{s.label}</div>
            <div className="admin-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{fontWeight:700}}>Recent Orders</h3>
          <Link to="/admin/orders" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {stats?.recentOrders?.length === 0 ? (
          <div className="card-body text-center text-muted">No orders yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {stats?.recentOrders?.map(o => (
                  <tr key={o.id}>
                    <td style={{fontFamily:'monospace', fontSize:'13px', fontWeight:600}}>{o.order_number}</td>
                    <td>{o.company_name}</td>
                    <td style={{color:'var(--text-secondary)', fontSize:'13px'}}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td><strong>{fmt(o.total)}</strong></td>
                    <td>
                      <span className="badge" style={{background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status]}}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td><Link to={`/orders/${o.id}`} className="btn btn-ghost btn-sm">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
