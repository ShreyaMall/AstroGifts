import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProfileSidebar from '../components/layout/ProfileSidebar';
import { User, Heart, Package, MapPin, LogOut, Shield, ShoppingBag } from 'lucide-react';

const STATUS_STYLE = {
  Delivered:  { background: '#22c55e', color: '#fff' },
  Processing: { background: '#f59e0b', color: '#fff' },
  Shipped:    { background: '#3b82f6', color: '#fff' },
  Cancelled:  { background: '#ef4444', color: '#fff' },
};

const NAV = [
  { label: 'User Info', icon: <User size={18} />, to: '/profile',   active: true },
  { label: 'Wishlist',  icon: <Heart size={18} />, to: '/wishlist' },
  { label: 'Orders',    icon: <Package size={18} />, to: '/my-orders' },
  { label: 'Address',   icon: <MapPin size={18} />, to: '/address' },
];

import { ordersApi } from '../services/api';

export default function UserProfilePage() {
  const { user, logout, authRole } = useAuth();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalOrderCount, setTotalOrderCount] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 1. Load user-specific cached orders from localStorage
    const saved = localStorage.getItem('astrogifts_user_orders');
    let userOrders = [];
    if (saved) {
      try {
        const allLocal = JSON.parse(saved);
        userOrders = user?.email
          ? allLocal.filter(o => !o.email || o.email.toLowerCase() === user.email.toLowerCase())
          : allLocal;
        setRecentOrders(userOrders.slice(0, 3));
        setTotalOrderCount(userOrders.length);
      } catch (e) {
        console.error('Failed to parse local orders', e);
      }
    }

    // 2. Fetch fresh user-specific orders from database API
    if (user?.email) {
      ordersApi.getUserOrders({ email: user.email })
        .then(res => {
          const apiOrders = res?.data || res?.orders || (Array.isArray(res) ? res : []);
          if (Array.isArray(apiOrders) && apiOrders.length > 0) {
            setRecentOrders(apiOrders.slice(0, 3));
            setTotalOrderCount(apiOrders.length);
          }
        })
        .catch(err => {
          console.error('Failed to fetch user orders from API', err);
        });
    }
  }, [user?.email]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <>
      <style>{`
        .profile-layout-container {
          max-width: 1120px; margin: 0 auto; padding: 40px 20px 80px; display: flex; gap: 28px; align-items: flex-start;
        }
        .profile-sidebar { width: 200px; flex-shrink: 0; background: #fff; border-radius: 12px; box-shadow: 0 1px 8px rgba(0,0,0,0.07); padding: 24px 0; position: sticky; top: 100px; }
        .profile-main { flex: 1; min-width: 0; }
        @media (max-width: 768px) {
          .profile-layout-container { flex-direction: column; padding: 20px 16px 60px; }
          .profile-sidebar { width: 100%; position: static; top: auto; margin-bottom: 10px; }
          .profile-main { width: 100%; }
        }
      `}</style>
      <Header />
      <div style={{ minHeight: 'calc(100vh - 150px)', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
        <div className="profile-layout-container">

          {/* ── Sidebar ── */}
          <ProfileSidebar activeTab="profile" />

          {/* ── Main Content ── */}
          <div className="profile-main" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Profile Card */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', borderBottom: '1px solid #f0f0f0', paddingBottom: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff7f0', color: '#d96b27', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '700', border: '2px solid #f3d5b5' }}>
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px', color: '#111' }}>{user?.name || 'Customer'}</h1>
                  <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>{user?.email || 'user@astrogifts.com'}</p>
                </div>
                <span style={{ background: '#fff7f0', color: '#d96b27', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                  {authRole || 'Customer'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {[
                  { label: 'Account Type',        value: 'Verified Member' },
                  { label: 'Currency',             value: 'INR (₹)' },
                  { label: 'Total Orders',         value: totalOrderCount > 0 ? totalOrderCount : (recentOrders.length || 0) },
                ].map(info => (
                  <div key={info.label} style={{ background: '#f9f9f9', padding: '14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{info.label}</div>
                    <div style={{ fontWeight: '600', color: '#111', fontSize: '14px' }}>{info.value}</div>
                  </div>
                ))}
              </div>

              {authRole === 'admin' && (
                <Link to="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 20px', background: '#1e293b', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}>
                  <Shield size={16} /> Go to Admin Dashboard
                </Link>
              )}
            </div>

            {/* Recent Orders Section */}
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #f0f0f0' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={18} color="#d96b27" /> Recent Orders
                </h2>
                <Link to="/my-orders" style={{ fontSize: '13px', color: '#d96b27', textDecoration: 'none', fontWeight: '600' }}>
                  View All →
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div style={{ padding: '40px 22px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <ShoppingBag size={36} color="#bbb" />
                  </div>
                  <p style={{ margin: '0 0 16px' }}>No orders placed yet.</p>
                  <Link to="/category/chairs" style={{ padding: '9px 20px', background: '#d96b27', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}>
                    Shop Now
                  </Link>
                </div>
              ) : (
                recentOrders.map((ord, i) => {
                  const sc = STATUS_STYLE[ord.status] || STATUS_STYLE.Processing;
                  return (
                    <div key={ord.order_number || i} style={{ padding: '16px 22px', borderBottom: '1px solid #f7f7f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Order ID</div>
                          <div style={{ fontWeight: '700', fontSize: '14px', color: '#111' }}>#{ord.order_number}</div>
                        </div>
                        {ord.customer_name && (
                          <div>
                            <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Customer</div>
                            <div style={{ fontSize: '13px', color: '#333', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <User size={14} color="#666" /> {ord.customer_name}
                            </div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Date</div>
                          <div style={{ fontSize: '13px', color: '#555' }}>{ord.created_at || 'Recently'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Total</div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#d96b27' }}>₹{Number(ord.total || 0).toLocaleString('en-IN')}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Items</div>
                          <div style={{ fontSize: '13px', color: '#555' }}>{ord.items?.length || 0} item(s)</div>
                        </div>
                      </div>
                      <span style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', ...sc }}>
                        {ord.status || 'Processing'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}

