import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken, setAuthToken, authApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authRole, setAuthRole] = useState(() => {
    return localStorage.getItem('woodmart_role') || sessionStorage.getItem('woodmart_role') || null;
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('woodmart_user') || sessionStorage.getItem('woodmart_user');
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
    setAuthRole(role);
    const storage = persistent ? localStorage : sessionStorage;
    storage.setItem('woodmart_role', role);

    if (token) {
      setAuthToken(token, persistent);
    }

    if (userData) {
      setUser(userData);
      storage.setItem('woodmart_user', JSON.stringify(userData));
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
      localStorage.removeItem('woodmart_role');
      sessionStorage.removeItem('woodmart_role');
      localStorage.removeItem('woodmart_user');
      sessionStorage.removeItem('woodmart_user');
      setAuthToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      authRole,
      user,
      isAuthenticated: !!authRole,
      isAdmin: authRole === 'admin',
      isUser: authRole === 'user',
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
