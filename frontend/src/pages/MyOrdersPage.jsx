import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ordersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const DEMO_ORDERS = [
  {
    order_number: 'ORD-0001',
    created_at: '2026-08-12',
    status: 'Delivered',
    total: 2890,
    items: [
      { name: 'Solid Oak Dining Chair', qty: 2, price: 540, size: 'M', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=100&h=100&fit=crop' },
      { name: 'Nordic Wooden Bed', qty: 1, price: 1810, size: 'King', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=100&h=100&fit=crop' }
    ]
  },
  {
    order_number: 'ORD-0002',
    created_at: '2026-09-01',
    status: 'Processing',
    total: 1299,
    items: [
      { name: 'Minimalist Coffee Table', qty: 1, price: 1299, size: 'Standard', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop' }
    ]
  }
];

const STATUS_STYLE = {
  Delivered:  { background: '#22c55e', color: '#fff' },
  Processing: { background: '#f59e0b', color: '#fff' },
  Shipped:    { background: '#3b82f6', color: '#fff' },
  Cancelled:  { background: '#ef4444', color: '#fff' },
};

export default function MyOrdersPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Always check localStorage first for real placed orders
    const saved = localStorage.getItem('woodmart_user_orders');
    const localOrders = saved ? JSON.parse(saved) : [];

    ordersApi.getUserOrders()
      .then(res => {
        if (res?.orders?.length) {
          // Merge API orders + local orders (avoid duplicates by order_number)
          const apiOrders = res.orders;
          const merged = [...localOrders];
          apiOrders.forEach(o => {
            if (!merged.find(m => m.order_number === o.order_number)) merged.push(o);
          });
          setOrders(merged.length ? merged : DEMO_ORDERS);
        } else {
          setOrders(localOrders.length ? localOrders : DEMO_ORDERS);
        }
      })
      .catch(() => {
        setOrders(localOrders.length ? localOrders : DEMO_ORDERS);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const NAV = [
    { label: 'User Info', icon: '👤', to: '/profile' },
    { label: 'Wishlist',  icon: '🤍', to: '/wishlist' },
    { label: 'Orders',    icon: '📦', to: '/my-orders', active: true },
    { label: 'Address',   icon: '📍', to: '/address' },
  ];

  return (
    <>
      <Header />
      <div style={{ minHeight: 'calc(100vh - 400px)', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 20px 80px', display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

          {/* ── Sidebar ── */}
          <aside style={{ width: '200px', flexShrink: 0, background: '#fff', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', padding: '24px 0', position: 'sticky', top: '100px' }}>
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
          <div style={{ flex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px', color: '#111' }}>Order Details</h1>
              <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>Track your recent orders</p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Loading orders...</div>
            ) : orders.length === 0 ? (
              <div style={{ background: '#fff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>You have not placed any orders yet.</p>
                <Link to="/category/chairs" style={{ padding: '10px 24px', background: '#d96b27', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                  Browse Furniture
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {orders.map((ord, i) => {
                  const sc = STATUS_STYLE[ord.status] || STATUS_STYLE.Processing;
                  return (
                    <div key={ord.order_number || i} style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

                      {/* Order header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 22px', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Order ID</div>
                            <div style={{ fontWeight: '700', fontSize: '15px', color: '#111' }}>#{ord.order_number}</div>
                          </div>
                          {ord.customer_name && (
                            <div>
                              <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Customer</div>
                              <div style={{ fontWeight: '600', fontSize: '14px', color: '#111' }}>👤 {ord.customer_name}</div>
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Date</div>
                            <div style={{ fontSize: '13px', color: '#555' }}>{ord.created_at || 'Recently'}</div>
                          </div>
                          {ord.payment_method && (
                            <div>
                              <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Payment</div>
                              <div style={{ fontSize: '13px', color: '#555' }}>{ord.payment_method}</div>
                            </div>
                          )}
                        </div>
                        <span style={{ padding: '5px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', ...sc }}>
                          {ord.status || 'Processing'}
                        </span>
                      </div>

                      {/* Items */}
                      {ord.items && ord.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 22px', borderBottom: '1px solid #f7f7f7' }}>
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=100&h=100&fit=crop'}
                            alt={item.name}
                            style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee', flexShrink: 0 }}
                            onError={e => { e.target.src = 'https://via.placeholder.com/72'; }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '15px', color: '#111', marginBottom: '6px' }}>
                              {item.name || item.product_name}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                              {item.size && (
                                <span style={{ padding: '2px 10px', background: '#f3f4f6', borderRadius: '4px', fontSize: '12px', color: '#555' }}>
                                  Size: {item.size}
                                </span>
                              )}
                              <span style={{ padding: '2px 10px', background: '#f3f4f6', borderRadius: '4px', fontSize: '12px', color: '#555' }}>
                                Qty: {item.qty || item.quantity || 1}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '500' }}>✓ Quality checked product</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>Total Amount</div>
                            <div style={{ fontWeight: '700', fontSize: '18px', color: '#111' }}>
                              ₹{Number((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                              ₹{Number(item.price || 0).toLocaleString('en-IN')} × {item.qty || item.quantity || 1}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px', background: '#fafafa' }}>
                        <div style={{ fontSize: '13px', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🚚 {ord.status === 'Delivered' ? 'Your order has been delivered'
                              : ord.status === 'Shipped'  ? 'Your order is on the way'
                              : 'Your order is being processed'}
                        </div>
                        <button
                          style={{ padding: '7px 16px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#333', cursor: 'pointer' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor='#d96b27'; e.currentTarget.style.color='#d96b27'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor='#ddd'; e.currentTarget.style.color='#333'; }}
                        >
                          View Details →
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}
