import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
    api.get('/products?limit=8&sort=newest').then(r => setFeatured(r.data.products));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/catalog?search=${encodeURIComponent(search)}`);
  };

  const catIcons = {
    'torsion-springs': '🌀',
    'brackets-hardware': '🔧',
    'extension-springs': '〰️',
    'hardware-kits': '🔧',
    'cables-drums': '🪢',
    'tools': '🛠️'
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-eyebrow">BSD Garage Supply</div>
          <h1>
            The gold standard in<br />
            <span>garage door springs.</span>
          </h1>
          <p className="hero-sub">
            Professional-grade torsion springs and hardware, engineered to last.
            Wholesale pricing for approved contractors.
          </p>
          <div className="hero-links">
            <Link to="/catalog" className="text-link">Browse the catalog</Link>
            <Link to="/register" className="text-link">Create a free account</Link>
          </div>
          <form className="hero-search" onSubmit={handleSearch}>
            <svg className="hero-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search by SKU, spring size, or product name"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
        </div>
      </section>

      {/* Trust bar */}
      <section className="trust-bar">
        <div className="container trust-bar-inner">
          {[
            { title: 'Same-Day Shipping', desc: 'On orders before 2pm CT' },
            { title: 'Member Pricing', desc: 'Free account to view' },
            { title: 'In-Stock Inventory', desc: 'Ready to ship today' },
            { title: 'Expert Support', desc: 'Mon–Fri 7am–6pm CT' },
          ].map(item => (
            <div key={item.title} className="trust-item">
              <div className="trust-title">{item.title}</div>
              <div className="trust-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-head-center">
            <h2>Shop by category.</h2>
            <p>Everything your team needs — in stock and ready to ship.</p>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.id} to={`/catalog?category=${cat.slug}`} className="category-card">
                <div className="category-icon">{catIcons[cat.slug] || '⚙️'}</div>
                <h3>{cat.name}</h3>
                <p>{cat.description?.substring(0, 90)}</p>
                <span className="text-link">Shop now</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-gray">
        <div className="container">
          <div className="section-head-center">
            <h2>Popular products.</h2>
            <p>Best-selling springs and hardware.</p>
          </div>
          <div className="products-grid-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center" style={{ marginTop: '48px' }}>
            <Link to="/catalog" className="btn btn-primary btn-lg">View all products</Link>
          </div>
        </div>
      </section>

      {/* Wholesale CTA */}
      <section className="section wholesale-cta">
        <div className="container">
          <div className="wholesale-cta-inner">
            <div className="wholesale-cta-content">
              <div className="wholesale-cta-badge">Free Account</div>
              <h2>Create your<br /><span>BSD account.</span></h2>
              <p>
                Set up a free account to see live pricing, order online, and track
                every shipment. Built for garage door pros — and anyone who needs
                quality springs and hardware, fast.
              </p>
              <ul className="wholesale-benefits">
                <li>See pricing across our full catalog</li>
                <li>Online ordering with real-time inventory</li>
                <li>Multiple shipping speeds, including same-day</li>
                <li>Order tracking from placement to delivery</li>
                <li>Reorder your usual springs in seconds</li>
              </ul>
              <div className="flex gap-12" style={{ marginTop: '32px', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary btn-lg">Create free account</Link>
                <Link to="/login" className="btn btn-outline-white btn-lg">Sign in</Link>
              </div>
            </div>
            <div className="wholesale-cta-stats">
              {[
                ['Free', 'Account, always'],
                ['$500', 'Free shipping over'],
                ['Same Day', 'Shipping before 2pm CT'],
                ['Instant', 'Access to pricing'],
              ].map(([val, label]) => (
                <div key={val} className="stat-card">
                  <div className="stat-value">{val}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <div className="section-head-center">
            <h2>How it works.</h2>
          </div>
          <div className="steps-grid">
            {[
              { n: '01', title: 'Create your account', desc: 'Sign up free in under 2 minutes — no approval and no waiting.' },
              { n: '02', title: 'See live pricing', desc: 'Sign in to reveal pricing across our full catalog of springs and hardware.' },
              { n: '03', title: 'Order online', desc: 'Add to cart, pay securely, and choose the shipping speed you need.' },
              { n: '04', title: 'Track delivery', desc: 'Follow every order from our warehouse right to your door.' },
            ].map(step => (
              <div key={step.n} className="step-card">
                <div className="step-number">{step.n}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
