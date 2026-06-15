import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');
const fmt = (n) => `$${Number(n).toFixed(2)}`;

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1=shipping, 2=shipping method, 3=payment
  const [shippingForm, setShippingForm] = useState({
    name: user?.contact_name || '', address: user?.address || '', city: user?.city || '',
    state: user?.state || '', zip: user?.zip || '', country: 'US'
  });
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  const set = (f) => (e) => setShippingForm({...shippingForm, [f]: e.target.value});

  const totalWeight = cart.items.reduce((sum, i) => sum + (i.weight || 1) * i.quantity, 0);

  const fetchRates = async (e) => {
    e.preventDefault();
    setLoadingRates(true);
    try {
      const { data } = await api.post('/shipping/rates', {
        state: shippingForm.state,
        weight: totalWeight,
        subtotal: cart.subtotal
      });
      setShippingRates(data.rates);
      setSelectedRate(data.rates[0]);
      setStep(2);
    } catch (err) {
      setError('Could not fetch shipping rates. Please try again.');
    } finally {
      setLoadingRates(false);
    }
  };

  const createOrder = async () => {
    setProcessing(true);
    setError('');
    try {
      const { data } = await api.post('/orders', {
        shipping_name: shippingForm.name,
        shipping_address: shippingForm.address,
        shipping_city: shippingForm.city,
        shipping_state: shippingForm.state,
        shipping_zip: shippingForm.zip,
        shipping_method: selectedRate.name,
        shipping_cost: selectedRate.cost
      });
      setOrderId(data.order_id);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError('');

    try {
      // Get payment intent
      const { data: piData } = await api.post(`/orders/${orderId}/payment-intent`);

      const result = await stripe.confirmCardPayment(piData.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: shippingForm.name }
        }
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Confirm on backend
      await api.post(`/orders/${orderId}/confirm`, {
        payment_intent_id: result.paymentIntent.id
      });

      clearCart();
      navigate(`/orders/${orderId}?success=1`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!cart.items.length && step < 3) {
    return (
      <div className="text-center" style={{padding: '80px 0'}}>
        <p className="text-muted">Your cart is empty.</p>
        <Link to="/catalog" className="btn btn-primary" style={{marginTop: '16px'}}>Browse Products</Link>
      </div>
    );
  }

  const total = cart.subtotal + (selectedRate?.cost || 0);

  return (
    <div className="checkout-layout">
      <div className="checkout-main">
        {/* Step indicators */}
        <div className="checkout-steps">
          {['Shipping Address', 'Shipping Method', 'Payment'].map((s, i) => (
            <div key={s} className={`checkout-step ${step > i+1 ? 'done' : step === i+1 ? 'active' : ''}`}>
              <span className="cs-num">{step > i+1 ? '✓' : i+1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error" style={{marginBottom: '20px'}}>{error}</div>}

        {/* Step 1 — Shipping Address */}
        {step === 1 && (
          <div className="card">
            <div className="card-header"><h3>Shipping Address</h3></div>
            <div className="card-body">
              <form onSubmit={fetchRates} className="checkout-form">
                <div className="form-group">
                  <label className="form-label required">Full Name / Company</label>
                  <input className="form-input" required value={shippingForm.name} onChange={set('name')} />
                </div>
                <div className="form-group">
                  <label className="form-label required">Street Address</label>
                  <input className="form-input" required value={shippingForm.address} onChange={set('address')} />
                </div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label required">City</label>
                    <input className="form-input" required value={shippingForm.city} onChange={set('city')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">State</label>
                    <select className="form-select" required value={shippingForm.state} onChange={set('state')}>
                      <option value="">State</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label required">ZIP Code</label>
                    <input className="form-input" required value={shippingForm.zip} onChange={set('zip')} />
                  </div>
                </div>
                <button type="submit" className={`btn btn-primary btn-lg ${loadingRates ? 'btn-loading' : ''}`} disabled={loadingRates}>
                  Continue to Shipping →
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Step 2 — Shipping Method */}
        {step === 2 && (
          <div className="card">
            <div className="card-header">
              <h3>Shipping Method</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Edit Address</button>
            </div>
            <div className="card-body">
              <div className="shipping-address-preview">
                📍 {shippingForm.name} · {shippingForm.address}, {shippingForm.city}, {shippingForm.state} {shippingForm.zip}
              </div>
              <div className="shipping-rates">
                {shippingRates.map(rate => (
                  <label key={rate.id} className={`shipping-rate ${selectedRate?.id === rate.id ? 'selected' : ''}`}>
                    <input type="radio" name="shipping" checked={selectedRate?.id === rate.id} onChange={() => setSelectedRate(rate)} />
                    <div className="shipping-rate-info">
                      <div className="shipping-rate-name">
                        <strong>{rate.name}</strong>
                        {rate.note && <span className="shipping-rate-note">{rate.note}</span>}
                      </div>
                      <div className="shipping-rate-details">
                        {rate.carrier} · Est. {rate.estimated_days} business day{rate.estimated_days !== '1' ? 's' : ''}
                      </div>
                    </div>
                    <div className="shipping-rate-price">
                      {rate.cost === 0 ? <span className="text-success font-bold">FREE</span> : <strong>{fmt(rate.cost)}</strong>}
                    </div>
                  </label>
                ))}
              </div>
              <div style={{marginTop: '24px', display: 'flex', gap: '12px'}}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button className={`btn btn-primary btn-lg ${processing ? 'btn-loading' : ''}`} onClick={createOrder} disabled={!selectedRate || processing}>
                  Continue to Payment →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Payment */}
        {step === 3 && (
          <div className="card">
            <div className="card-header"><h3>Payment</h3></div>
            <div className="card-body">
              <div className="shipping-address-preview">
                📍 {shippingForm.address}, {shippingForm.city}, {shippingForm.state} · {selectedRate?.name}
              </div>
              <form onSubmit={handlePayment} className="checkout-form">
                <div className="form-group">
                  <label className="form-label">Card Details</label>
                  <div className="stripe-card-wrapper">
                    <CardElement options={{
                      style: {
                        base: { fontSize: '15px', color: '#111827', fontFamily: 'Inter, sans-serif', '::placeholder': { color: '#9ca3af' } },
                        invalid: { color: '#dc2626' }
                      }
                    }} />
                  </div>
                </div>
                <div className="payment-secure-note">
                  🔒 Payments are processed securely by Stripe. We never store your card details.
                </div>
                <button type="submit" className={`btn btn-primary btn-full btn-lg ${processing ? 'btn-loading' : ''}`} disabled={!stripe || processing}>
                  Pay {fmt(total)}
                </button>
              </form>
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
              <div className="checkout-total-row">
                <span>Shipping</span>
                <span>{selectedRate ? (selectedRate.cost === 0 ? 'FREE' : fmt(selectedRate.cost)) : '—'}</span>
              </div>
              <div className="checkout-total-row checkout-total-main">
                <span>Total</span>
                <span>{fmt(cart.subtotal + (selectedRate?.cost || 0))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Checkout</h1>
          <p>Wholesale order checkout</p>
        </div>
      </div>
      <div className="container section-sm">
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
}
