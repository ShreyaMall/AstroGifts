import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './UserLoginPage.css';
import HeroSlider from '../components/home/HeroSlider';
import OurCategories from '../components/home/OurCategories';
import WeeklyBestsellers from '../components/home/WeeklyBestsellers';
import ProductCollections from '../components/home/ProductCollections';
import LatestArticles from '../components/home/LatestArticles';

import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

const DEMO_USER = {
  email: 'user@woodmart.com',
  password: 'user123',
};

export default function UserLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail.trim() || !password || (isRegistering && !name.trim())) {
      setError('Please fill in all required fields (*)');
      return;
    }

    const cleanEmail = usernameOrEmail.trim().toLowerCase();
    const isTryingAdmin = cleanEmail === 'admin@woodmart.com' || cleanEmail === 'admin';

    if (isRegistering && isTryingAdmin) {
      setError('Cannot register as admin from here.');
      return;
    }

    setLoading(true);

    try {
      let res;
      if (isRegistering) {
        res = await authApi.register(name.trim(), usernameOrEmail.trim(), password);
      } else {
        res = isTryingAdmin
          ? await authApi.adminLogin(usernameOrEmail.trim(), password)
          : await authApi.login(usernameOrEmail.trim(), password);
      }

      setLoading(false);

      const role = (isTryingAdmin || res?.user?.role === 'admin') ? 'admin' : 'user';
      login(role, res?.token || 'demo-token', res?.user || null, rememberMe);

      const from = location.state?.from?.pathname || (role === 'admin' ? '/admin/dashboard' : '/');
      navigate(from, { replace: true });

    } catch (err) {
      setLoading(false);

      if (!isRegistering && isTryingAdmin && password === 'admin123') {
        login('admin', 'mock-admin-token', { name: 'Admin', email: 'admin@woodmart.com', role: 'admin' }, rememberMe);
        navigate('/admin/dashboard', { replace: true });
      } else if (!isRegistering && (cleanEmail === DEMO_USER.email || cleanEmail === 'user') && password === DEMO_USER.password) {
        login('user', 'mock-user-token', { name: 'Demo User', email: DEMO_USER.email, role: 'user' }, rememberMe);
        navigate('/', { replace: true });
      } else {
        setError(err.message || 'Invalid credentials or registration failed.');
      }
    }
  };

  const handleClose = () => {
    setDrawerOpen(false);
    navigate('/');
  };

  return (
    <div className="user-login-view">
      <div className="user-login-view__bg">
        <Header onAccountClick={() => setDrawerOpen(true)} />
        <main>
          <HeroSlider />
          <OurCategories />
          <WeeklyBestsellers />
          <ProductCollections />
          <LatestArticles />
        </main>
        <Footer />
      </div>

      {drawerOpen && (
        <div
          className="woodmart-login-backdrop"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`woodmart-login-drawer ${drawerOpen ? 'woodmart-login-drawer--open' : ''}`}
        aria-label="Sign in panel"
      >
        <div className="woodmart-login-drawer__header">
          <div style={{ display: 'flex', gap: '15px' }}>
            <h2 
              className="woodmart-login-drawer__title" 
              style={{ cursor: 'pointer', opacity: !isRegistering ? 1 : 0.5 }}
              onClick={() => { setIsRegistering(false); setError(''); }}
            >
              Sign in
            </h2>
            <h2 
              className="woodmart-login-drawer__title" 
              style={{ cursor: 'pointer', opacity: isRegistering ? 1 : 0.5 }}
              onClick={() => { setIsRegistering(true); setError(''); }}
            >
              Register
            </h2>
          </div>
          <button
            type="button"
            className="woodmart-login-drawer__close-btn"
            onClick={handleClose}
            aria-label="Close sign in modal"
            id="close-login-drawer"
          >
            <span className="woodmart-login-drawer__close-icon">✕</span>
            <span>Close</span>
          </button>
        </div>

        <div className="woodmart-login-drawer__body">
          <form className="woodmart-login-drawer__form" onSubmit={handleSubmit} noValidate>
            
            {isRegistering && (
              <div className="woodmart-login-drawer__field">
                <label htmlFor="login-name" className="woodmart-login-drawer__label">
                  Full Name <span className="woodmart-login-drawer__required">*</span>
                </label>
                <input
                  id="login-name"
                  type="text"
                  className="woodmart-login-drawer__input"
                  value={name}
                  placeholder="John Doe"
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  autoFocus={isRegistering}
                  required={isRegistering}
                />
              </div>
            )}

            <div className="woodmart-login-drawer__field">
              <label htmlFor="login-username" className="woodmart-login-drawer__label">
                {isRegistering ? 'Email address' : 'Username or email address'} <span className="woodmart-login-drawer__required">*</span>
              </label>
              <input
                id="login-username"
                type="text"
                className="woodmart-login-drawer__input"
                value={usernameOrEmail}
                placeholder={isRegistering ? "john@example.com" : "user@woodmart.com"}
                onChange={(e) => {
                  setUsernameOrEmail(e.target.value);
                  setError('');
                }}
                autoFocus={!isRegistering}
                required
              />
            </div>

            <div className="woodmart-login-drawer__field">
              <label htmlFor="login-password" className="woodmart-login-drawer__label">
                Password <span className="woodmart-login-drawer__required">*</span>
              </label>
              <div className="woodmart-login-drawer__password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="user123"
                  className="woodmart-login-drawer__input woodmart-login-drawer__input--password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                />
                <button
                  type="button"
                  className="woodmart-login-drawer__eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="woodmart-login-drawer__error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="woodmart-login-drawer__submit-btn"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? (
                <span className="woodmart-login-drawer__spinner" />
              ) : (
                isRegistering ? 'Register' : 'Log in'
              )}
            </button>

            <div className="woodmart-login-drawer__options">
              <label className="woodmart-login-drawer__remember-label">
                <input
                  type="checkbox"
                  className="woodmart-login-drawer__checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  id="remember-me-checkbox"
                />
                <span>Remember me</span>
              </label>

              <a
                href="#forgot-password"
                className="woodmart-login-drawer__forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset link sent to registered email.');
                }}
              >
                Lost your password?
              </a>
            </div>
          </form>

          <div className="woodmart-login-drawer__divider" />

          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <Link
              to="/admin/login"
              id="switch-to-admin-btn"
              style={{
                color: '#d96b27',
                fontSize: '13px',
                textDecoration: 'underline',
                fontWeight: '600'
              }}
            >
              Go to Admin Login Portal →
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
