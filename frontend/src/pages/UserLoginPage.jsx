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

export default function UserLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessInfo('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(email.trim(), password);
      setLoading(false);
      
      login('user', res.token, res.user, remember); // pass remember state

      const from = location.state?.from?.pathname;
      // If user came from a specific page (like checkout), go back there.
      // Otherwise, default to their profile dashboard.
      navigate(from && from !== '/login' ? from : '/profile', { replace: true });
    } catch (err) {
      const cleanEmail = email.trim().toLowerCase();
      if ((cleanEmail === 'user@astrogifts.com' || cleanEmail === 'user@woodmart.com' || cleanEmail === 'user') && password === 'user123') {
        const demoUser = { id: 2, name: 'Demo User', email: 'user@astrogifts.com', role: 'customer' };
        login('user', 'demo_user_token_12345', demoUser, remember);
        setLoading(false);
        const from = location.state?.from?.pathname;
        navigate(from && from !== '/login' ? from : '/profile', { replace: true });
        return;
      }
      setLoading(false);
      setError(err.data?.message || err.message || 'Invalid email or password.');
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
          className="astrogifts-login-backdrop"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`astrogifts-login-drawer ${drawerOpen ? 'astrogifts-login-drawer--open' : ''}`}
        aria-label="Sign in panel"
      >
        <div className="astrogifts-login-drawer__header">
          <h2 className="astrogifts-login-drawer__title">Sign in / Register</h2>
          <button
            type="button"
            className="astrogifts-login-drawer__close-btn"
            onClick={handleClose}
            aria-label="Close sign in modal"
            id="close-login-drawer"
          >
            <span className="astrogifts-login-drawer__close-icon">✕</span>
            <span>Close</span>
          </button>
        </div>

        <div className="astrogifts-login-drawer__body">
          <form className="astrogifts-login-drawer__form" onSubmit={handleLogin} noValidate>
            <div className="astrogifts-login-drawer__field">
              <label htmlFor="login-email" className="astrogifts-login-drawer__label">
                Email address <span className="astrogifts-login-drawer__required">*</span>
              </label>
              <input
                id="login-email"
                type="email"
                className="astrogifts-login-drawer__input"
                value={email}
                placeholder="user@astrogifts.com"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                autoFocus
                required
              />
            </div>

            <div className="astrogifts-login-drawer__field">
              <label htmlFor="login-password" className="astrogifts-login-drawer__label">
                Password <span className="astrogifts-login-drawer__required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="astrogifts-login-drawer__input astrogifts-login-drawer__input--password"
                  value={password}
                  placeholder="Password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                />
                <button
                  type="button"
                  className="astrogifts-login-drawer__eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              <small style={{ fontSize: '11px', color: '#888', marginTop: '4px', display: 'block' }}>
                Demo credentials: <strong>user@astrogifts.com</strong> / <strong>user123</strong>
              </small>
            </div>

            {error && (
              <div className="astrogifts-login-drawer__error" role="alert">
                <span style={{ fontSize: '16px' }}>!</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="astrogifts-login-drawer__submit-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="astrogifts-login-drawer__spinner" />
              ) : (
                'Sign In'
              )}
            </button>
            
            <div className="astrogifts-login-drawer__options">
              <label className="astrogifts-login-drawer__remember-label">
                <input
                  type="checkbox"
                  className="astrogifts-login-drawer__checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <button
                type="button"
                className="astrogifts-login-drawer__lost-btn"
                onClick={() => alert('Lost password flow not implemented.')}
              >
                Lost your password?
              </button>
            </div>
            
            <div className="astrogifts-login-drawer__admin-link-wrapper" style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/admin/login" className="astrogifts-login-drawer__admin-link" style={{ fontSize: '13px', color: '#e55d28', fontWeight: '600', textDecoration: 'none' }}>
                Go to Admin Login Portal →
              </Link>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}
