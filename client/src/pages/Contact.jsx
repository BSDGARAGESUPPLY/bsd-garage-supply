import { useState } from 'react';
import api from '../api';
import './Static.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await api.post('/contact', form);
      setSent(r.data.message || "Thanks! We'll be in touch shortly.");
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="static-page">
      <div className="static-hero">
        <div className="static-hero-inner">
          <div className="static-eyebrow">Contact Us</div>
          <h1>We're here to help.</h1>
          <p>Questions about a part, an order, or your account? Reach out — a real person will get back to you.</p>
        </div>
      </div>

      <div className="static-body" style={{ maxWidth: '960px' }}>
        <div className="contact-layout">
          {/* Info */}
          <div className="contact-info-card">
            <div className="contact-info-item">
              <span className="contact-info-icon">📞</span>
              <div>
                <h4>Phone</h4>
                <a href="tel:1-800-273-7764">1-800-BSD-SPRING</a>
                <p>Mon–Fri, 7am–6pm CT</p>
              </div>
            </div>
            <div className="contact-info-item">
              <span className="contact-info-icon">✉️</span>
              <div>
                <h4>Email</h4>
                <a href="mailto:bsdgaragesupply@gmail.com">bsdgaragesupply@gmail.com</a>
                <p>We reply within one business day</p>
              </div>
            </div>
            <div className="contact-info-item">
              <span className="contact-info-icon">📍</span>
              <div>
                <h4>Location</h4>
                <p>Estero, FL 33928</p>
              </div>
            </div>
            <div className="contact-info-item">
              <span className="contact-info-icon">🚚</span>
              <div>
                <h4>Shipping</h4>
                <p>Same-day on orders placed before 2pm CT</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            {sent ? (
              <div className="contact-info-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '44px', marginBottom: '8px' }}>✅</div>
                <h2 style={{ marginTop: 0 }}>Message sent</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{sent}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Name</label>
                    <input className="form-input" required value={form.name} onChange={set('name')} placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Email</label>
                    <input className="form-input" type="email" required value={form.email} onChange={set('email')} placeholder="you@company.com" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input className="form-input" value={form.subject} onChange={set('subject')} placeholder="How can we help?" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label required">Message</label>
                  <textarea className="form-textarea" rows={6} required value={form.message} onChange={set('message')} placeholder="Tell us what you need…" />
                </div>
                <button type="submit" className={`btn btn-primary btn-lg ${loading ? 'btn-loading' : ''}`} disabled={loading}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
