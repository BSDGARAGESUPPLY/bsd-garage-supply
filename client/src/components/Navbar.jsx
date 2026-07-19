import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin, isApproved } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-top">
        <div className="container navbar-top-inner">
          <span>📞 1-888-844-4701 &nbsp;|&nbsp; ✉ Bsdgaragesupply@gmail.com &nbsp;|&nbsp; Mon–Fri 7am–6pm CT</span>
          <span>⭐ Free shipping on orders over $500</span>
        </div>
      </div>
      <nav className="navbar-main">
        <div className="container navbar-inner">

          <Link to="/" className="navbar-logo">
            <img
              src="/logo.png"
              alt="BSD Garage Supply"
              className="navbar-logo-img"
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="navbar-logo-text-fallback" style={{display:'none'}}>
              <span className="navbar-logo-main">BSD</span>
              <span className="navbar-logo-sub">Garage Supply</span>
            </div>
          </Link>

          <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <NavLink to="/catalog" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>All Products</NavLink>
            <NavLink to="/catalog?category=torsion-springs" className="nav-link" onClick={() => setMenuOpen(false)}>Torsion Springs</NavLink>
            <NavLink to="/catalog?category=brackets-hardware" className="nav-link" onClick={() => setMenuOpen(false)}>Hardware</NavLink>
            <NavLink to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</NavLink>
            <NavLink to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</NavLink>
          </div>

          <div className="navbar-actions">
            {isApproved && (
              <button className="cart-btn" onClick={() => document.getElementById('cart-sidebar').classList.add('open')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {cart.item_count > 0 && <span className="cart-count">{cart.item_count}</span>}
              </button>
            )}

            {user ? (
              <div className="user-menu" onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}>
                <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="user-avatar">{user.company_name?.charAt(0)}</div>
                  <span className="user-name">{user.company_name}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>My Orders</Link>
                    {isAdmin && <Link to="/admin" className="dropdown-item dropdown-admin" onClick={() => setDropdownOpen(false)}>⚙ Admin Panel</Link>}
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-btns">
                <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Apply for Account</Link>
              </div>
            )}

            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
