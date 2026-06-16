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
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { isApproved } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then(r => {
        setProduct(r.data);
        // Default the cone selection to the spring we loaded
        const match = r.data.variants?.find(v => v.sku === r.data.sku);
        setActiveId(match ? match.id : r.data.id);
        setQty(1);
      })
      .catch(() => navigate('/catalog'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!product) return null;

  const hasVariants = product.variants && product.variants.length > 1;
  const active = hasVariants ? product.variants.find(v => v.id === activeId) : null;

  const title = product.pair_name || product.name;
  const displayPrice = active ? active.price : product.price;
  const displayStock = active ? active.stock_qty : product.stock_qty;
  const displaySku = active ? active.sku : product.sku;
  const displayWeight = active ? active.weight : product.weight;
  const cartId = active ? active.id : product.id;

  const specs = { ...(product.specifications || {}), ...(active ? { 'Wind Direction': active.wind } : {}) };
  const hasSpecs = Object.keys(specs).length > 0;

  const handleAddToCart = async () => {
    if (!isApproved) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(cartId, qty);
      setAdded(true);
      document.getElementById('cart-sidebar').classList.add('open');
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="pd-page">
      <div className="container pd-container">
        <div className="pd-breadcrumb">
          <Link to="/catalog">Products</Link> /
          {product.category_name && <><Link to={`/catalog?category=${product.category_slug}`}>{product.category_name}</Link> /</>}
          <span>{title}</span>
        </div>

        <div className="pd-layout">
          {/* Image */}
          <div className="pd-images">
            <div className="pd-main-image">
              {product.images?.[0]
                ? <img src={product.images[0]} alt={title} />
                : <div className="pd-img-placeholder">
                    <svg width="96" height="96" viewBox="0 0 64 64" fill="none">
                      <ellipse cx="32" cy="20" rx="16" ry="6" stroke="#D4A23A" strokeWidth="3" />
                      <ellipse cx="32" cy="32" rx="16" ry="6" stroke="#D4A23A" strokeWidth="3" />
                      <ellipse cx="32" cy="44" rx="16" ry="6" stroke="#D4A23A" strokeWidth="3" />
                    </svg>
                    <span>BSD Garage Supply</span>
                  </div>}
            </div>
            {product.images?.length > 1 && (
              <div className="pd-thumbnails">
                {product.images.map((img, i) => (
                  <img key={i} src={img} alt={`${title} ${i+1}`} className="pd-thumb" />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            {product.category_name && (
              <Link to={`/catalog?category=${product.category_slug}`} className="pd-category">{product.category_name}</Link>
            )}
            <h1 className="pd-name">{title}</h1>
            <div className="pd-sku">SKU: {displaySku} {displayWeight ? <span className="pd-weight-inline">· {displayWeight} lbs each</span> : null}</div>

            <div className="pd-stock">
              {displayStock > 0
                ? <span className="pd-in-stock">✓ In Stock ({displayStock} available)</span>
                : <span className="pd-out-stock">✗ Out of Stock</span>}
            </div>

            {/* Pricing */}
            <div className="pd-pricing">
              {isApproved ? (
                <div className="pd-price-main">{fmt(displayPrice)}</div>
              ) : (
                <div className="pd-wholesale-teaser">
                  <span>🔒</span>
                  <span>Pricing is available to account holders — <Link to="/login">sign in</Link> or <Link to="/register">create a free account</Link> to see prices and order.</span>
                </div>
              )}
            </div>

            {/* Cone / wind-direction selector */}
            {hasVariants && (
              <div className="pd-variants">
                <label className="pd-variant-label">Choose wind direction</label>
                <div className="pd-cone-options">
                  {product.variants.map(v => {
                    const isLeft = v.wind.includes('Left');
                    return (
                      <button
                        key={v.id}
                        type="button"
                        className={`pd-cone ${active?.id === v.id ? 'selected' : ''}`}
                        onClick={() => { setActiveId(v.id); setQty(1); }}
                      >
                        <span className={`pd-cone-swatch ${isLeft ? 'red' : 'black'}`} />
                        <span className="pd-cone-text">
                          <strong>{isLeft ? 'Left Wind' : 'Right Wind'}</strong>
                          <small>{isLeft ? 'Red Cone' : 'Black Cone'}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isApproved && displayStock > 0 && (
              <div className="pd-atc">
                <div className="pd-qty">
                  <label>Qty</label>
                  <div className="qty-control qty-lg">
                    <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(Math.min(displayStock, qty + 1))}>+</button>
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
              <div className="pd-feature"><span>🚚</span><span>Ships same day on orders before 2pm CT</span></div>
              <div className="pd-feature"><span>📍</span><span>Local pickup available in Cape Coral, FL</span></div>
              <div className="pd-feature"><span>✅</span><span>Oil-tempered, galvanized, industry-grade</span></div>
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
