import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from '../components/auth/ProtectedRoute';

/* Pages */
import HomePage from '../pages/HomePage';
import CategoryPage from '../pages/CategoryPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import BlogPage from '../pages/BlogPage';
import BlogDetailPage from '../pages/BlogDetailPage';
import UserLoginPage from '../pages/UserLoginPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import AdminDashboard from '../pages/AdminDashboard';
import MyOrdersPage from '../pages/MyOrdersPage';
import UserProfilePage from '../pages/UserProfilePage';
import AddressPage from '../pages/AddressPage';
import WishlistPage from '../pages/WishlistPage';
import CheckoutPage from '../pages/CheckoutPage';
import ContactPage from '../pages/ContactPage';
import SearchPage from '../pages/SearchPage';
export default function AppRoutes() {
  return (
    <Routes>
      {/* Routes without Header/Footer (e.g., Admin) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requireRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Normal Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<CategoryPage categorySlug="gifts" />} />
      <Route path="/wooden-furniture" element={<CategoryPage categorySlug="gifts" />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />

      {/* Gift Store Category Aliases */}
      <Route path="/gifts" element={<CategoryPage categorySlug="gifts" />} />
      <Route path="/diwali-gifts" element={<CategoryPage categorySlug="diwali-gifts" />} />
      <Route path="/birthday-gifts" element={<CategoryPage categorySlug="birthday-gifts" />} />
      <Route path="/anniversary-gifts" element={<CategoryPage categorySlug="anniversary-gifts" />} />
      <Route path="/toys" element={<CategoryPage categorySlug="toys" />} />
      <Route path="/soft-toys" element={<CategoryPage categorySlug="soft-toys" />} />
      <Route path="/baby-toys" element={<CategoryPage categorySlug="baby-toys" />} />
      <Route path="/board-games" element={<CategoryPage categorySlug="board-games" />} />
      <Route path="/astrology" element={<CategoryPage categorySlug="astrology" />} />
      <Route path="/rings" element={<CategoryPage categorySlug="rings" />} />
      <Route path="/pendants" element={<CategoryPage categorySlug="pendants" />} />
      <Route path="/bracelets" element={<CategoryPage categorySlug="bracelets" />} />
      <Route path="/gemstones-crystals" element={<CategoryPage categorySlug="gemstones-crystals" />} />

      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogDetailPage />} />
      <Route path="/login" element={<UserLoginPage />} />
      <Route path="/my-orders" element={<MyOrdersPage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/address" element={<AddressPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/contact-us" element={<ContactPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
