import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const fmt = (n) => `$${Number(n).toFixed(2)}`;
const DEFAULT_PICKUP = '2634 NE 9th Ave, Cape Coral, FL 33909';

// Card payment — must render inside <Elements>. Creates the order, then charges it.
function CardPaymentStep({ amount, onCreateOrder, onBack }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError('');
    try {
      // Create the order once (reused if a first attempt fails).
      let oid = orderId;
      if (!oid) {
        oid = await onCreateOrder('card');
        if (!oid) { setProcessing(false); return; }
        setOrderId(oid);
      }

      const { data: piData } = await api.post(`/orders/${oid}/payment-intent`);
      const result = await stripe.confirmCardPayment(piData.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: user?.contact_name || user?.company_name || '' }
        }
      });
      if (result.error) { setError(result.error.message); setProcessing(false); return; }

      await api.post(`/orders/${oid}/confirm`, { payment_intent_id: result.paymentIntent.id });
      clearCart();
      navigate(`/orders/${oid}?success=1`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="checkout-form">
      {error && <div className="alert alert-error" style={{ marginBottom: 4 }}>{error}</div>}
      <div className="form-group">
        <label className="form-label">Card Details</label>
        <div className="stripe-card-wrapper">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1b2330',
                fontFamily: '-apple-system, Inter, sans-serif',
                iconColor: '#C8922A',
                '::placeholder': { color: '#8a94a6' }
              },
              invalid: { color: '#d64545', iconColor: '#d64545' }
            }
          }} />
        </div>
      </div>
      <div className="payment-secure-note">
        🔒 Payments are processed securely by Stripe. We never store your card details.
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" className="btn btn-outline" onClick={onBack} disabled={processing}>← Back</button>
        <button type="submit" className={`btn btn-primary btn-lg ${processing ? 'btn-loading' : ''}`} style={{ flex: 1 }} disabled={!stripe || processing}>
          Pay {fmt(amount)}
        </button>
      </div>
    </form>
  );
}

