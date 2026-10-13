import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminLoginPage.css';
import { adminApi } from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLoginPage() {
  const { adminLogin } = useAdminAuth();
  const navigate  = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter your administrator credentials.');
      return;
    }

    setLoading(true);

    try {
      const res = await adminApi.login(cleanEmail, password);
      adminLogin(res.token, res.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.data?.message || err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      {/* ── LEFT PANEL ── */}
      <div className="admin-login-page__left">
        <div className="admin-login-page__brand">
          <div className="admin-login-page__logo">
            <span className="admin-login-page__brand-name">ASTROGIFTS</span>
          </div>
          <span className="admin-login-page__brand-badge">CONTROL CENTER</span>
        </div>

        <div className="admin-login-page__hero">
          <div className="admin-login-page__hero-tag">ENTERPRISE ADMIN PORTAL</div>
          <h1 className="admin-login-page__hero-title">
            Store Management &amp; Analytics
          </h1>
          <p className="admin-login-page__hero-desc">
            Authorized administrative access only. Manage products, process orders, track revenue metrics and configure global catalog settings.
          </p>

          <div className="admin-login-page__metrics">
            <div className="admin-login-page__metric">
              <span className="admin-login-page__metric-val">99.9%</span>
              <span className="admin-login-page__metric-lbl">Uptime SLA</span>
            </div>
            <div className="admin-login-page__metric-div"/>
            <div className="admin-login-page__metric">
              <span className="admin-login-page__metric-val">256-bit</span>
              <span className="admin-login-page__metric-lbl">Encryption</span>
            </div>
            <div className="admin-login-page__metric-div"/>
            <div className="admin-login-page__metric">
              <span className="admin-login-page__metric-val">Real-time</span>
              <span className="admin-login-page__metric-lbl">Telemetry</span>
            </div>
          </div>
        </div>

        <div className="admin-login-page__left-footer">
          <Link to="/" className="admin-login-page__user-link">← Return to Storefront</Link>
          <span className="admin-login-page__version">AstroGifts Core v3.2.0</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="admin-login-page__right">
        <div className="admin-login-page__card">

          <div className="admin-login-page__header">
            <div className="admin-login-page__shield">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h2 className="admin-login-page__title">Admin Authentication</h2>
            <p className="admin-login-page__subtitle">
              Sign in with your administrative credentials to continue
            </p>
          </div>

          <form className="admin-login-page__form" onSubmit={handleSubmit} noValidate>

            <div className="admin-login-page__field">
              <label htmlFor="login-email" className="admin-login-page__label">
                Administrator Email
              </label>
              <div className="admin-login-page__input-wrap">
                <span className="admin-login-page__input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="login-email" type="email"
                  className="admin-login-page__input"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email" autoFocus required
                />
              </div>
            </div>

            <div className="admin-login-page__field">
              <label htmlFor="login-pass" className="admin-login-page__label">
                Security Key / Password
              </label>
              <div className="admin-login-page__input-wrap">
                <span className="admin-login-page__input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="login-pass"
                  type={showPass ? 'text' : 'password'}
                  className="admin-login-page__input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password" required
                />
                <button type="button" className="admin-login-page__eye" onClick={() => setShowPass(p => !p)} aria-label="Toggle password">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    {showPass
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div className="admin-login-page__error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="admin-login-page__submit"
              disabled={loading}
            >
              {loading ? <span className="admin-login-page__spinner"/> : 'Access Control Center'}
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}
