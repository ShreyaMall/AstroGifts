import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requireRole = null }) {
  const { authRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (requireRole === 'admin') {
    if (authRole !== 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  } else if (requireRole === 'user') {
    if (!authRole) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return children;
}
