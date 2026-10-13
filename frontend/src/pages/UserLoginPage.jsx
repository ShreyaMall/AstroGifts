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
  const { login, openAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/profile';
      navigate(from, { replace: true });
      return;
    }
    const redirectTo = location.state?.from?.pathname || '/';
    openAuth({
      redirectTo,
      onSuccess: () => {
        navigate(redirectTo, { replace: true });
      }
    });
  }, [isAuthenticated, openAuth, navigate, location]);

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [loading, setLoading] = useState(false);
  // Old drawer disabled in favor of centralized OTP AuthModal
  const drawerOpen = false;

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="user-login-view">
      <div className="user-login-view__bg">
        <Header onAccountClick={() => openAuth({ redirectTo: '/profile' })} />
        <main>
          <HeroSlider />
          <OurCategories />
          <WeeklyBestsellers />
          <ProductCollections />
          <LatestArticles />
        </main>
        <Footer />
      </div>

      {/* Note: The old right-side drawer is preserved below but disabled in favor of centralized OTP modal */}
      {drawerOpen && (
        <div
          className="astrogifts-login-backdrop"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {drawerOpen && (
        <aside
          className="astrogifts-login-drawer"
          aria-label="Sign in panel"
        >
        <div className="astrogifts-login-drawer__header">
          <h2 className="astrogifts-login-drawer__title">
            {mode === 'login' ? 'Sign in' : 'Create Account'}
          </h2>
          <button
            type="button"
            className="astrogifts-login-drawer__close-btn"
            onClick={handleClose}
            aria-label="Close modal"
            id="close-login-drawer"
          >
            <span className="astrogifts-login-drawer__close-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
            <span>Close</span>
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', padding: '0 24px', background: '#fafafa' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '14px 0',
              background: 'none',
              border: 'none',
              borderBottom: mode === 'login' ? '3px solid #704832' : '3px solid transparent',
              fontWeight: mode === 'login' ? '700' : '500',
              color: mode === 'login' ? '#704832' : '#777',
              cursor: 'pointer',
              fontSize: '15px',
              transition: 'all 0.15s'
            }}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '14px 0',
              background: 'none',
              border: 'none',
              borderBottom: mode === 'register' ? '3px solid #704832' : '3px solid transparent',
              fontWeight: mode === 'register' ? '700' : '500',
              color: mode === 'register' ? '#704832' : '#777',
              cursor: 'pointer',
              fontSize: '15px',
              transition: 'all 0.15s'
            }}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        <div className="astrogifts-login-drawer__body">
          <button
            type="button"
            onClick={() => openAuthModal(() => navigate(location.state?.from?.pathname || '/'))}
            style={{
              width: '100%',
              padding: '12px',
              background: '#fdf6f0',
              color: '#7c3a1d',
              border: '1.5px solid #e8d5c8',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
              <path d="M12 18h.01" />
            </svg>
            <span>Mobile OTP Login (Fast & Passwordless)</span>
          </button>

          <form className="astrogifts-login-drawer__form" onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <div className="astrogifts-login-drawer__field">
                <label htmlFor="register-name" className="astrogifts-login-drawer__label">
                  Full Name <span className="astrogifts-login-drawer__required">*</span>
                </label>
                <input
                  id="register-name"
                  type="text"
                  className="astrogifts-login-drawer__input"
                  value={name}
                  placeholder="e.g. Shreya Rajput"
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  autoFocus
                  required
                />
              </div>
            )}

            <div className="astrogifts-login-drawer__field">
              <label htmlFor="login-email" className="astrogifts-login-drawer__label">
                Email address <span className="astrogifts-login-drawer__required">*</span>
              </label>
              <input
                id="login-email"
                type="email"
                className="astrogifts-login-drawer__input"
                value={email}
                placeholder="you@example.com"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                autoFocus={mode === 'login'}
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
                  placeholder={mode === 'register' ? 'Min 6 characters' : 'Password'}
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

            </div>

            {error && (
              <div className="astrogifts-login-drawer__error" role="alert">
                <span style={{ fontSize: '16px' }}>!</span> {error}
                {error.includes('No account found') && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    style={{
                      display: 'block',
                      marginTop: '6px',
                      background: '#704832',
                      color: '#fff',
                      border: 'none',
                      padding: '5px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Click here to Register →
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              className="astrogifts-login-drawer__submit-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="astrogifts-login-drawer__spinner" />
              ) : mode === 'register' ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
            
            {mode === 'login' && (
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
                  onClick={() => setError('Lost password flow: Please click Register if creating a new account.')}
                >
                  Lost your password?
                </button>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#666' }}>
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#704832', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  >
                    Register now
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#704832', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
            

          </form>
        </div>
      </aside>
      )}
    </div>
  );
}
