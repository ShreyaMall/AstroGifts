import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';


import { useAuth } from '../context/AuthContext';

const STATUS_STYLE = {
  Delivered:  { background: '#22c55e', color: '#fff' },
  Processing: { background: '#f59e0b', color: '#fff' },
  Shipped:    { background: '#3b82f6', color: '#fff' },
  Cancelled:  { background: '#ef4444', color: '#fff' },
};

const NAV = [
  { label: 'User Info', icon: '👤', to: '/profile',   active: true },
  { label: 'Wishlist',  icon: '🤍', to: '/wishlist' },
  { label: 'Orders',    icon: '📦', to: '/my-orders' },
  { label: 'Address',   icon: '📍', to: '/address' },
];

export default function UserProfilePage() {
  const { user, logout, authRole } = useAuth();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const saved = localStorage.getItem('woodmart_user_orders');
    if (saved) setRecentOrders(JSON.parse(saved).slice(0, 3)); // show last 3
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 20px 80px', display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: '200px', flexShrink: 0, background: '#fff', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', padding: '24px 0', position: 'sticky', top: '20px' }}>
          <div style={{ padding: '0 20px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: '700', fontSize: '15px', color: '#111' }}>
            User Profile
          </div>
          <nav style={{ padding: '10px 0' }}>
            {NAV.map(item => (
              <Link key={item.label} to={item.to} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 20px', textDecoration: 'none', fontSize: '14px',
                fontWeight: item.active ? '600' : '400',
                color: item.active ? '#d96b27' : '#444',
                background: item.active ? '#fff7f0' : 'transparent',
                borderLeft: item.active ? '3px solid #d96b27' : '3px solid transparent',
              }}>
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 20px', width: '100%', textAlign: 'left',
              fontSize: '14px', color: '#e53e3e', background: 'none',
              border: 'none', borderLeft: '3px solid transparent', cursor: 'pointer',
            }}>
              🚪 Logout
            </button>
          </nav>
        </aside>

        {/* ── Main Content ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Profile Card */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', borderBottom: '1px solid #f0f0f0', paddingBottom: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff7f0', color: '#d96b27', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '700', border: '2px solid #f3d5b5' }}>
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px', color: '#111' }}>{user?.name || 'Customer'}</h1>
                <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>{user?.email || 'user@woodmart.com'}</p>
              </div>
              <span style={{ background: '#fff7f0', color: '#d96b27', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                {authRole || 'Customer'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'Account Type',        value: 'Verified Member' },
                { label: 'Currency',             value: 'INR (₹)' },
                { label: 'Total Orders',         value: recentOrders.length || '—' },
              ].map(info => (
                <div key={info.label} style={{ background: '#f9f9f9', padding: '14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{info.label}</div>
                  <div style={{ fontWeight: '600', color: '#111', fontSize: '14px' }}>{info.value}</div>
                </div>
              ))}
            </div>

            {authRole === 'admin' && (
              <Link to="/admin/dashboard" style={{ display: 'inline-block', padding: '9px 20px', background: '#1e293b', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}>
                🛡 Go to Admin Dashboard
              </Link>
            )}
          </div>

          {/* Recent Orders Section */}
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #f0f0f0' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111' }}>📦 Recent Orders</h2>
              <Link to="/my-orders" style={{ fontSize: '13px', color: '#d96b27', textDecoration: 'none', fontWeight: '600' }}>
                View All →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div style={{ padding: '40px 22px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🛒</div>
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
                          <div style={{ fontSize: '13px', color: '#333', fontWeight: '600' }}>👤 {ord.customer_name}</div>
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
  );
}

