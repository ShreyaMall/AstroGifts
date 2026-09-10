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
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogDetailPage />} />
      <Route path="/login" element={<UserLoginPage />} />
      <Route path="/my-orders" element={<MyOrdersPage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
