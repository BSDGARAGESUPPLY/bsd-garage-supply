import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Icon = ({ d, paths }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {paths ? paths.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

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

  const catIllustration = (slug) => {
    if (slug === 'torsion-springs') return (
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
        <ellipse cx="40" cy="16" rx="22" ry="7" /><ellipse cx="40" cy="28" rx="22" ry="7" />
        <ellipse cx="40" cy="40" rx="22" ry="7" /><ellipse cx="40" cy="52" rx="22" ry="7" />
        <ellipse cx="40" cy="64" rx="22" ry="7" />
      </svg>
    );
    if (slug === 'brackets-hardware') return (
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M40 10 L62 22 L62 46 L40 58 L18 46 L18 22 Z" /><circle cx="40" cy="34" r="12" />
        <path d="M40 58 L40 70 M30 70 L50 70" />
      </svg>
    );
    return (
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="3.2"><circle cx="40" cy="40" r="14" /><path d="M40 14v8M40 58v8M14 40h8M58 40h8M22 22l6 6M52 52l6 6M58 22l-6 6M28 52l-6 6" strokeLinecap="round" /></svg>
    );
  };

  const benefits = [
    { title: 'Same-Day Shipping', desc: 'Orders before 2pm CT ship today',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
    { title: 'Quality Springs', desc: 'Oil-tempered, galvanized, built to last',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg> },
    { title: 'Expert Support', desc: 'Real pros, Mon–Fri 7am–6pm CT',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg> },
    { title: 'Local Pickup', desc: 'Pick up at our Cape Coral, FL shop',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
  ];

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-eyebrow">⚡ Garage door springs &amp; hardware — shipped fast</div>
          <h1>Find your exact spring,<br /><span>order in minutes.</span></h1>
          <p className="hero-sub">
            Professional-grade torsion springs and hardware for technicians and repair pros.
            Filter by size, pick your wind direction, and get it on the truck.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <svg className="hero-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <input type="text" placeholder="Search by size (e.g. 250x2x30), SKU, or name" value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <div className="hero-ctas">
            <Link to="/catalog" className="btn btn-primary btn-lg">Browse the Catalog</Link>
            <Link to="/register" className="btn btn-outline-white btn-lg">Apply for an Account</Link>
          </div>
        </div>
      </section>

      {/* Benefit cards */}
      <section className="benefits">
        <div className="container benefits-grid">
          {benefits.map(b => (
            <div key={b.title} className="benefit-card">
              <div className="benefit-icon">{b.icon}</div>
              <div>
                <div className="benefit-title">{b.title}</div>
                <div className="benefit-desc">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Shop by category</h2>
              <p className="section-sub">Everything your team needs — in stock and ready to ship.</p>
            </div>
            <Link to="/catalog" className="text-link">View all products</Link>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.id} to={`/catalog?category=${cat.slug}`} className="category-card">
                <div className="category-visual">
                  <div className="category-visual-glow" />
                  {cat.product_count != null && <span className="category-badge">{cat.product_count} products</span>}
                  <div className="category-illu">{catIllustration(cat.slug)}</div>
                </div>
                <div className="category-card-body">
                  <h3>{cat.name}</h3>
                  <p>{cat.description?.substring(0, 110)}</p>
                  <span className="category-cta">
                    Shop {cat.name}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo banner */}
      <section className="container">
        <div className="promo-banner">
          <div className="promo-text">
            <h3>Free local pickup in Cape Coral, FL</h3>
            <p>Order online and pick up at our shop — 2634 NE 9th Ave. Same-day shipping on orders before 2pm CT.</p>
          </div>
          <Link to="/catalog" className="btn btn-primary btn-lg">Start an Order</Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-gray">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Popular products</h2>
              <p className="section-sub">Top-selling springs and hardware.</p>
            </div>
            <Link to="/catalog" className="text-link">See all</Link>
          </div>
          <div className="products-grid-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Account CTA */}
      <section className="section">
        <div className="container">
          <div className="account-cta">
            <div className="account-cta-content">
              <div className="account-cta-badge">Trade &amp; Retail Accounts</div>
              <h2>Get pricing built for you</h2>
              <p>Apply for an account and we'll set you up with the right pricing — <strong>trade pricing for technicians</strong>, retail for everyone else. Most accounts are approved within 1 business day.</p>
              <ul className="account-benefits">
                <li>Pricing matched to your account type</li>
                <li>Online ordering with real-time stock</li>
                <li>Order tracking &amp; fast reordering</li>
              </ul>
              <div className="flex gap-12" style={{ marginTop: '28px', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary btn-lg">Apply for an Account</Link>
                <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
              </div>
            </div>
            <div className="account-steps">
              {[
                { n: '1', title: 'Apply', desc: 'Quick 2-step form' },
                { n: '2', title: 'Get approved', desc: 'Within 1 business day' },
                { n: '3', title: 'See pricing & order', desc: 'Ship or pick up' },
              ].map(s => (
                <div key={s.n} className="account-step">
                  <div className="account-step-num">{s.n}</div>
                  <div><strong>{s.title}</strong><span>{s.desc}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
