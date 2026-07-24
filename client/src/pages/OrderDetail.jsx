import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../api';

const fmt = (n) => `$${Number(n).toFixed(2)}`;
const STATUS_LABEL = { pending_payment:'Pending Payment', processing:'Processing', shipped:'Shipped', delivered:'Delivered', cancelled:'Cancelled' };
const PAY_LABEL = { card:'Card', zelle:'Zelle', cash:'Cash at pickup' };
const DEFAULT_ZELLE = 'bsdgaragesupply@gmail.com';
const DEFAULT_PICKUP = '2634 NE 9th Ave, Cape Coral, FL 33909';

export default function OrderDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).finally(() => setLoading(false));
    api.get('/config').then(r => setConfig(r.data)).catch(() => {});
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!order) return <div className="container section-sm"><div className="alert alert-error">Order not found.</div></div>;

  const isPickup = order.shipping_method === 'Local Pickup' || !order.shipping_address;
  const unpaid = order.payment_status !== 'paid';
  const offline = order.payment_method === 'zelle' || order.payment_method === 'cash';
  const zelleRecipient = config.zelleRecipient || DEFAULT_ZELLE;
  const pickupAddress = config.pickupAddress || DEFAULT_PICKUP;
  const justPlaced = params.get('placed') === '1' || params.get('success') === '1';

  return (
    <div>
      <div className="page-header no-print">
        <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px'}}>
          <div>
            <h1>Order {order.order_number}</h1>
            <p>
              Placed {new Date(order.created_at).toLocaleDateString()} ·{' '}
              <span className={`badge status-${order.status}`}>{STATUS_LABEL[order.status] || order.status}</span>{' '}
              {unpaid
                ? <span className="badge" style={{background:'#fbeaea', color:'#c0392b'}}>Unpaid</span>
                : <span className="badge" style={{background:'var(--success-bg)', color:'#157347'}}>Paid</span>}
            </p>
          </div>
          <div style={{display:'flex', gap:'10px'}}>
            <button onClick={() => window.print()} className="btn btn-outline">🖨 Print Invoice</button>
            <Link to="/orders" className="btn btn-outline">← Back to Orders</Link>
          </div>
        </div>
      </div>

      <div className="container section-sm">
        {justPlaced && (
          <div className="alert alert-success no-print" style={{marginBottom:'20px'}}>
            ✅ Your order has been placed! {offline && unpaid ? 'See the payment instructions below to complete it.' : 'Thank you for your order.'}
          </div>
        )}

        {/* Payment instructions for unpaid Zelle / cash orders */}
        {offline && unpaid && (
          <div className="card" style={{marginBottom:'24px', border:'2px solid var(--gold)'}}>
            <div className="card-header"><h3 style={{fontWeight:700}}>🧾 Payment Required — {PAY_LABEL[order.payment_method]}</h3></div>
            <div className="card-body">
              {order.payment_method === 'zelle' ? (
                <>
                  <p style={{margin:'0 0 8px', fontSize:'15px'}}>Send <strong>{fmt(order.total)}</strong> via <strong>Zelle</strong> to:</p>
                  <div className="invoice-pay-highlight">{zelleRecipient}</div>
                  <p style={{margin:'10px 0 0', fontSize:'13px', color:'var(--text-secondary)'}}>
                    Put your order number <strong>{order.order_number}</strong> in the Zelle memo so we can match your payment.
                  </p>
                </>
              ) : (
                <>
                  <p style={{margin:'0 0 8px', fontSize:'15px'}}>Bring <strong>{fmt(order.total)}</strong> in cash when you pick up your order at:</p>
                  <div className="invoice-pay-highlight">{pickupAddress}</div>
                  <p style={{margin:'10px 0 0', fontSize:'13px', color:'var(--text-secondary)'}}>
                    We'll have your order ready. We'll mark it paid once you pick up.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="order-detail-grid" style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:'24px', alignItems:'start'}}>
          <div>
            {/* Items */}
            <div className="card" style={{marginBottom:'24px'}}>
              <div className="card-header"><h3 style={{fontWeight:700}}>Order Items</h3></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Weight</th><th>Unit Price</th><th>Total</th></tr></thead>
                  <tbody>
                    {order.items?.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            {item.images?.[0] && <img src={item.images[0]} alt="" style={{width:40,height:40,objectFit:'contain',borderRadius:4}} />}
                            <strong style={{fontSize:'13px'}}>{item.product_name}</strong>
                          </div>
                        </td>
                        <td style={{fontFamily:'monospace', fontSize:'12px'}}>{item.product_sku}</td>
                        <td>{item.quantity}</td>
                        <td>{item.weight ? `${(item.weight * item.quantity).toFixed(1)} lbs` : '—'}</td>
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
                  <div style={{display:'flex', justifyContent:'space-between'}}><span>Total Weight</span><span>{Number(order.total_weight || 0).toFixed(1)} lbs</span></div>
                  <div style={{display:'flex', justifyContent:'space-between'}}><span>{isPickup ? 'Pickup' : `Shipping (${order.shipping_method})`}</span><span>{order.shipping_cost > 0 ? fmt(order.shipping_cost) : <span className="text-success">FREE</span>}</span></div>
                  {order.tax > 0 && <div style={{display:'flex', justifyContent:'space-between'}}><span>Sales Tax</span><span>{fmt(order.tax)}</span></div>}
                  <div style={{display:'flex', justifyContent:'space-between'}}><span>Payment</span><span>{PAY_LABEL[order.payment_method] || 'Card'}</span></div>
                  <hr className="divider" style={{margin:'4px 0'}}/>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'18px', fontWeight:800}}><span>Total</span><span style={{color:'var(--gold-dark)'}}>{fmt(order.total)}</span></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3 style={{fontWeight:700}}>{isPickup ? 'Pickup' : 'Ship To'}</h3></div>
              <div className="card-body" style={{fontSize:'14px', lineHeight:1.8}}>
                {isPickup ? (
                  <>
                    <strong>{order.shipping_name}</strong><br/>
                    {pickupAddress}
                  </>
                ) : (
                  <>
                    <strong>{order.shipping_name}</strong><br/>
                    {order.shipping_address}<br/>
                    {order.shipping_city}, {order.shipping_state} {order.shipping_zip}<br/>
                    {order.shipping_country}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
