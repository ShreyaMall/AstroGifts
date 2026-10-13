import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken, setAuthToken, authApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authRole, setAuthRole] = useState(() => {
    return localStorage.getItem('astrogifts_role') || sessionStorage.getItem('astrogifts_role') || null;
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('astrogifts_user') || sessionStorage.getItem('astrogifts_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authOptions, setAuthOptions] = useState({});

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await authApi.me();
      if (res && res.user) {
        setUser(res.user);
        const actualRole = res.user.role || (res.user.email?.includes('admin') ? 'admin' : 'customer');
        setAuthRole(actualRole);
        localStorage.setItem('astrogifts_user', JSON.stringify(res.user));
        localStorage.setItem('astrogifts_role', actualRole);
        return res.user;
      }
    } catch (e) {
      console.warn('refreshUser error:', e);
    }
    return null;
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      refreshUser();
    }
  }, []);

  const openAuth = (options = {}) => {
    if (typeof options === 'function') {
      setAuthOptions({ onSuccess: options });
    } else {
      setAuthOptions(options || {});
    }
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
    setAuthOptions({});
  };

  // Backward compatibility aliases
  const openAuthModal = openAuth;
  const closeAuthModal = closeAuth;
  const isAuthModalOpen = isAuthOpen;

  const login = (role, token = null, userData = null, persistent = true) => {
    const actualRole = userData?.role || role || 'customer';
    setAuthRole(actualRole);
    const storage = persistent ? localStorage : sessionStorage;
    storage.setItem('astrogifts_role', actualRole);

    if (token) {
      setAuthToken(token, persistent);
    }

    if (userData) {
      setUser(userData);
      storage.setItem('astrogifts_user', JSON.stringify(userData));
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      setAuthRole(null);
      setUser(null);
      localStorage.removeItem('astrogifts_role');
      sessionStorage.removeItem('astrogifts_role');
      localStorage.removeItem('astrogifts_user');
      sessionStorage.removeItem('astrogifts_user');
      setAuthToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      authRole,
      user,
      isAuthenticated: !!user || !!authRole,
      isPhoneVerified: !!user?.phone_verified_at,
      isAdmin: authRole === 'admin',
      isUser: authRole === 'user' || authRole === 'customer',
      loading,
      login,
      logout,
      refreshUser,
      setAuthRole,
      isAuthOpen,
      openAuth,
      closeAuth,
      authOptions,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      authModalCallback: authOptions?.onSuccess,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
