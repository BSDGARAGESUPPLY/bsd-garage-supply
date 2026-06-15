import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/orders', label: 'Orders', icon: '🛒' },
  { to: '/admin/customers', label: 'Customers', icon: '👥' },
  { to: '/admin/inventory', label: 'Inventory', icon: '📋' },
];

export default function AdminLayout() {
  const { user } = useAuth();
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <img src="/logo.png" alt="BSD" className="admin-sidebar-logo"
            onError={e => { e.target.style.display='none'; }} />
          <div className="admin-logo-text">Admin Panel</div>
          <div className="admin-user">{user?.email}</div>
        </div>
        <nav className="admin-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item">← Public Site</Link>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
