import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const fmt = (n) => `$${Number(n).toFixed(2)}`;
const STATUS_LABEL = { pending_payment:'Pending Payment', processing:'Processing', shipped:'Shipped', delivered:'Delivered', cancelled:'Cancelled' };

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Order History</h1>
          <p>Track and review all your wholesale orders</p>
        </div>
      </div>
      <div className="container section-sm">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center" style={{padding: '80px 0'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>📦</div>
            <h3 style={{marginBottom: '8px'}}>No orders yet</h3>
            <p className="text-muted" style={{marginBottom: '24px'}}>Your order history will appear here once you place your first order.</p>
            <Link to="/catalog" className="btn btn-primary btn-lg">Browse Products</Link>
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h2 style={{fontSize: '16px', fontWeight: 700}}>All Orders ({orders.length})</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Order #</th><th>Date</th><th>Items</th><th>Shipping</th><th>Total</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><strong style={{fontFamily: 'monospace', fontSize: '13px'}}>{o.order_number}</strong></td>
                      <td>{new Date(o.created_at).toLocaleDateString()}</td>
                      <td>{o.item_count} item{o.item_count !== 1 ? 's' : ''}</td>
                      <td>{o.shipping_method || '—'}</td>
                      <td><strong>{fmt(o.total)}</strong></td>
                      <td><span className={`badge status-${o.status}`}>{STATUS_LABEL[o.status] || o.status}</span></td>
                      <td><Link to={`/orders/${o.id}`} className="btn btn-outline btn-sm">Details →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
