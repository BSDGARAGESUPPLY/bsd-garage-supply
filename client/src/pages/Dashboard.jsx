import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Dashboard.css';

const fmt = (n) => `$${Number(n).toFixed(2)}`;

const STATUS_LABEL = {
  pending_payment: 'Pending Payment',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export default function Dashboard() {
  const { user, isApproved } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isApproved) api.get('/orders').then(r => setOrders(r.data.slice(0, 5))).finally(() => setLoading(false));
    else setLoading(false);
  }, [user, isApproved]);

  const isPending = user && !isApproved;
  const tierLabel = user?.price_tier === 'tech' ? 'Technician (trade pricing)' : user?.price_tier === 'client' ? 'Retail pricing' : null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="container">
          <h1>Welcome back, {user?.company_name}</h1>
          <p>{user?.email} · {user?.contact_name}</p>
        </div>
      </div>

      <div className="container dashboard-layout">
        {isPending && (
          <div className="alert alert-warning dashboard-pending" style={{ marginBottom: '24px' }}>
            <span>⏳</span>
            <div>
              <strong>Your account is pending approval</strong>
              <p>We review new accounts within 1 business day and will email you once you're approved and your pricing is set up. In the meantime you can <Link to="/catalog">browse the catalog</Link>.</p>
            </div>
          </div>
        )}
        <div className="dashboard-grid">
          {/* Account Card */}
          <div className="card dashboard-card">
            <div className="card-header">
              <h3>Account Details</h3>
              <span className={`badge ${isApproved ? 'badge-success' : 'badge-warning'}`}>{isApproved ? 'Active' : 'Pending'}</span>
            </div>
            <div className="card-body account-details">
              <div className="account-row"><span>Company</span><strong>{user?.company_name}</strong></div>
              <div className="account-row"><span>Contact</span><strong>{user?.contact_name}</strong></div>
              <div className="account-row"><span>Email</span><strong>{user?.email}</strong></div>
              <div className="account-row"><span>Phone</span><strong>{user?.phone}</strong></div>
              <div className="account-row"><span>Business Type</span><strong>{user?.business_type || '—'}</strong></div>
              {tierLabel && <div className="account-row"><span>Pricing</span><strong>{tierLabel}</strong></div>}
              {user?.city && <div className="account-row"><span>Location</span><strong>{user?.city}, {user?.state} {user?.zip}</strong></div>}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card dashboard-card">
            <div className="card-header"><h3>Quick Actions</h3></div>
            <div className="card-body quick-actions">
              <Link to="/catalog" className="quick-action">
                <span>🛒</span>
                <div><strong>Browse Products</strong><p>View the full catalog and pricing</p></div>
                <span>→</span>
              </Link>
              {isApproved && (
                <Link to="/orders" className="quick-action">
                  <span>📦</span>
                  <div><strong>Order History</strong><p>Track and view past orders</p></div>
                  <span>→</span>
                </Link>
              )}
              {isApproved && (
                <Link to="/checkout" className="quick-action">
                  <span>💳</span>
                  <div><strong>Checkout</strong><p>Complete your current order</p></div>
                  <span>→</span>
                </Link>
              )}
              <Link to="/catalog?category=torsion-springs" className="quick-action">
                <span>🌀</span>
                <div><strong>Torsion Springs</strong><p>Most popular category</p></div>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        {isApproved && (
          <div className="card" style={{marginTop: '24px'}}>
            <div className="card-header">
              <h3>Recent Orders</h3>
              <Link to="/orders" className="btn btn-outline btn-sm">View All</Link>
            </div>
            {loading ? (
              <div className="loading-center"><div className="spinner-sm spinner" /></div>
            ) : orders.length === 0 ? (
              <div className="card-body text-center" style={{padding: '40px'}}>
                <p className="text-muted">No orders yet. <Link to="/catalog" style={{color:'var(--accent)'}}>Start shopping</Link></p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Order #</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td><strong>{order.order_number}</strong></td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td>{order.item_count} item{order.item_count !== 1 ? 's' : ''}</td>
                        <td><strong>{fmt(order.total)}</strong></td>
                        <td><span className={`badge status-${order.status}`}>{STATUS_LABEL[order.status] || order.status}</span></td>
                        <td><Link to={`/orders/${order.id}`} className="btn btn-ghost btn-sm">View →</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
