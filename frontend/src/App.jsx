import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import './App.css';

/* Providers */
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

/* Global UI Overlay Components */
import CartNotification from './components/shop/CartNotification';
import CartDrawer from './components/shop/CartDrawer';
import FloatingCartBar from './components/shop/FloatingCartBar';
import WishlistNotification from './components/shop/WishlistNotification';
import WishlistDrawer from './components/shop/WishlistDrawer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import PageLoader from './components/layout/PageLoader';
import WhatsAppFloat from './components/layout/WhatsAppFloat';
import ScrollToTop from './components/layout/ScrollToTop';

import AuthModal from './components/auth/AuthModal';

/* Routes */
import AppRoutes from './routes/AppRoutes';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add('admin-body');
    } else {
      document.body.classList.remove('admin-body');
    }
    return () => {
      document.body.classList.remove('admin-body');
    };
  }, [isAdmin]);

  return (
    <AdminAuthProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            
            <ScrollToTop />
            <PageLoader />
            <AppRoutes />

            {/* ── GLOBAL DRAWERS & MODALS ── */}
            <AuthModal />
            <FloatingCartBar />
            <CartNotification />
            <CartDrawer />
            <WishlistNotification />
            <WishlistDrawer />
            {!isAdmin && <MobileBottomNav />}
            {!isAdmin && <WhatsAppFloat />}

          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </AdminAuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
