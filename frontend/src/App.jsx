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
import WishlistNotification from './components/shop/WishlistNotification';
import WishlistDrawer from './components/shop/WishlistDrawer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import PageLoader from './components/layout/PageLoader';

/* Routes */
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            
            <PageLoader />
            <AppRoutes />

            {/* ── GLOBAL DRAWERS & MODALS ── */}
            <CartNotification />
            <CartDrawer />
            <WishlistNotification />
            <WishlistDrawer />
            <MobileBottomNav />

          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
