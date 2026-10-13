import React, { createContext, useContext, useState } from 'react';
import { adminApi } from '../services/api';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminTokenState] = useState(() => {
    return localStorage.getItem('admin_token') || null;
  });

  const [adminUser, setAdminUserState] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const adminLogin = (token, user) => {
    setAdminTokenState(token);
    setAdminUserState(user);
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
    if (user) {
      localStorage.setItem('admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('admin_user');
    }
  };

  const adminLogout = async () => {
    try {
      await adminApi.logout();
    } catch (err) {
      console.warn('Admin logout API error:', err);
    } finally {
      setAdminTokenState(null);
      setAdminUserState(null);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  };

  const value = {
    adminToken,
    adminUser,
    isAuthenticated: Boolean(adminToken),
    adminLogin,
    adminLogout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
