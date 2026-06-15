import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
const BUSINESS_TYPES = ['Garage Door Contractor','Garage Door Dealer','Garage Door Repair Service','Property Management Company','General Contractor','Handyman Service','Other'];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', confirm_password: '', company_name: '', contact_name: '',
    phone: '', address: '', city: '', state: '', zip: '', business_type: ''
  });

  const set = (field) => (e) => setForm({...form, [field]: e.target.value});

  const handleStep1 = (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      // Logged in automatically — go straight to shopping.
      navigate('/catalog');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-wide">
      <div className="auth-card auth-card-wide card">
        <div className="auth-logo">
          <img src="/logo.png" alt="BSD Garage Supply" className="auth-logo-img"
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
          <div className="auth-logo-fallback" style={{display:'none'}}>BSD Garage Supply</div>
        </div>
        <h1>Create Your Account</h1>
        <p className="auth-subtitle">Free to join — see pricing and order in minutes</p>

        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? 'active' : ''}`}><span>1</span> Login Info</div>
          <div className="auth-step-divider" />
          <div className={`auth-step ${step >= 2 ? 'active' : ''}`}><span>2</span> Contact Info</div>
        </div>

        {error && <div className="alert alert-error" style={{marginBottom: '16px'}}>{error}</div>}

        {step === 1 && (
          <form onSubmit={handleStep1} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Email Address</label>
                <input className="form-input" type="email" required value={form.email} onChange={set('email')} placeholder="you@company.com" />
              </div>
              <div className="form-group">
                <label className="form-label required">Contact Name</label>
                <input className="form-input" type="text" required value={form.contact_name} onChange={set('contact_name')} placeholder="Your full name" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Password</label>
                <input className="form-input" type="password" required value={form.password} onChange={set('password')} placeholder="Min 8 characters" />
              </div>
              <div className="form-group">
                <label className="form-label required">Confirm Password</label>
                <input className="form-input" type="password" required value={form.confirm_password} onChange={set('confirm_password')} placeholder="Repeat password" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg">Continue →</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Company Name</label>
                <input className="form-input" required value={form.company_name} onChange={set('company_name')} placeholder="Acme Door Services LLC" />
              </div>
              <div className="form-group">
                <label className="form-label required">Business Type</label>
                <select className="form-select" required value={form.business_type} onChange={set('business_type')}>
                  <option value="">Select type...</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label required">Phone</label>
              <input className="form-input" type="tel" required value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input className="form-input" value={form.address} onChange={set('address')} placeholder="123 Main St" />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={form.city} onChange={set('city')} placeholder="City" />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <select className="form-select" value={form.state} onChange={set('state')}>
                  <option value="">State</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ZIP Code</label>
                <input className="form-input" value={form.zip} onChange={set('zip')} placeholder="75201" />
              </div>
            </div>
            <div className="alert alert-info">
              <span>✓</span>
              <span>Your account is active immediately. Once you finish, you'll be signed in and can see pricing and place orders right away.</span>
            </div>
            <div className="auth-form-btns">
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button type="submit" className={`btn btn-primary btn-lg ${loading ? 'btn-loading' : ''}`} disabled={loading}>
                Create Account
              </button>
            </div>
          </form>
        )}

        <p className="auth-footer-text">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
