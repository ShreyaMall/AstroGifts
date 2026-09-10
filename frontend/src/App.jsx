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
import CheckoutModal from './components/shop/CheckoutModal';

/* Routes */
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            
            <AppRoutes />

            {/* ── GLOBAL DRAWERS & MODALS ── */}
            <CartNotification />
            <CartDrawer />
            <WishlistNotification />
            <WishlistDrawer />
            <CheckoutModal />

          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
