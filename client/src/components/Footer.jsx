import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top-bar" />
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <img
              src="/logo.png"
              alt="BSD Garage Supply"
              className="footer-logo-img"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
            />
            <div className="footer-logo-fallback" style={{display:'none'}}>
              <span className="footer-logo-main">BSD</span>
              <span className="footer-logo-sub">Garage Supply</span>
            </div>
          </div>
          <p className="footer-desc">
            Professional garage door springs and hardware. Trusted by technicians,
            contractors, and repair companies — fast shipping, fair pricing.
          </p>
          <div className="footer-contact">
            <div>📞 1-800-BSD-SPRING</div>
            <div>✉ Bsdgaragesupply@gmail.com</div>
            <div>🕐 Mon–Fri 7am–6pm CT</div>
          </div>
        </div>

        <div className="footer-col">
          <h4>Products</h4>
          <ul>
            <li><Link to="/catalog?category=torsion-springs">Torsion Springs</Link></li>
            <li><Link to="/catalog?category=brackets-hardware">Brackets & Hardware</Link></li>
            <li><Link to="/catalog">View All Products</Link></li>
          </ul>
          <h4 style={{marginTop: '24px'}}>Account</h4>
          <ul>
            <li><Link to="/register">Create Account</Link></li>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/orders">Order History</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About BSD</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/shipping">Shipping Policy</Link></li>
            <li><Link to="/returns">Returns & Warranty</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {new Date().getFullYear()} BSD Garage Supply. All rights reserved.</span>
          <div className="footer-badges">
            <span className="footer-badge">🔒 Secure Checkout</span>
            <span className="footer-badge">🚚 Fast Shipping</span>
            <span className="footer-badge">🏆 Industry Trusted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
