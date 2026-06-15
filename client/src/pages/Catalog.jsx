import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import './Catalog.css';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'name';
  const page = parseInt(searchParams.get('page') || '1');
  const [searchInput, setSearchInput] = useState(search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, page, limit: 24 });
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, page]);

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data)); }, []);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setSearchInput(search); }, [search]);

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const selectedCat = categories.find(c => c.slug === category);

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div className="container">
          <div className="catalog-header-inner">
            <div>
              <h1>{selectedCat ? selectedCat.name : search ? `Search: "${search}"` : 'All Products'}</h1>
              <p>{total} product{total !== 1 ? 's' : ''} found</p>
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
                  <button
                    className={!category ? 'active' : ''}
                    onClick={() => updateParam('category', '')}
                  >All Products</button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button
                      className={category === cat.slug ? 'active' : ''}
                      onClick={() => updateParam('category', cat.slug)}
                    >{cat.name}</button>
                  </li>
                ))}
              </ul>
            </div>

            {(category || search) && (
              <button className="btn btn-outline btn-sm btn-full" onClick={() => setSearchParams({})}>
                Clear Filters
              </button>
            )}
          </aside>

          {/* Main */}
          <main className="catalog-main">
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="catalog-empty">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <h3>No products found</h3>
                <p>Try adjusting your search or browse a different category.</p>
                <button className="btn btn-primary" onClick={() => setSearchParams({})}>View All Products</button>
              </div>
            ) : (
              <>
                <div className="catalog-grid">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    <button disabled={page <= 1} onClick={() => updateParam('page', page - 1)}>‹</button>
                    {Array.from({ length: pages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
                      <button key={p} className={p === page ? 'active' : ''} onClick={() => updateParam('page', p)}>{p}</button>
                    ))}
                    <button disabled={page >= pages} onClick={() => updateParam('page', page + 1)}>›</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
