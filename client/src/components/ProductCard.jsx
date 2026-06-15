import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const fmt = (n) => `$${Number(n).toFixed(2)}`;

export default function ProductCard({ product }) {
  const { isApproved } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      setAdded(true);
      document.getElementById('cart-sidebar').classList.add('open');
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  };

  const img = product.images?.[0];
  const inStock = product.stock_qty > 0;

  return (
    <Link to={`/catalog/${product.slug}`} className="product-card">
      <div className="product-card-img">
        {img
          ? <img src={img} alt={product.name} loading="lazy" />
          : <div className="product-card-img-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg>
            </div>}
        {!inStock && <div className="product-badge-out">Out of Stock</div>}
        {isApproved && product.wholesale_price && (
          <div className="product-badge-wholesale">Wholesale</div>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-sku">SKU: {product.sku}</div>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-pricing">
          {isApproved ? (
            <span className="product-price">{fmt(product.price)}</span>
          ) : (
            <span className="product-signin-price">Sign in to see pricing</span>
          )}
        </div>
        {product.stock_qty > 0 && product.stock_qty <= 20 && (
          <div className="product-low-stock">Only {product.stock_qty} left</div>
        )}
        {isApproved ? (
          <button
            className={`btn btn-primary btn-sm btn-full product-atc ${adding ? 'btn-loading' : ''} ${added ? 'btn-added' : ''}`}
            onClick={handleAddToCart}
            disabled={!inStock || adding}
          >
            {added ? '✓ Added!' : inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        ) : (
          <span className="btn btn-outline btn-sm btn-full product-atc">Sign in to buy</span>
        )}
      </div>
    </Link>
  );
}
