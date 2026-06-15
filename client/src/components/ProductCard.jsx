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
              <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
                <ellipse cx="32" cy="20" rx="16" ry="6" stroke="#D4A23A" strokeWidth="3" />
                <ellipse cx="32" cy="32" rx="16" ry="6" stroke="#D4A23A" strokeWidth="3" />
                <ellipse cx="32" cy="44" rx="16" ry="6" stroke="#D4A23A" strokeWidth="3" />
              </svg>
              <span>BSD Garage Supply</span>
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
