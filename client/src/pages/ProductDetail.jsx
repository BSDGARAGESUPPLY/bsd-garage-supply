import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const fmt = (n) => `$${Number(n).toFixed(2)}`;

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { user, isApproved } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/catalog'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const handleAddToCart = async () => {
    if (!isApproved) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      setAdded(true);
      document.getElementById('cart-sidebar').classList.add('open');
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!product) return null;

  const specs = product.specifications || {};
  const hasSpecs = Object.keys(specs).length > 0;

  return (
    <div className="pd-page">
      <div className="container pd-container">
        <div className="pd-breadcrumb">
          <Link to="/catalog">Products</Link> /
          {product.category_name && <><Link to={`/catalog?category=${product.category_slug}`}>{product.category_name}</Link> /</>}
          <span>{product.name}</span>
        </div>

        <div className="pd-layout">
          {/* Image */}
          <div className="pd-images">
            <div className="pd-main-image">
              {product.images?.[0]
                ? <img src={product.images[0]} alt={product.name} />
                : <div className="pd-img-placeholder">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg>
                  </div>}
            </div>
            {product.images?.length > 1 && (
              <div className="pd-thumbnails">
                {product.images.map((img, i) => (
                  <img key={i} src={img} alt={`${product.name} ${i+1}`} className="pd-thumb" />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            {product.category_name && (
              <Link to={`/catalog?category=${product.category_slug}`} className="pd-category">{product.category_name}</Link>
            )}
            <h1 className="pd-name">{product.name}</h1>
            <div className="pd-sku">SKU: {product.sku}</div>

            <div className="pd-stock">
              {product.stock_qty > 0
                ? <span className="pd-in-stock">✓ In Stock ({product.stock_qty} available)</span>
                : <span className="pd-out-stock">✗ Out of Stock</span>}
            </div>

            {/* Pricing */}
            <div className="pd-pricing">
              {isApproved ? (
                <div className="pd-price-main">{fmt(product.price)}</div>
              ) : (
                <div className="pd-wholesale-teaser">
                  <span>🔒</span>
                  <span>Pricing is available to account holders — <Link to="/login">sign in</Link> or <Link to="/register">create a free account</Link> to see prices and order.</span>
                </div>
              )}
            </div>

            {isApproved && product.stock_qty > 0 && (
              <div className="pd-atc">
                <div className="pd-qty">
                  <label>Qty</label>
                  <div className="qty-control qty-lg">
                    <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(Math.min(product.stock_qty, qty + 1))}>+</button>
                  </div>
                </div>
                <button
                  className={`btn btn-primary btn-lg ${adding ? 'btn-loading' : ''} ${added ? 'btn-added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={adding}
                  style={{flex: 1}}
                >
                  {added ? '✓ Added to Cart!' : 'Add to Cart'}
                </button>
              </div>
            )}

            {!isApproved && (
              <div className="pd-login-cta">
                <Link to="/register" className="btn btn-primary btn-lg btn-full">Create a Free Account</Link>
                <Link to="/login" className="btn btn-outline btn-lg btn-full" style={{marginTop: '8px'}}>Sign In</Link>
              </div>
            )}

            {/* Features */}
            <div className="pd-features">
              <div className="pd-feature">
                <span>🚚</span>
                <span>Ships same day on orders before 2pm CT</span>
              </div>
              <div className="pd-feature">
                <span>🏷️</span>
                <span>Free shipping on orders over $500</span>
              </div>
              <div className="pd-feature">
                <span>✅</span>
                <span>Oil-tempered, industry-grade materials</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pd-desc">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        {hasSpecs && (
          <div className="pd-specs">
            <h2>Specifications</h2>
            <div className="specs-table-wrap">
              <table className="specs-table">
                <tbody>
                  {Object.entries(specs).map(([key, val]) => (
                    <tr key={key}>
                      <td className="specs-key">{key}</td>
                      <td className="specs-val">{val}</td>
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
