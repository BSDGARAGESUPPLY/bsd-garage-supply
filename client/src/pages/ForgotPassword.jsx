import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
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

        {sent ? (
          <>
            <div style={{ fontSize: '44px', textAlign: 'center', marginBottom: '8px' }}>📧</div>
            <h1>Check your email</h1>
            <p className="auth-subtitle">
              If an account exists for <strong>{email}</strong>, we've sent a link to reset
              your password. It expires in 1 hour.
            </p>
            <p className="auth-subtitle" style={{ marginTop: '12px', fontSize: '13px' }}>
              Don't see it? Check your spam folder.
            </p>
            <Link to="/login" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '20px' }}>
              Back to Sign In
            </Link>
          </>
        ) : (
          <>
            <h1>Forgot your password?</h1>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label required">Email Address</label>
                <input className="form-input" type="email" placeholder="you@company.com" required
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button type="submit" className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`} disabled={loading}>
                Send Reset Link
              </button>
            </form>

            <p className="auth-footer-text"><Link to="/login">← Back to sign in</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
