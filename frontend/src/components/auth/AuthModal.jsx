import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { authApi, getAuthToken } from '../../services/api';
import OtpInput from './OtpInput';
import './AuthModal.css';

const RESEND_SECONDS = 120;

const formatCountdown = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function AuthModal() {
  const { isAuthOpen, closeAuth, authOptions, login } = useAuth();
  const { cartCount, cartTotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode/Step: 'phone' (Screen A), 'otp' (Screen B), 'profile' (Screen C), 'password' (Legacy Email Mode)
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const modalRef = useRef(null);
  const triggerElementRef = useRef(null);
  const firstInputRef = useRef(null);

  const startCooldown = (seconds) => {
    const sec = Math.max(1, Math.floor(Number(seconds) || RESEND_SECONDS));
    setResendAt(Date.now() + sec * 1000);
    setCooldown(sec);
  };

  // Focus management & Scroll locking
  useEffect(() => {
    if (isAuthOpen) {
      triggerElementRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      // Focus first input after slight delay for animation
      const focusTimer = setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(focusTimer);
    } else {
      document.body.style.overflow = '';
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        triggerElementRef.current.focus();
      }
    }
  }, [isAuthOpen, step]);

  // Resend Countdown Timer (computed from target timestamp so it stays accurate in background tabs)
  useEffect(() => {
    if (!resendAt) {
      setCooldown(0);
      return;
    }

    const updateCooldown = () => {
      const remaining = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000));
      setCooldown(remaining);
      if (remaining <= 0) {
        setResendAt(0);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [resendAt]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isAuthOpen) return;
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthOpen, loading]);

  if (!isAuthOpen) return null;

  const resetForm = () => {
    setStep('phone');
    setPhone('');
    setMarketingOptIn(false);
    setOtp(Array(6).fill(''));
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMsg('');
    setResendAt(0);
    setCooldown(0);
  };

  const handleClose = () => {
    if (loading) return;
    closeAuth();
    resetForm();
    if (location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  };

  // Helper after auth completes successfully
  const handleAuthComplete = (userData) => {
    setSuccessMsg('Logged in successfully!');
    setTimeout(() => {
      closeAuth();
      resetForm();

      if (typeof authOptions?.onSuccess === 'function') {
        authOptions.onSuccess(userData);
      } else if (authOptions?.pendingAction === 'checkout' || authOptions?.redirectTo === '/checkout') {
        navigate('/checkout');
      } else if (authOptions?.redirectTo) {
        navigate(authOptions.redirectTo, { replace: true });
      } else if (location.pathname === '/login') {
        navigate('/', { replace: true });
      }
    }, 350);
  };

  // ── Step A: Send Mobile OTP ──
  const handlePhoneSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6-9.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.sendPhoneOtp(cleanPhone);
      if (res.status === 'success') {
        setStep('otp');
        const retryAfter = res.retry_after ?? res.cooldown_seconds ?? res.cooldown ?? RESEND_SECONDS;
        startCooldown(retryAfter);
        setSuccessMsg(res.message || `6-digit OTP sent to +91 ${cleanPhone}`);
      } else {
        setError(res.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      const rawRetry = err.data?.retry_after ?? err.data?.cooldown_seconds;
      if (rawRetry !== undefined && rawRetry !== null && !isNaN(Number(rawRetry))) {
        startCooldown(rawRetry);
      }
      const rawMsg = err.message || 'Error sending OTP. Please check your network.';
      const cleanMsg = rawMsg.replace(/(\d+)(?:\.\d+)?\s*seconds/i, (match, p1) => {
        const val = Math.max(1, Math.floor(Number(p1)));
        return `${val} seconds`;
      });
      setError(cleanMsg);
    } finally {
      setLoading(false);
    }
  };

  // Clean phone input and strip +91 if pasted
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 10 && val.startsWith('91')) {
      val = val.slice(2);
    }
    if (val.startsWith('0')) {
      val = val.slice(1);
    }
    setPhone(val.slice(0, 10));
    if (error) setError('');
  };

  // ── Step B: Verify OTP ──
  const handleVerifyOtp = async (otpValue) => {
    const rawCode = otpValue !== undefined ? otpValue : otp;
    const code = Array.isArray(rawCode) ? rawCode.join('') : String(rawCode || '');

    if (!code || code.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await authApi.verifyPhoneOtp(cleanPhone, code, name);

      if (res.status === 'success' && res.token) {
        login(res.user?.role || 'customer', res.token, res.user, true);

        const isUnnamed = !res.user?.name || res.user?.name.trim() === '' || /^User \d+$/i.test(res.user?.name.trim());

        if (res.is_new_user || isUnnamed) {
          setStep('profile');
          setLoading(false);
          return;
        }

        handleAuthComplete(res.user);
      } else {
        setError(res.message || 'Invalid OTP.');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the OTP entered.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setError('');
    setSuccessMsg('');
    setOtp(Array(6).fill(''));
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await authApi.sendPhoneOtp(cleanPhone);
      if (res.status === 'success') {
        const retryAfter = res.retry_after ?? res.cooldown_seconds ?? res.cooldown ?? RESEND_SECONDS;
        startCooldown(retryAfter);
        setSuccessMsg('A new 6-digit OTP has been sent.');
      } else {
        setError(res.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      const rawRetry = err.data?.retry_after ?? err.data?.cooldown_seconds;
      if (rawRetry !== undefined && rawRetry !== null && !isNaN(Number(rawRetry))) {
        startCooldown(rawRetry);
      }
      const rawMsg = err.message || 'Error resending OTP.';
      const cleanMsg = rawMsg.replace(/(\d+)(?:\.\d+)?\s*seconds/i, (match, p1) => {
        const val = Math.max(1, Math.floor(Number(p1)));
        return `${val} seconds`;
      });
      setError(cleanMsg);
    } finally {
      setLoading(false);
    }
  };

  // Change phone number back to Screen A
  const handleChangeNumber = () => {
    if (loading) return;
    setStep('phone');
    setOtp(Array(6).fill(''));
    setError('');
    setSuccessMsg('');
  };

  // ── Step C: New User Profile Setup ──
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name to complete registration.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
      });

      if (res.status === 'success' && res.user) {
        login(res.user.role || 'customer', getAuthToken(), res.user, true);
        handleAuthComplete(res.user);
      } else {
        setError(res.message || 'Failed to save profile. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // ── Secondary Option: Email & Password Login ──
  const handlePasswordLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

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
      if (res.token && res.user) {
        login(res.user.role || 'customer', res.token, res.user, true);
        handleAuthComplete(res.user);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const isCheckoutMode = authOptions?.pendingAction === 'checkout';

  return (
    <div
      className="auth-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleClose();
        }
      }}
      role="presentation"
    >
      <div
        className="auth-modal-card"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="auth-modal-close-btn"
          onClick={handleClose}
          aria-label="Close authentication dialog"
          disabled={loading}
        >
          <svg
            width="18"
            height="18"
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
        </button>

        {/* Checkout Compact Order Summary Banner */}
        {isCheckoutMode && cartCount > 0 && (
          <div className="auth-checkout-summary-banner" aria-label="Checkout summary">
            <span className="auth-checkout-summary-icon">
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
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
            <div className="auth-checkout-summary-text">
              <strong>Checkout:</strong> {cartCount} {cartCount === 1 ? 'item' : 'items'} • ₹{cartTotal.toLocaleString('en-IN')}
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-brand-badge">AstroGifts</div>
          <h2 className="auth-modal-title" id="auth-modal-title">
            {step === 'phone' && 'Login or Sign Up'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'profile' && "Welcome! What's your name?"}
            {step === 'password' && 'Sign in with Email'}
          </h2>
          <p className="auth-modal-subtitle">
            {step === 'phone' && (isCheckoutMode ? 'Verify mobile number to proceed with your order fast & safe.' : 'Enter your mobile number for fast & passwordless access.')}
            {step === 'otp' && (
              <>
                Enter the 6-digit code sent to <strong>+91 {phone}</strong>.{' '}
                <button
                  type="button"
                  className="auth-change-number-link"
                  onClick={handleChangeNumber}
                  disabled={loading}
                >
                  Change number
                </button>
              </>
            )}
            {step === 'profile' && 'Please tell us your name so we can set up your account.'}
            {step === 'password' && 'Enter your registered email and password.'}
          </p>
        </div>

        {/* Inline Alerts */}
        {error && (
          <div className="auth-modal-alert auth-modal-alert--error" role="alert">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="auth-modal-alert auth-modal-alert--success" role="status">
            {successMsg}
          </div>
        )}

        {/* ── SCREEN A: Mobile Phone Input ── */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="auth-modal-form" noValidate>
            <div className="auth-phone-input-wrap">
              <span className="auth-country-code">+91</span>
              <input
                ref={firstInputRef}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={handlePhoneChange}
                disabled={loading}
                className="auth-phone-input"
                maxLength={10}
                aria-label="Mobile phone number"
                required
              />
            </div>

            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                disabled={loading}
                className="auth-checkbox"
              />
              <span>Notify me with offers & updates</span>
            </label>

            <button
              type="submit"
              disabled={loading || phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)}
              className="auth-submit-btn"
            >
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>

            <div className="auth-modal-terms">
              By continuing, you agree to AstroGifts <Link to="/about" onClick={handleClose}>Terms of Use</Link> & <Link to="/about" onClick={handleClose}>Privacy Policy</Link>.
            </div>

            <div className="auth-switch-mode-wrap">
              <button
                type="button"
                className="auth-switch-mode-btn"
                onClick={() => { setStep('password'); setError(''); setSuccessMsg(''); }}
                disabled={loading}
              >
                Use email & password instead
              </button>
            </div>
          </form>
        )}

        {/* ── SCREEN B: 6-Digit OTP Verification ── */}
        {step === 'otp' && (
          <div className="auth-modal-form">
            <OtpInput
              length={6}
              value={otp}
              onChange={setOtp}
              onComplete={handleVerifyOtp}
              disabled={loading}
            />

            <button
              type="button"
              onClick={() => handleVerifyOtp(otp)}
              disabled={loading || otp.join('').length !== 6}
              className="auth-submit-btn"
              style={{ marginTop: '16px' }}
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP & Continue'}
            </button>

            <div className="auth-otp-actions">
              {cooldown > 0 ? (
                <span className="auth-timer-text">
                  Resend OTP in <strong>{formatCountdown(cooldown)}</strong>
                </span>
              ) : (
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── SCREEN C: New User Profile Setup ── */}
        {step === 'profile' && (
          <form onSubmit={handleSaveProfile} className="auth-modal-form" noValidate>
            <div className="auth-input-group">
              <label htmlFor="auth-full-name">
                Full Name <span className="auth-required-mark">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="auth-full-name"
                type="text"
                className="auth-text-input"
                placeholder="e.g. Shreya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoComplete="name"
                required
              />
            </div>

            <div className="auth-input-group">
              <label htmlFor="auth-email">
                Email Address <span className="auth-optional-text">(Optional)</span>
              </label>
              <input
                id="auth-email"
                type="email"
                className="auth-text-input"
                placeholder="e.g. shreya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="auth-submit-btn"
            >
              {loading ? 'Saving Profile...' : 'Complete & Continue'}
            </button>
          </form>
        )}

        {/* ── SECONDARY MODE: Email & Password Form ── */}
        {step === 'password' && (
          <form onSubmit={handlePasswordLogin} className="auth-modal-form" noValidate>
            <div className="auth-input-group">
              <label htmlFor="auth-login-email">Email Address</label>
              <input
                ref={firstInputRef}
                id="auth-login-email"
                type="email"
                className="auth-text-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-input-group">
              <label htmlFor="auth-login-password">Password</label>
              <input
                id="auth-login-password"
                type="password"
                className="auth-text-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="auth-submit-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="auth-switch-mode-wrap">
              <button
                type="button"
                className="auth-switch-mode-btn"
                onClick={() => { setStep('phone'); setError(''); setSuccessMsg(''); }}
                disabled={loading}
              >
                ← Back to Mobile OTP login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
