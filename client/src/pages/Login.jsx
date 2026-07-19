import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.is_admin ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">
          <img src="/logo.png" alt="BSD Garage Supply" className="auth-logo-img"
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
          <div className="auth-logo-fallback" style={{display:'none'}}>BSD Garage Supply</div>
        </div>
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to see pricing and place orders</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label required">Email Address</label>
            <input className="form-input" type="email" placeholder="you@company.com" required
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <div className="auth-label-row">
              <label className="form-label required">Password</label>
              <Link to="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
            </div>
            <input className="form-input" type="password" placeholder="••••••••" required
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button type="submit" className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`} disabled={loading}>
            Sign In
          </button>
        </form>

        <div className="auth-divider"><span>New to BSD Garage Supply?</span></div>
        <Link to="/register" className="btn btn-outline btn-full">Apply for an Account</Link>
      </div>
    </div>
  );
}
