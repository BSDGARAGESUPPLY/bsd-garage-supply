import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const fmt = (n) => `$${Number(n).toFixed(2)}`;

// Pull the most useful specs to show as quick-scan chips on the card.
function specChips(specs, isPair) {
  if (!specs || typeof specs !== 'object') return [];
  if (specs['Wire Diameter']) {
    // Torsion spring — show wire / ID / length (+ wind, unless it's a Left/Right pair card)
    const chips = [];
    if (specs['Wire Diameter']) chips.push(`${specs['Wire Diameter']} wire`);
    if (specs['Inside Diameter']) chips.push(`${specs['Inside Diameter']} ID`);
    if (specs['Coil Length']) chips.push(specs['Coil Length']);
    if (specs['Unit Weight']) chips.push(specs['Unit Weight']);
    if (!isPair && specs['Wind Direction']) chips.push(specs['Wind Direction'].includes('Left') ? 'LH' : 'RH');
    return chips;
  }
  // Hardware — show a couple of relevant specs
  const skip = ['Application', 'Sold As'];
  return Object.entries(specs).filter(([k]) => !skip.includes(k)).slice(0, 3).map(([, v]) => v);
}

export default function ProductCard({ product }) {
  const { isApproved, user } = useAuth();
  const pending = user && !isApproved;
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
        <div className="product-card-sku">SKU: {product._isPair ? product.sku.replace(/-[LR]$/, '') : product.sku}</div>
        <h3 className="product-card-name">{product._isPair ? product._pairName : product.name}</h3>
        {specChips(product.specifications, product._isPair).length > 0 && (
          <div className="product-card-specs">
            {specChips(product.specifications, product._isPair).map((c, i) => (
              <span key={i} className="product-spec-chip">{c}</span>
            ))}
          </div>
        )}
        {product._isPair && (
          <div className="product-card-cones">
            <span className="cone-dot red" /><span className="cone-dot black" />
            <span>Left &amp; Right available</span>
          </div>
        )}
        <div className="product-card-pricing">
          {isApproved ? (
            <span className="product-price">{fmt(product.price)}</span>
          ) : pending ? (
            <span className="product-signin-price">⏳ Pending approval</span>
          ) : (
            <span className="product-signin-price">Sign in to see pricing</span>
          )}
        </div>
        {product.stock_qty > 0 && product.stock_qty <= 20 && (
          <div className="product-low-stock">Only {product.stock_qty} left</div>
        )}
        {isApproved ? (
          product._isPair ? (
            <span className="btn btn-primary btn-sm btn-full product-atc">Choose Wind →</span>
          ) : (
            <button
              className={`btn btn-primary btn-sm btn-full product-atc ${adding ? 'btn-loading' : ''} ${added ? 'btn-added' : ''}`}
              onClick={handleAddToCart}
              disabled={!inStock || adding}
            >
              {added ? '✓ Added!' : inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          )
        ) : pending ? (
          <span className="btn btn-secondary btn-sm btn-full product-atc">Awaiting approval</span>
        ) : (
          <span className="btn btn-outline btn-sm btn-full product-atc">Sign in to buy</span>
        )}
      </div>
    </Link>
  );
}
