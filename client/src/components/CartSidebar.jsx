import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartSidebar.css';

const fmt = (n) => `$${Number(n).toFixed(2)}`;

export default function CartSidebar() {
  const { cart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const close = () => document.getElementById('cart-sidebar').classList.remove('open');

  const handleCheckout = () => {
    close();
    navigate('/checkout');
  };

  return (
    <>
      <div className="cart-overlay" onClick={close} />
      <aside id="cart-sidebar" className="cart-sidebar">
        <div className="cart-header">
          <h2>Cart ({cart.item_count || 0})</h2>
          <button className="cart-close" onClick={close} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="cart-body">
          {cart.items.length === 0 ? (
            <div className="cart-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              <p>Your cart is empty</p>
              <button className="btn btn-primary btn-sm" onClick={close}>Browse Products</button>
            </div>
          ) : (
            <ul className="cart-items">
              {cart.items.map(item => (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    {item.images?.[0]
                      ? <img src={item.images[0]} alt={item.name} loading="lazy" />
                      : <div className="cart-item-img-placeholder" />}
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-sku">SKU: {item.sku}</div>
                    <div className="cart-item-controls">
                      <div className="qty-control">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="cart-remove" onClick={() => removeItem(item.id)}>Remove</button>
                    </div>
                  </div>
                  <div className="cart-item-price">{fmt(item.total_price)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span className="cart-subtotal-amount">{fmt(cart.subtotal)}</span>
            </div>
            <p className="cart-note">Shipping and tax calculated at checkout. Wholesale prices applied.</p>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleCheckout}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
