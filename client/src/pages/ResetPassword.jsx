import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './Auth.css';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: form.password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset password.');
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

        {!token ? (
          <>
            <h1>Invalid link</h1>
            <p className="auth-subtitle">This password reset link is missing or malformed. Please request a new one.</p>
            <Link to="/forgot-password" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '20px' }}>
              Request New Link
            </Link>
          </>
        ) : done ? (
          <>
            <div style={{ fontSize: '44px', textAlign: 'center', marginBottom: '8px' }}>✅</div>
            <h1>Password reset</h1>
            <p className="auth-subtitle">Your password has been updated. Redirecting you to sign in…</p>
            <Link to="/login" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '20px' }}>
              Sign In Now
            </Link>
          </>
        ) : (
          <>
            <h1>Set a new password</h1>
            <p className="auth-subtitle">Choose a new password for your account.</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label required">New Password</label>
                <input className="form-input" type="password" placeholder="Min 8 characters" required
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label required">Confirm Password</label>
                <input className="form-input" type="password" placeholder="Repeat password" required
                  value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
              </div>
              <button type="submit" className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`} disabled={loading}>
                Reset Password
              </button>
            </form>

            <p className="auth-footer-text"><Link to="/login">← Back to sign in</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
