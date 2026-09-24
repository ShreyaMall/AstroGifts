import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ordersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProfileSidebar from '../components/layout/ProfileSidebar';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { getColorName } from '../utils/colorUtils';

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
  Delivered:             { background: '#22c55e', color: '#fff' },
  Processing:            { background: '#f59e0b', color: '#fff' },
  Pending:               { background: '#f59e0b', color: '#fff' },
  Shipped:               { background: '#3b82f6', color: '#fff' },
  Cancelled:             { background: '#ef4444', color: '#fff' },
  'Return Requested':    { background: '#f97316', color: '#fff' },
  'Return Approved':     { background: '#8b5cf6', color: '#fff' },
  'Return Rejected':     { background: '#dc2626', color: '#fff' },
  'Exchange Requested':  { background: '#0284c7', color: '#fff' },
  'Exchange Approved':   { background: '#6366f1', color: '#fff' },
  Refunded:              { background: '#10b981', color: '#fff' },
};

const resolveItemImage = (item) => {
  const img = item?.image || item?.product_image;
  if (!img) return '/chair1.jpg';
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
    return img;
  }
  return img.startsWith('/') ? img : `/${img}`;
};

const formatOrderDate = (dateStr) => {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

export default function MyOrdersPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Return & Exchange Modal State
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnForm, setReturnForm] = useState({
    return_type: 'Return',
    reason: 'Defective / Damaged piece',
    notes: '',
    bank_details: '',
  });
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState('');

  const handleOpenReturnModal = (ord) => {
    setReturnOrder(ord);
    setReturnForm({
      return_type: 'Return',
      reason: 'Defective / Damaged piece',
      notes: '',
      bank_details: '',
    });
    setReturnSuccessMsg('');
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnOrder) return;
    setSubmittingReturn(true);
    try {
      await ordersApi.requestReturn(returnOrder.order_number, returnForm);
      setReturnSuccessMsg(`Your ${returnForm.return_type} request has been submitted successfully! Our team will review and schedule pickup.`);
      const updatedStatus = returnForm.return_type === 'Exchange' ? 'Exchange Requested' : 'Return Requested';
      setOrders(prev => prev.map(o => o.order_number === returnOrder.order_number ? { ...o, status: updatedStatus } : o));
      setTimeout(() => {
        setReturnOrder(null);
        setReturnSuccessMsg('');
      }, 2500);
    } catch (err) {
      alert(err.message || 'Failed to submit return request.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 1. Get locally cached orders
    const saved = localStorage.getItem('astrogifts_user_orders');
    let localOrders = [];
    try {
      localOrders = saved ? JSON.parse(saved) : [];
    } catch (e) {
      localOrders = [];
    }

    // Immediately render local orders while syncing
    if (localOrders.length > 0) {
      setOrders(localOrders);
    }

    const localOrderNumbers = localOrders
      .map(o => o.order_number || o.id)
      .filter(Boolean);

    const fetchParams = {};
    if (user?.email) {
        fetchParams.email = user.email;
    } else if (localOrders.length > 0 && localOrders[0].email) {
        fetchParams.email = localOrders[0].email;
    }
    
    if (localOrderNumbers.length > 0) fetchParams.order_numbers = localOrderNumbers;

    ordersApi.getUserOrders(fetchParams)
      .then(res => {
        const apiOrders = res?.data || res?.orders || (Array.isArray(res) ? res : []);
        
        if (apiOrders.length > 0) {
          const apiMap = new Map();
          apiOrders.forEach(o => {
            if (o.order_number) apiMap.set(o.order_number, o);
            if (o.id) apiMap.set(o.id, o);
          });

          // Update existing local orders with fresh status & items from database
          const updatedLocal = localOrders.map(loc => {
            const num = loc.order_number || loc.id;
            const fresh = apiMap.get(num);
            if (fresh) {
              const freshItems = (fresh.items && fresh.items.length) ? fresh.items : (loc.items || []);
              const mergedItems = freshItems.map(item => {
                const locItem = (loc.items || []).find(li => (li.name || li.product_name) === (item.name || item.product_name));
                const img = item.product_image || item.image || locItem?.image || locItem?.product_image;
                return {
                  ...locItem,
                  ...item,
                  name: item.product_name || item.name || locItem?.name,
                  image: img,
                  product_image: img,
                  qty: item.quantity || item.qty || locItem?.qty || locItem?.quantity || 1,
                  price: item.price ?? locItem?.price ?? 0,
                };
              });

              return {
                ...loc,
                ...fresh,
                created_at: fresh.created_at || loc.created_at,
                status: fresh.status || loc.status,
                items: mergedItems,
              };
            }
            return loc;
          });

          // Add any new orders returned by API that weren't in localOrders
          const merged = [...updatedLocal];
          apiOrders.forEach(o => {
            const num = o.order_number || o.id;
            if (!merged.some(m => (m.order_number || m.id) === num)) {
              const normItems = (o.items || []).map(item => ({
                ...item,
                name: item.product_name || item.name,
                image: item.product_image || item.image,
                product_image: item.product_image || item.image,
                qty: item.quantity || item.qty || 1,
                price: item.price ?? 0,
              }));
              merged.push({
                ...o,
                items: normItems,
              });
            }
          });

          // Save the fresh data back to localStorage
          try {
            localStorage.setItem('astrogifts_user_orders', JSON.stringify(merged));
          } catch (e) {
            console.warn('Failed to update localStorage', e);
          }

          setOrders(merged);
        } else if (localOrders.length > 0) {
          // Fallback: track individual local orders if getUserOrders returned empty
          Promise.allSettled(
            localOrderNumbers.map(num => ordersApi.track(num).catch(() => null))
          ).then(results => {
            let hasUpdate = false;
            const updated = localOrders.map(loc => {
              const num = loc.order_number || loc.id;
              const match = results.find(r => r.status === 'fulfilled' && (r.value?.data?.order_number === num || r.value?.order?.order_number === num));
              const freshData = match?.value?.data || match?.value?.order;
              if (freshData) {
                hasUpdate = true;
                const freshItems = (freshData.items && freshData.items.length) ? freshData.items : (loc.items || []);
                const mergedItems = freshItems.map(item => {
                  const locItem = (loc.items || []).find(li => (li.name || li.product_name) === (item.name || item.product_name));
                  const img = item.product_image || item.image || locItem?.image || locItem?.product_image;
                  return {
                    ...locItem,
                    ...item,
                    name: item.product_name || item.name || locItem?.name,
                    image: img,
                    product_image: img,
                    qty: item.quantity || item.qty || locItem?.qty || locItem?.quantity || 1,
                    price: item.price ?? locItem?.price ?? 0,
                  };
                });
                return {
                  ...loc,
                  ...freshData,
                  created_at: freshData.created_at || loc.created_at,
                  status: freshData.status || loc.status,
                  items: mergedItems,
                };
              }
              return loc;
            });
            if (hasUpdate) {
              localStorage.setItem('astrogifts_user_orders', JSON.stringify(updated));
              setOrders(updated);
            }
          });
        } else {
          setOrders([]);
        }
      })
      .catch(() => {
        // If network error on getUserOrders, track local orders directly
        if (localOrderNumbers.length > 0) {
          Promise.allSettled(
            localOrderNumbers.map(num => ordersApi.track(num).catch(() => null))
          ).then(results => {
            let hasUpdate = false;
            const updated = localOrders.map(loc => {
              const num = loc.order_number || loc.id;
              const match = results.find(r => r.status === 'fulfilled' && (r.value?.data?.order_number === num || r.value?.order?.order_number === num));
              const freshData = match?.value?.data || match?.value?.order;
              if (freshData) {
                hasUpdate = true;
                const freshItems = (freshData.items && freshData.items.length) ? freshData.items : (loc.items || []);
                const mergedItems = freshItems.map(item => {
                  const locItem = (loc.items || []).find(li => (li.name || li.product_name) === (item.name || item.product_name));
                  const img = item.product_image || item.image || locItem?.image || locItem?.product_image;
                  return {
                    ...locItem,
                    ...item,
                    name: item.product_name || item.name || locItem?.name,
                    image: img,
                    product_image: img,
                    qty: item.quantity || item.qty || locItem?.qty || locItem?.quantity || 1,
                    price: item.price ?? locItem?.price ?? 0,
                  };
                });
                return {
                  ...loc,
                  ...freshData,
                  created_at: freshData.created_at || loc.created_at,
                  status: freshData.status || loc.status,
                  items: mergedItems,
                };
              }
              return loc;
            });
            if (hasUpdate) {
              localStorage.setItem('astrogifts_user_orders', JSON.stringify(updated));
              setOrders(updated);
            } else {
              setOrders(localOrders);
            }
          });
        } else {
          setOrders([]);
        }
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  const handleLogout = () => { logout(); navigate('/'); };

  const NAV = [
    { label: 'User Info', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, to: '/profile' },
    { label: 'Wishlist',  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, to: '/wishlist' },
    { label: 'Orders',    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>, to: '/my-orders', active: true },
    { label: 'Address',   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, to: '/address' },
  ];

  return (
    <>
      <style>{`
        .profile-layout-container {
          max-width: 1120px; margin: 0 auto; padding: 40px 20px 80px; display: flex; gap: 28px; align-items: flex-start;
        }
        .profile-sidebar { width: 200px; flex-shrink: 0; background: #fff; border-radius: 12px; box-shadow: 0 1px 8px rgba(0,0,0,0.07); padding: 24px 0; position: sticky; top: 100px; }
        .profile-main { flex: 1; min-width: 0; } /* min-width: 0 prevents flex child from overflowing */
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
          <ProfileSidebar activeTab="orders" />

          {/* ── Main Content ── */}
          <div className="profile-main">
            <div style={{ textAlign: 'center', margin: '0 0 28px' }}>
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
                              <div style={{ fontWeight: '600', fontSize: '14px', color: '#111', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                {ord.customer_name}
                              </div>
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Date</div>
                            <div style={{ fontSize: '13px', color: '#555' }}>{formatOrderDate(ord.created_at)}</div>
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
                            src={resolveItemImage(item)}
                            alt={item.name || item.product_name}
                            style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee', flexShrink: 0 }}
                            onError={e => { e.target.src = '/chair1.jpg'; }}
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
                              {(item.color || item.selected_color) && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '2px 10px', background: '#f3f4f6', borderRadius: '4px', fontSize: '12px', color: '#555' }}>
                                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color || item.selected_color, border: '1px solid #ccc', display: 'inline-block', flexShrink: 0 }} />
                                  Color: {getColorName(item.color || item.selected_color)}
                                </span>
                              )}
                              <span style={{ padding: '2px 10px', background: '#f3f4f6', borderRadius: '4px', fontSize: '12px', color: '#555' }}>
                                Qty: {item.qty || item.quantity || 1}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Quality checked product
                            </div>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px', background: '#fafafa', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {ord.status === 'Delivered' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 600 }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              Delivered
                            </span>
                          ) : ord.status === 'Shipped' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 600 }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                              Your order is on the way
                            </span>
                          ) : ord.status === 'Return Requested' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ea580c', fontWeight: 600 }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              Return Under Review
                            </span>
                          ) : ord.status === 'Return Approved' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 600 }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                              Return Approved (Pickup soon)
                            </span>
                          ) : ord.status === 'Exchange Requested' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ea580c', fontWeight: 600 }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              Exchange Under Review
                            </span>
                          ) : ord.status === 'Exchange Approved' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4338ca', fontWeight: 600 }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                              Exchange Approved
                            </span>
                          ) : ord.status === 'Refunded' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0d9488', fontWeight: 600 }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
                              Refunded
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1a1a1a', fontWeight: 600 }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d96b27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                              Delivery by {(() => {
                                const d = ord.created_at ? new Date(ord.created_at) : new Date();
                                d.setDate(d.getDate() + 4);
                                return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
                              })()}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          {/* Show Return/Exchange button only if Delivered */}
                          {ord.status === 'Delivered' && (
                            <button
                              onClick={() => handleOpenReturnModal(ord)}
                              style={{
                                padding: '7px 14px',
                                background: '#fff',
                                border: '1px solid #ea580c',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                fontWeight: '600',
                                color: '#ea580c',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#fff7ed'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                              Request Return / Exchange
                            </button>
                          )}

                          <button
                            style={{ padding: '7px 16px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor='#d96b27'; e.currentTarget.style.color='#d96b27'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor='#ddd'; e.currentTarget.style.color='#333'; }}
                            onClick={() => generateInvoicePDF(ord)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Invoice
                          </button>
                          
                          <button
                            style={{ padding: '7px 16px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#333', cursor: 'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor='#d96b27'; e.currentTarget.style.color='#d96b27'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor='#ddd'; e.currentTarget.style.color='#333'; }}
                            onClick={() => setSelectedOrder(ord)}
                          >
                            View Details →
                          </button>
                        </div>
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 100000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: '600px',
            borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#111' }}>Order #{selectedOrder.order_number || selectedOrder.id}</h3>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Placed on {selectedOrder.created_at || 'Recently'}</div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '24px', color: '#999', cursor: 'pointer', padding: '0 8px' }}
              >×</button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }} className="order-modal-body">
              <div className="order-details-grid" style={{ marginBottom: '24px' }}>
                <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>Shipping Address</h4>
                  <div style={{ fontSize: '14px', color: '#555', lineHeight: '1.5' }}>
                    {(selectedOrder.shipping_address || selectedOrder.city || selectedOrder.customer_name) ? (
                      <>
                        <strong>{selectedOrder.customer_name || 'Customer'}</strong><br/>
                        {selectedOrder.shipping_address && <>{selectedOrder.shipping_address}<br/></>}
                        {selectedOrder.city && <>{selectedOrder.city}, </>}{selectedOrder.state} {selectedOrder.zip}<br/>
                        {selectedOrder.phone && <>Phone: {selectedOrder.phone}</>}
                      </>
                    ) : 'Not provided'}
                  </div>
                </div>
                <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>Payment Details</h4>
                  <div style={{ fontSize: '14px', color: '#555', lineHeight: '1.5' }}>
                    Method: <strong>{selectedOrder.payment_method || 'N/A'}</strong><br/>
                    Status: <strong style={{ color: selectedOrder.payment_status === 'Paid' ? '#22c55e' : '#d96b27' }}>{selectedOrder.payment_status || 'Pending'}</strong><br/>
                    {selectedOrder.payment_id && <>Transaction ID: {selectedOrder.payment_id}</>}
                  </div>
                </div>
              </div>

              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111' }}>Items Summary</h4>
              <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
                {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', alignItems: 'center', padding: '16px', 
                    borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #eee' : 'none'
                  }}>
                    <img src={resolveItemImage(item)} alt={item.name || item.product_name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} onError={e=>e.target.src='/chair1.jpg'} />
                    <div style={{ flex: 1, marginLeft: '16px' }}>
                      <div style={{ fontWeight: '600', color: '#222', fontSize: '14px' }}>{item.name || item.product_name}</div>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                        Qty: {item.qty || item.quantity || 1} 
                        {item.size && ` | Size: ${item.size}`}
                        {(item.color || item.selected_color) && ` | Color: ${getColorName(item.color || item.selected_color)}`}
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', color: '#111' }}>
                      ₹{Number((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px', background: '#fef5f0', padding: '20px', borderRadius: '12px', border: '1px solid #fde4d5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
                  <span>Subtotal</span>
                  <span>₹{Number(selectedOrder.subtotal || selectedOrder.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || item.quantity || 1)), 0) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
                  <span>Shipping</span>
                  <span style={{ color: '#22c55e' }}>Free</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#d96b27', fontSize: '14px' }}>
                    <span>Discount</span>
                    <span>-₹{Number(selectedOrder.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #fde4d5', color: '#111', fontSize: '18px', fontWeight: '700' }}>
                  <span>Total</span>
                  <span style={{ color: '#d96b27' }}>₹{Number(selectedOrder.total || (selectedOrder.subtotal || selectedOrder.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || item.quantity || 1)), 0) || 0) - (selectedOrder.discount || 0)).toLocaleString('en-IN')}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      {/* Return / Exchange Modal */}
      {returnOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: '520px',
            borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111' }}>
                  Request Return / Exchange
                </h3>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>Order #{returnOrder.order_number}</div>
              </div>
              <button
                onClick={() => setReturnOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '24px', color: '#888', cursor: 'pointer', padding: '0 6px' }}
              >×</button>
            </div>

            {/* Form */}
            {returnSuccessMsg ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#16a34a' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: '18px', color: '#16a34a' }}>Request Submitted!</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: 1.5 }}>{returnSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Choose Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    What would you like to do? *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setReturnForm(f => ({ ...f, return_type: 'Return' }))}
                      style={{
                        padding: '12px', borderRadius: '8px', border: returnForm.return_type === 'Return' ? '2px solid #ea580c' : '1px solid #d1d5db',
                        background: returnForm.return_type === 'Return' ? '#fff7ed' : '#fff',
                        cursor: 'pointer', textAlign: 'center', fontWeight: '600', fontSize: '13.5px',
                        color: returnForm.return_type === 'Return' ? '#c2410c' : '#4b5563',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
                      Return & Refund
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnForm(f => ({ ...f, return_type: 'Exchange' }))}
                      style={{
                        padding: '12px', borderRadius: '8px', border: returnForm.return_type === 'Exchange' ? '2px solid #2563eb' : '1px solid #d1d5db',
                        background: returnForm.return_type === 'Exchange' ? '#eff6ff' : '#fff',
                        cursor: 'pointer', textAlign: 'center', fontWeight: '600', fontSize: '13.5px',
                        color: returnForm.return_type === 'Exchange' ? '#1d4ed8' : '#4b5563',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                      Exchange (Replacement)
                    </button>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Reason for {returnForm.return_type} *
                  </label>
                  <select
                    value={returnForm.reason}
                    onChange={e => setReturnForm(f => ({ ...f, reason: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13.5px', outline: 'none' }}
                  >
                    <option value="Defective / Damaged piece">Defective / Damaged piece</option>
                    <option value="Wrong product received">Wrong product received</option>
                    <option value="Size / Dimension mismatch">Size / Dimension mismatch</option>
                    <option value="Quality not as expected">Quality not as expected</option>
                    <option value="Other">Other Reason</option>
                  </select>
                </div>

                {/* Optional Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Describe the issue (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Scratch on top surface, or want medium size instead"
                    value={returnForm.notes}
                    onChange={e => setReturnForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Bank/UPI for COD orders */}
                {returnForm.return_type === 'Return' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      UPI ID or Bank Details for Refund
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. yourname@okhdfcbank or Bank A/C info"
                      value={returnForm.bank_details}
                      onChange={e => setReturnForm(f => ({ ...f, bank_details: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <span style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '3px', display: 'block' }}>
                      Refund will be credited within 24-48 hours of item pickup.
                    </span>
                  </div>
                )}

                {/* Submit button */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setReturnOrder(null)}
                    style={{ flex: 1, padding: '11px', background: '#f3f4f6', border: 'none', borderRadius: '8px', fontWeight: '600', color: '#4b5563', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReturn}
                    style={{ flex: 1.5, padding: '11px', background: '#ea580c', border: 'none', borderRadius: '8px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}
                  >
                    {submittingReturn ? 'Submitting…' : `Submit ${returnForm.return_type} Request`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        .order-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 600px) {
          .order-details-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .order-modal-body {
            padding: 16px !important;
          }
        }
      `}</style>
    </>
  );
}
