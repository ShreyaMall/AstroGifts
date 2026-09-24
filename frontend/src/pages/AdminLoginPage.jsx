
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminLoginPage.css';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ADMIN_CREDS = { email: 'admin@astrogifts.com', password: 'admin123' };
const USER_CREDS  = { email: 'user@astrogifts.com',  password: 'user123'  };

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [tab,      setTab]      = useState('admin'); // 'user' | 'admin'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const [otpStep, setOtpStep] = useState(1); // 1 = email, 2 = otp
  const [otp,     setOtp]     = useState('');

  const switchTab = (t) => {
    setTab(t); setEmail(''); setPassword(''); setError('');
    setOtp(''); setOtpStep(1);
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'admin') {
        if (!email || !password) { setError('Please enter your credentials.'); setLoading(false); return; }
        try {
          const res = await authApi.adminLogin(email.trim(), password);
          login('admin', res.token, res.user, remember);
          navigate('/admin/dashboard');
        } catch (apiErr) {
          const cleanEmail = email.trim().toLowerCase();
          if ((cleanEmail === 'admin@astrogifts.com' || cleanEmail === 'admin@woodmart.com' || cleanEmail === 'admin') && password === 'admin123') {
            const demoUser = { id: 1, name: 'AstroGifts Admin', email: 'admin@astrogifts.com', role: 'admin' };
            login('admin', 'demo_admin_token_12345', demoUser, remember);
            navigate('/admin/dashboard');
            return;
          }
          throw apiErr;
        }
      } else {
        // OTP flow for users
        if (otpStep === 1) {
          if (!email.trim()) { setError('Please enter your email address.'); setLoading(false); return; }
          await authApi.sendOtp(email.trim());
          setOtp('');
          setOtpStep(2);
          setError('');
        } else {
          if (!otp.trim()) { setError('Please enter the OTP sent to your email.'); setLoading(false); return; }
          const res = await authApi.verifyOtp(email.trim(), otp.trim());
          login('user', res.token, res.user, remember);
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const fillDemo = () => {
    tab === 'admin' ? (setEmail(ADMIN_CREDS.email), setPassword(ADMIN_CREDS.password))
                    : (setEmail(USER_CREDS.email),  setPassword(USER_CREDS.password));
    setError('');
  };

  const isAdmin = tab === 'admin';

  return (
    <div className="admin-login-page">

      {/* ── LEFT PANEL ── */}
      <div className="admin-login-page__left">
        <div className="admin-login-page__brand">
          <div className="admin-login-page__logo">
            <span className="admin-login-page__brand-name">ASTROGIFTS</span>
          </div>
          <span className="admin-login-page__brand-badge">{isAdmin ? 'CONTROL CENTER' : 'CUSTOMER PORTAL'}</span>
        </div>

        <div className="admin-login-page__hero">
          <div className="admin-login-page__hero-tag">{isAdmin ? 'ENTERPRISE ADMIN PORTAL' : 'CUSTOMER ACCOUNT'}</div>
          <h1 className="admin-login-page__hero-title">
            {isAdmin ? 'Store Management & Analytics' : 'Welcome Back to AstroGifts'}
          </h1>
          <p className="admin-login-page__hero-desc">
            {isAdmin
              ? 'Authorized administrative access only. Manage products, process orders, track revenue metrics and configure global catalog settings.'
              : 'Sign in to track your orders, save your wishlist, and enjoy a personalized shopping experience.'}
          </p>

          <div className="admin-login-page__metrics">
            {isAdmin ? (
              <>
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
              </>
            ) : (
              <>
                <div className="admin-login-page__metric">
                  <span className="admin-login-page__metric-val">Free</span>
                  <span className="admin-login-page__metric-lbl">Shipping</span>
                </div>
                <div className="admin-login-page__metric-div"/>
                <div className="admin-login-page__metric">
                  <span className="admin-login-page__metric-val">Easy</span>
                  <span className="admin-login-page__metric-lbl">Returns</span>
                </div>
                <div className="admin-login-page__metric-div"/>
                <div className="admin-login-page__metric">
                  <span className="admin-login-page__metric-val">24/7</span>
                  <span className="admin-login-page__metric-lbl">Support</span>
                </div>
              </>
            )}
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

          {/* Tab Toggle */}
          <div style={{ display: 'flex', borderRadius: '10px', background: '#f1f5f9', padding: '4px', marginBottom: '24px', gap: '4px' }}>
            {['user', 'admin'].map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                style={{
                  flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
                  background: tab === t ? '#fff' : 'transparent',
                  color: tab === t ? (t === 'admin' ? '#ea580c' : '#d96b27') : '#64748b',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                {t === 'user' ? (
                  <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> User Login</>
                ) : (
                  <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Admin Login</>
                )}
              </button>
            ))}
          </div>

          <div className="admin-login-page__header">
            <div className="admin-login-page__shield">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isAdmin ? '#ea580c' : '#d96b27'} strokeWidth="2">
                {isAdmin
                  ? <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  : <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/> }
                {!isAdmin && <circle cx="12" cy="7" r="4"/>}
              </svg>
            </div>
            <h2 className="admin-login-page__title">{isAdmin ? 'Admin Authentication' : 'Customer Sign In'}</h2>
            <p className="admin-login-page__subtitle">
              {isAdmin ? 'Sign in with your administrative credentials to continue'
                       : 'Welcome back! Sign in to your AstroGifts account'}
            </p>
          </div>

          <form className="admin-login-page__form" onSubmit={handleSubmit} noValidate>

            <div className="admin-login-page__field">
              <label htmlFor="login-email" className="admin-login-page__label">
                {isAdmin ? 'Administrator Email' : 'Email Address'}
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
                  placeholder={isAdmin ? 'admin@astrogifts.com' : 'user@astrogifts.com'}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email" autoFocus required
                />
              </div>
            </div>

            {/* Password field — only for Admin */}
            {isAdmin && (
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
            )}

            {/* OTP field — only for User tab Step 2 */}
            {!isAdmin && otpStep === 2 && (
            <div className="admin-login-page__field">
              <label htmlFor="login-otp" className="admin-login-page__label">
                Enter OTP sent to {email}
              </label>
              <div className="admin-login-page__input-wrap">
                <span className="admin-login-page__input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="login-otp"
                  type="text"
                  maxLength={6}
                  className="admin-login-page__input"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g,'')); setError(''); }}
                  autoFocus
                />
              </div>
              <button type="button" onClick={() => { setOtpStep(1); setOtp(''); setError(''); }}
                style={{ background:'none', border:'none', color:'#d96b27', fontSize:'12px', cursor:'pointer', marginTop:'6px', padding:0 }}>
                ← Change email
              </button>
            </div>
            )}



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
              style={{ background: isAdmin ? undefined : 'linear-gradient(135deg,#d96b27,#e8863a)' }}
            >
              {loading ? <span className="admin-login-page__spinner"/> : (
                isAdmin ? 'Access Control Center' :
                otpStep === 1 ? 'Send OTP to Email' : 'Verify & Login'
              )}
            </button>

          </form>

          {/* Demo credentials */}
          <div className="admin-login-page__demo">
            <div>
              <span className="admin-login-page__demo-label">{isAdmin ? 'Demo Admin:' : 'Demo User:'} </span>
              <code className="admin-login-page__demo-cred">
                {isAdmin ? 'admin@astrogifts.com / admin123' : 'user@astrogifts.com / user123'}
              </code>
            </div>
            <button type="button" className="admin-login-page__demo-fill" onClick={fillDemo}>Auto-fill</button>
          </div>

        </div>
      </div>

    </div>
  );
}


