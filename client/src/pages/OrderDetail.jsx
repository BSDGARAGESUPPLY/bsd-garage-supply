import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

const fmt = (n) => `$${Number(n).toFixed(2)}`;
const STATUS_LABEL = { pending_payment:'Pending Payment', processing:'Processing', shipped:'Shipped', delivered:'Delivered', cancelled:'Cancelled' };

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!order) return <div className="container section-sm"><div className="alert alert-error">Order not found.</div></div>;

  return (
    <div>
      <div className="page-header">
        <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px'}}>
          <div>
            <h1>Order {order.order_number}</h1>
            <p>Placed {new Date(order.created_at).toLocaleDateString()} · <span className={`badge status-${order.status}`}>{STATUS_LABEL[order.status] || order.status}</span></p>
          </div>
          <Link to="/orders" className="btn btn-outline-white">← Back to Orders</Link>
        </div>
      </div>

      <div className="container section-sm">
        <div style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:'24px', alignItems:'start'}}>
          <div>
            {/* Items */}
            <div className="card" style={{marginBottom:'24px'}}>
              <div className="card-header"><h3 style={{fontWeight:700}}>Order Items</h3></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                  <tbody>
                    {order.items?.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            {item.images?.[0] && <img src={item.images[0]} alt="" style={{width:40,height:40,objectFit:'cover',borderRadius:4}} />}
                            <strong style={{fontSize:'13px'}}>{item.product_name}</strong>
                          </div>
                        </td>
                        <td style={{fontFamily:'monospace', fontSize:'12px'}}>{item.product_sku}</td>
                        <td>{item.quantity}</td>
                        <td>{fmt(item.unit_price)}</td>
                        <td><strong>{fmt(item.total_price)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tracking */}
            {order.tracking_number && (
              <div className="card">
                <div className="card-header"><h3 style={{fontWeight:700}}>Tracking</h3></div>
                <div className="card-body">
                  <div style={{display:'flex', gap:'16px', flexWrap:'wrap'}}>
                    <div><span style={{fontSize:'12px', color:'var(--text-secondary)'}}>Carrier</span><br/><strong>{order.shipping_carrier || '—'}</strong></div>
                    <div><span style={{fontSize:'12px', color:'var(--text-secondary)'}}>Tracking #</span><br/><strong style={{fontFamily:'monospace'}}>{order.tracking_number}</strong></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <div className="card" style={{marginBottom:'16px'}}>
              <div className="card-header"><h3 style={{fontWeight:700}}>Order Summary</h3></div>
              <div className="card-body">
                <div style={{display:'flex', flexDirection:'column', gap:'10px', fontSize:'14px'}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                  <div style={{display:'flex', justifyContent:'space-between'}}><span>Shipping ({order.shipping_method})</span><span>{fmt(order.shipping_cost)}</span></div>
                  {order.tax > 0 && <div style={{display:'flex', justifyContent:'space-between'}}><span>Tax</span><span>{fmt(order.tax)}</span></div>}
                  <hr className="divider" style={{margin:'4px 0'}}/>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'18px', fontWeight:800}}><span>Total</span><span style={{color:'var(--accent)'}}>{fmt(order.total)}</span></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3 style={{fontWeight:700}}>Ship To</h3></div>
              <div className="card-body" style={{fontSize:'14px', lineHeight:1.8}}>
                <strong>{order.shipping_name}</strong><br/>
                {order.shipping_address}<br/>
                {order.shipping_city}, {order.shipping_state} {order.shipping_zip}<br/>
                {order.shipping_country}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
