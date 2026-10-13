import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';

export function AdminProtectedRoute({ children }) {
  const { adminToken } = useAdminAuth();
  const location = useLocation();

  if (!adminToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function ProtectedRoute({ children, requireRole = null, requirePhoneVerified = false }) {
  const { authRole, isAuthenticated, isPhoneVerified, openAuth, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        openAuth({ redirectTo: location.pathname });
      } else if (requirePhoneVerified && !isPhoneVerified) {
        openAuth({ redirectTo: location.pathname });
      }
    }
  }, [loading, isAuthenticated, isPhoneVerified, requirePhoneVerified]);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Loading account...</div>;
  }

  if (requireRole === 'admin') {
    if (authRole !== 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '12px' }}>Authentication Required</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Please verify your mobile number to access this page.</p>
        <button
          onClick={() => openAuth({ redirectTo: location.pathname })}
          style={{
            padding: '12px 28px',
            background: 'var(--brand-primary, #7c3a1d)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Login with Mobile OTP
        </button>
      </div>
    );
  }

  if (requirePhoneVerified && !isPhoneVerified) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '12px' }}>Mobile Verification Required</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Please verify your mobile number before proceeding to checkout.</p>
        <button
          onClick={() => openAuth({ redirectTo: location.pathname })}
          style={{
            padding: '12px 28px',
            background: 'var(--brand-primary, #7c3a1d)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Verify Mobile Number
        </button>
      </div>
    );
  }

  return children;
}
