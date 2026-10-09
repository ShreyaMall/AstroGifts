import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';

/* Providers */
import { AuthProvider } from './context/AuthContext';
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

/* Routes */
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            
            <ScrollToTop />
            <PageLoader />
            <AppRoutes />

            {/* ── GLOBAL DRAWERS & MODALS ── */}
            <FloatingCartBar />
            <CartNotification />
            <CartDrawer />
            <WishlistNotification />
            <WishlistDrawer />
            <MobileBottomNav />
            <WhatsAppFloat />

          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
