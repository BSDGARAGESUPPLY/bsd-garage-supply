import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import './Catalog.css';

// Spec dimensions we let techs filter by (only show up when products have them).
// Wind direction is chosen on the product page (Red/Black cone), so it's not a filter.
const FILTER_DIMS = [
  { key: 'Wire Diameter', label: 'Wire Size' },
  { key: 'Coil Length', label: 'Length' },
];

const numOf = (s) => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort: 'name', limit: 200 });
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data)); }, []);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setSearchInput(search); }, [search]);
  useEffect(() => { setFilters({}); }, [category, search]); // reset filters when you switch category/search

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
  };

  const handleSearch = (e) => { e.preventDefault(); updateParam('search', searchInput); };

  // Build filter options from whatever products are loaded
  const options = useMemo(() => {
    const o = {};
    for (const dim of FILTER_DIMS) {
      const vals = new Set();
      products.forEach(p => { const v = p.specifications?.[dim.key]; if (v) vals.add(v); });
      const arr = Array.from(vals);
      if (dim.key === 'Wind Direction') arr.sort();
      else arr.sort((a, b) => numOf(a) - numOf(b));
      o[dim.key] = arr;
    }
    return o;
  }, [products]);

  const toggleFilter = (key, val) => {
    setFilters(prev => {
      const cur = prev[key] || [];
      const next = cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val];
      return { ...prev, [key]: next };
    });
  };

  const filtered = useMemo(() => products.filter(p => {
    for (const dim of FILTER_DIMS) {
      const sel = filters[dim.key];
      if (sel && sel.length && !sel.includes(p.specifications?.[dim.key])) return false;
    }
    return true;
  }), [products, filters]);

  // Merge each Left/Right torsion-spring pair into a single card (wind is chosen on the product page).
  const displayItems = useMemo(() => {
    const seen = new Set();
    const items = [];
    for (const p of filtered) {
      const mm = p.sku?.match(/^(.*)-([LR])$/);
      if (mm) {
        if (seen.has(mm[1])) continue;
        seen.add(mm[1]);
        const left = filtered.find(x => x.sku === mm[1] + '-L') || p;
        items.push({ ...left, _isPair: true, _pairName: left.name.replace(/\s*[—-]\s*(Left|Right)\s*Wind\s*$/i, '').trim() });
      } else {
        items.push(p);
      }
    }
    return items;
  }, [filtered]);

  const hasActiveFilters = Object.values(filters).some(a => a && a.length);
  const hasAnyFilterOptions = FILTER_DIMS.some(d => (options[d.key] || []).length > 1);
  const selectedCat = categories.find(c => c.slug === category);

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div className="container">
          <div className="catalog-header-inner">
            <div>
              <h1>{selectedCat ? selectedCat.name : search ? `Search: "${search}"` : 'All Products'}</h1>
              <p>{displayItems.length} product{displayItems.length !== 1 ? 's' : ''}{hasActiveFilters ? ' match your filters' : ''}</p>
            </div>
            <form className="catalog-search" onSubmit={handleSearch}>
              <input
                type="text" placeholder="Search products, SKUs..."
                value={searchInput} onChange={e => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="catalog-layout">
          {/* Sidebar */}
          <aside className="catalog-sidebar">
            <div className="sidebar-section">
              <h3>Categories</h3>
              <ul className="sidebar-cats">
                <li>
                  <button className={!category ? 'active' : ''} onClick={() => updateParam('category', '')}>
                    All Products
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button
                      className={category === cat.slug ? 'active' : ''}
                      onClick={() => updateParam('category', cat.slug)}
                    >
                      {cat.name}
                      {cat.product_count != null && <span className="sidebar-cat-count">{cat.product_count}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Spec filters — only appear when products have these specs (i.e. springs) */}
            {FILTER_DIMS.map(dim => {
              const opts = options[dim.key] || [];
              if (opts.length < 2) return null;
              return (
                <div className="sidebar-section" key={dim.key}>
                  <h3>{dim.label}</h3>
                  <div className="filter-pills">
                    {opts.map(opt => (
                      <button
                        key={opt}
                        className={`filter-pill ${(filters[dim.key] || []).includes(opt) ? 'active' : ''}`}
                        onClick={() => toggleFilter(dim.key, opt)}
                      >
                        {dim.key === 'Wind Direction' ? windLabel(opt) : opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {(category || search || hasActiveFilters) && (
              <button className="btn btn-outline btn-sm btn-full" onClick={() => { setFilters({}); setSearchParams({}); }}>
                Clear All
              </button>
            )}
          </aside>

          {/* Main */}
          <main className="catalog-main">
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : displayItems.length === 0 ? (
              <div className="catalog-empty">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <h3>No products match</h3>
                <p>{hasActiveFilters ? 'Try removing a filter.' : 'Try a different search or category.'}</p>
                <button className="btn btn-primary" onClick={() => { setFilters({}); setSearchParams({}); }}>View All Products</button>
              </div>
            ) : (
              <div className="catalog-grid">
                {displayItems.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