function CheckoutFlow({ stripePromise, config }) {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [method, setMethod] = useState('');   // 'card' | 'zelle' | 'cash'
  const [step, setStep] = useState(1);         // 1 = choose method, 2 = pay / place
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const taxPercent = config.taxPercent || 0;
  const pickupAddress = config.pickupAddress || DEFAULT_PICKUP;

  const totalWeight = cart.items.reduce((sum, i) => sum + (i.weight || 1) * i.quantity, 0);
  const tax = cart.subtotal * (taxPercent / 100);
  const grandTotal = cart.subtotal + tax; // pickup — no shipping charge

  // Create the order server-side. Returns order_id, or null on error.
  const createOrder = async (pm) => {
    setError('');
    try {
      const { data } = await api.post('/orders', { payment_method: pm });
      return data.order_id;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
      return null;
    }
  };

  // Zelle / cash — place the (unpaid) order now and go to the invoice.
  const placeOfflineOrder = async () => {
    setProcessing(true);
    const orderId = await createOrder(method);
    if (orderId) { clearCart(); navigate(`/orders/${orderId}?placed=1`); }
    else setProcessing(false);
  };

  if (!cart.items.length) {
    return (
      <div className="text-center" style={{ padding: '80px 0' }}>
        <p className="text-muted">Your cart is empty.</p>
        <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Products</Link>
      </div>
    );
  }

  const methods = [
    { id: 'card', icon: '💳', title: 'Pay by Card', desc: 'Pay securely online now with any debit or credit card.', disabled: !stripePromise },
    { id: 'zelle', icon: '📲', title: 'Pay by Zelle', desc: 'Get an invoice and send payment by Zelle — no card needed.' },
    { id: 'cash', icon: '💵', title: 'Cash at Pickup', desc: 'Reserve your order and pay cash when you pick it up.' }
  ];

  return (
    <div className="checkout-layout">
      <div className="checkout-main">
        {/* Step indicators */}
        <div className="checkout-steps">
          {['Payment Method', method === 'card' ? 'Card Payment' : 'Review & Place'].map((s, i) => (
            <div key={i} className={`checkout-step ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
              <span className="cs-num">{step > i + 1 ? '✓' : i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        {/* Step 1 — choose payment method */}
        {step === 1 && (
          <div className="card">
            <div className="card-header"><h3>How would you like to pay?</h3></div>
            <div className="card-body">
              <div className="pay-methods">
                {methods.map(m => (
                  <label key={m.id} className={`pay-method ${method === m.id ? 'selected' : ''} ${m.disabled ? 'disabled' : ''}`}>
                    <input type="radio" name="paymethod" disabled={m.disabled} checked={method === m.id} onChange={() => setMethod(m.id)} />
                    <span className="pay-method-icon">{m.icon}</span>
                    <span className="pay-method-text">
                      <strong>{m.title}{m.disabled ? ' (unavailable)' : ''}</strong>
                      <span>{m.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
              <button className="btn btn-primary btn-lg btn-full" style={{ marginTop: 24 }} disabled={!method} onClick={() => setStep(2)}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Card */}
        {step === 2 && method === 'card' && stripePromise && (
          <div className="card">
            <div className="card-header">
              <h3>Card Payment</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Change method</button>
            </div>
            <div className="card-body">
              <Elements stripe={stripePromise}>
                <CardPaymentStep amount={grandTotal} onCreateOrder={createOrder} onBack={() => setStep(1)} />
              </Elements>
            </div>
          </div>
        )}

        {/* Step 2 — Zelle / Cash review + place */}
        {step === 2 && (method === 'zelle' || method === 'cash') && (
          <div className="card">
            <div className="card-header">
              <h3>Review &amp; Place Order</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Change method</button>
            </div>
            <div className="card-body">
              <div className="pay-instructions">
                {method === 'zelle' ? (
                  <>
                    <div className="pay-instructions-title">📲 Pay by Zelle</div>
                    <p>Submit your order for review. Once we approve it, we'll email you an invoice for <strong>{fmt(grandTotal)}</strong> to pay by Zelle.</p>
                    <p className="text-muted">You'll receive your invoice by email shortly after placing the order.</p>
                  </>
                ) : (
                  <>
                    <div className="pay-instructions-title">💵 Cash at Pickup</div>
                    <p>Submit your order for review. Once we approve it, we'll email your invoice for <strong>{fmt(grandTotal)}</strong> to pay in cash when you pick up at:</p>
                    <div className="pay-highlight">{pickupAddress}</div>
                    <p className="text-muted">No card or shipping address needed — we'll have your order ready for you.</p>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn btn-outline" onClick={() => setStep(1)} disabled={processing}>← Back</button>
                <button className={`btn btn-primary btn-lg ${processing ? 'btn-loading' : ''}`} style={{ flex: 1 }} onClick={placeOfflineOrder} disabled={processing}>
                  Submit Order · {fmt(grandTotal)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Summary Sidebar */}
      <div className="checkout-sidebar">
        <div className="card">
          <div className="card-header"><h3>Order Summary</h3></div>
          <div className="card-body">
            <ul className="checkout-items">
              {cart.items.map(item => (
                <li key={item.id} className="checkout-item">
                  <div className="checkout-item-img">
                    {item.images?.[0] ? <img src={item.images[0]} alt="" /> : <div className="checkout-item-placeholder" />}
                    <span className="checkout-item-qty">{item.quantity}</span>
                  </div>
                  <div className="checkout-item-info">
                    <div className="checkout-item-name">{item.name}</div>
                    <div className="checkout-item-sku">SKU: {item.sku}</div>
                  </div>
                  <div className="checkout-item-price">{fmt(item.total_price)}</div>
                </li>
              ))}
            </ul>
            <hr className="divider" />
            <div className="checkout-totals">
              <div className="checkout-total-row"><span>Subtotal</span><span>{fmt(cart.subtotal)}</span></div>
              <div className="checkout-total-row"><span>Total Weight</span><span>{totalWeight.toFixed(1)} lbs</span></div>
              <div className="checkout-total-row"><span>Pickup</span><span className="text-success">FREE</span></div>
              <div className="checkout-total-row"><span>Sales Tax (FL {taxPercent}%)</span><span>{fmt(tax)}</span></div>
              <div className="checkout-total-row checkout-total-main">
                <span>Total</span>
                <span>{fmt(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const [stripePromise, setStripePromise] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    api.get('/config')
      .then(r => {
        setConfig(r.data);
        if (r.data.stripePublicKey) setStripePromise(loadStripe(r.data.stripePublicKey));
      })
      .catch(() => setConfig({})); // still allow Zelle / cash even if config fails
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Checkout</h1>
          <p>Choose how you'd like to pay — card, Zelle, or cash at pickup</p>
        </div>
      </div>
      <div className="container section-sm">
        {!config
          ? <div className="loading-center"><div className="spinner" /></div>
          : <CheckoutFlow stripePromise={stripePromise} config={config} />}
      </div>
    </div>
  );
}
