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

  useEffect(() => {
    const token = getAuthToken();
    if (token && !user) {
      // Fetch current user details if token exists
      authApi.me()
        .then(res => {
          if (res && res.user) {
            setUser(res.user);
            setAuthRole(res.user.role || (res.user.email?.includes('admin') ? 'admin' : 'user'));
          }
        })
        .catch(() => {
          // Keep existing role if offline/mock
        });
    }
  }, []);

  const login = (role, token = null, userData = null, persistent = true) => {
    // Always trust the backend role if available to prevent state desync
    const actualRole = userData?.role || role;
    
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
      isAuthenticated: !!authRole,
      isAdmin: authRole === 'admin',
      isUser: authRole === 'user' || authRole === 'customer',
      loading,
      login,
      logout,
      setAuthRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
