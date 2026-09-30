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
      { name: 'Luxury Birthday Gift Hamper', qty: 2, price: 540, size: 'Deluxe', image: '/article_gifting.png' },
      { name: 'Rose Quartz Healing Crystal Set', qty: 1, price: 1810, size: 'Premium', image: '/article_astrology.png' }
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

function OrderTrackStepper({ order }) {
  const status = (order.status || 'Order Placed').toLowerCase();

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '30 Sept';

  let activeStep = 0;
  if (status.includes('deliver')) {
    activeStep = 3;
  } else if (status.includes('ship') || status.includes('dispatch') || status.includes('transit') || status.includes('out for delivery')) {
    activeStep = 2;
  } else if (status.includes('process') || status.includes('confirm') || status.includes('pack')) {
    activeStep = 1;
  } else {
    activeStep = 0;
  }

  const isCancelled = status.includes('cancel');
  const isReturn = status.includes('return') || status.includes('refund');

  const steps = [
    {
      title: 'Order Placed',
      subtext: 'We have received your order',
      date: formattedDate,
    },
    {
      title: 'Processing & Quality Check',
      subtext: 'Item packed and quality verified',
      date: activeStep >= 1 ? 'Completed' : 'Pending',
    },
    {
      title: 'Arriving / Shipped',
      subtext: 'On the way with courier partner',
      date: activeStep >= 2 ? 'In Transit' : 'Pending',
    },
    {
      title: 'Delivered',
      subtext: 'Package delivered to address',
      date: activeStep >= 3 ? 'Delivered' : 'Expected',
    },
  ];

  return (
    <div style={{
      background: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '16px 20px',
      margin: '14px 22px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3a1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Track Item</span>
        </div>
        <span style={{
          fontSize: '10px',
          fontWeight: '800',
          letterSpacing: '0.8px',
          background: isCancelled ? '#ef4444' : isReturn ? '#ea580c' : activeStep === 3 ? '#16a34a' : '#475569',
          color: '#ffffff',
          padding: '3px 9px',
          borderRadius: '4px',
          textTransform: 'uppercase'
        }}>
          {isCancelled ? 'CANCELLED' : isReturn ? 'RETURN/REFUND' : activeStep === 3 ? 'DELIVERED' : 'LIVE'}
        </span>
      </div>

      {isCancelled ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>This order has been cancelled. If payment was processed, the amount will be refunded within 2-4 business days.</span>
        </div>
      ) : isReturn ? (
        <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          <span>Return/Exchange in progress for this order. Status: <strong>{order.status}</strong></span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {steps.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isCurrent = idx === activeStep;
            const isPending = idx > activeStep;

            return (
              <div key={idx} style={{ display: 'flex', gap: '14px', position: 'relative', minHeight: '48px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '18px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: isCompleted || isCurrent ? '2px solid #16a34a' : '2px solid #cbd5e1',
                    background: isCompleted || isCurrent ? '#16a34a' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.2)' : 'none'
                  }}>
                    {isCompleted ? (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : isCurrent ? (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />
                    ) : (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
                    )}
                  </div>
                  {idx < steps.length - 1 && (
                    <div style={{
                      width: '2px',
                      flex: 1,
                      background: idx < activeStep ? '#16a34a' : '#cbd5e1',
                      marginTop: '2px',
                      marginBottom: '2px'
                    }} />
                  )}
                </div>

                <div style={{ flex: 1, paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '13.5px',
                      fontWeight: '700',
                      color: isCompleted || isCurrent ? '#0f172a' : '#64748b'
                    }}>
                      {step.title}
                    </span>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: '600',
                      color: isCompleted || isCurrent ? '#475569' : '#94a3b8'
                    }}>
                      {step.date}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: isCompleted || isCurrent ? '#64748b' : '#94a3b8',
                    marginTop: '2px'
                  }}>
                    {step.subtext}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const resolveItemImage = (item) => {
  const img = item?.image || item?.product_image;
  if (!img) return '/gift image.jpg';
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

  // Item-Level Cancel Modal State
  const [cancelTarget, setCancelTarget] = useState(null); // { order, itemIndex, item }
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [cancelNotes, setCancelNotes] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  const handleOpenCancelModal = (order, itemIndex, item) => {
    setCancelTarget({ order, itemIndex, item });
    setCancelReason('Ordered by mistake');
    setCancelNotes('');
    setCancelSuccessMsg('');
  };

  const handleConfirmCancelItem = async (e) => {
    e.preventDefault();
    if (!cancelTarget) return;
    const { order, itemIndex } = cancelTarget;
    setSubmittingCancel(true);
    try {
      const res = await ordersApi.cancelItem(order.order_number || order.id, {
        item_index: itemIndex,
        reason: cancelReason + (cancelNotes ? `: ${cancelNotes}` : ''),
      });
      const updatedOrder = res?.data || res?.order;
      if (updatedOrder) {
        setOrders(prev => {
          const next = prev.map(o => (o.order_number === order.order_number || o.id === order.id) ? updatedOrder : o);
          try { localStorage.setItem('astrogifts_user_orders', JSON.stringify(next)); } catch (e) {}
          return next;
        });
      } else {
        setOrders(prev => {
          const next = prev.map(o => {
            if (o.order_number === order.order_number || o.id === order.id) {
              const updatedItems = [...(o.items || [])];
              if (updatedItems[itemIndex]) {
                updatedItems[itemIndex] = { ...updatedItems[itemIndex], status: 'Cancelled' };
              }
              const activeItems = updatedItems.filter(it => (it.status || 'Pending') !== 'Cancelled');
              return {
                ...o,
                items: updatedItems,
                status: activeItems.length === 0 ? 'Cancelled' : 'Partially Cancelled',
              };
            }
            return o;
          });
          try { localStorage.setItem('astrogifts_user_orders', JSON.stringify(next)); } catch (e) {}
          return next;
        });
      }
      setCancelSuccessMsg('Item has been cancelled successfully!');
      setTimeout(() => {
        setCancelTarget(null);
        setCancelSuccessMsg('');
      }, 1800);
    } catch (err) {
      alert(err.message || 'Failed to cancel item.');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleCancelFullOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${order.order_number}?`)) return;
    try {
      const res = await ordersApi.cancelOrder(order.order_number || order.id, { reason: 'Cancelled by customer' });
      const updatedOrder = res?.data || res?.order;
      setOrders(prev => {
        const next = prev.map(o => (o.order_number === order.order_number || o.id === order.id) ? (updatedOrder || { ...o, status: 'Cancelled' }) : o);
        try { localStorage.setItem('astrogifts_user_orders', JSON.stringify(next)); } catch (e) {}
        return next;
      });
      alert('Order cancelled successfully.');
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
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
              const normItems = (fresh.items && fresh.items.length > 0)
                ? fresh.items.map((item, idx) => {
                    const locItem = loc.items?.[idx] || (loc.items || []).find(li => (li.name && item.name && li.name === item.name) || (li.product_name && item.product_name && li.product_name === item.product_name));
                    const itemName = item.product_name || item.name || item.title || locItem?.name || locItem?.product_name || 'Product';
                    const img = item.product_image || item.image || locItem?.image || locItem?.product_image;
                    return {
                      ...locItem,
                      ...item,
                      name: itemName,
                      product_name: itemName,
                      image: img,
                      product_image: img,
                      qty: item.quantity || item.qty || locItem?.qty || locItem?.quantity || 1,
                      quantity: item.quantity || item.qty || locItem?.qty || locItem?.quantity || 1,
                      price: item.price ?? locItem?.price ?? 0,
                      color: item.selected_color || item.color || locItem?.color || locItem?.selected_color || null,
                      selected_color: item.selected_color || item.color || locItem?.color || locItem?.selected_color || null,
                      size: item.size || locItem?.size || null,
                    };
                  })
                : (loc.items || []);

              return {
                ...loc,
                ...fresh,
                created_at: fresh.created_at || loc.created_at,
                status: fresh.status || loc.status,
                items: normItems,
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
                const mergedItems = freshItems.map((item, idx) => {
                  const locItem = loc.items?.[idx] || (loc.items || []).find(li => (li.name && item.name && li.name === item.name) || (li.product_name && item.product_name && li.product_name === item.product_name));
                  const itemName = item.product_name || item.name || item.title || locItem?.name || locItem?.product_name || 'Product';
                  const img = item.product_image || item.image || locItem?.image || locItem?.product_image;
                  return {
                    ...locItem,
                    ...item,
                    name: itemName,
                    product_name: itemName,
                    image: img,
                    product_image: img,
                    qty: item.quantity || item.qty || locItem?.qty || locItem?.quantity || 1,
                    quantity: item.quantity || item.qty || locItem?.qty || locItem?.quantity || 1,
                    price: item.price ?? locItem?.price ?? 0,
                    color: item.selected_color || item.color || locItem?.color || locItem?.selected_color || null,
                    selected_color: item.selected_color || item.color || locItem?.color || locItem?.selected_color || null,
                    size: item.size || locItem?.size || null,
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
                const mergedItems = freshItems.map((item, idx) => {
                  const locItem = loc.items?.[idx] || (loc.items || []).find(li => (li.name && item.name && li.name === item.name) || (li.product_name && item.product_name && li.product_name === item.product_name));
                  const itemName = item.product_name || item.name || item.title || locItem?.name || locItem?.product_name || 'Product';
                  const img = item.product_image || item.image || locItem?.image || locItem?.product_image;
                  return {
                    ...locItem,
                    ...item,
                    name: itemName,
                    product_name: itemName,
                    image: img,
                    product_image: img,
                    qty: item.quantity || item.qty || locItem?.qty || locItem?.quantity || 1,
                    quantity: item.quantity || item.qty || locItem?.qty || locItem?.quantity || 1,
                    price: item.price ?? locItem?.price ?? 0,
                    color: item.selected_color || item.color || locItem?.color || locItem?.selected_color || null,
                    selected_color: item.selected_color || item.color || locItem?.color || locItem?.selected_color || null,
                    size: item.size || locItem?.size || null,
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
                <Link to="/category/gifts" style={{ padding: '10px 24px', background: '#7c3a1d', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                  Browse Products
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

                      {/* Dynamic Track Item Stepper */}
                      <OrderTrackStepper order={ord} />

                      {/* Items */}
                      {ord.items && ord.items.map((item, idx) => {
                        const isItemCancelled = (item.status === 'Cancelled') || (ord.status === 'Cancelled');
                        const canCancelItem = !isItemCancelled && ['Pending', 'Processing', 'Partially Cancelled'].includes(ord.status || 'Processing');

                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 22px', borderBottom: '1px solid #f7f7f7', opacity: isItemCancelled ? 0.65 : 1, background: isItemCancelled ? '#fafafa' : '#fff' }}>
                            <img
                              src={resolveItemImage(item)}
                              alt={item.name || item.product_name}
                              style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee', flexShrink: 0, filter: isItemCancelled ? 'grayscale(80%)' : 'none' }}
                              onError={e => { e.target.src = '/gift image.jpg'; }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600', fontSize: '15px', color: '#111', marginBottom: '6px', textDecoration: isItemCancelled ? 'line-through' : 'none' }}>
                                {item.name || item.product_name}
                              </div>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px', alignItems: 'center' }}>
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
                                {isItemCancelled && (
                                  <span style={{ padding: '2px 10px', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
                                    Cancelled
                                  </span>
                                )}
                              </div>
                              {!isItemCancelled ? (
                                <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Quality checked product
                                </div>
                              ) : (
                                <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
                                  Item cancelled (Stock restored)
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                              <div>
                                <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>Total Amount</div>
                                <div style={{ fontWeight: '700', fontSize: '18px', color: isItemCancelled ? '#999' : '#111', textDecoration: isItemCancelled ? 'line-through' : 'none' }}>
                                  ₹{Number((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString('en-IN')}
                                </div>
                                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                                  ₹{Number(item.price || 0).toLocaleString('en-IN')} × {item.qty || item.quantity || 1}
                                </div>
                              </div>

                              {canCancelItem && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCancelModal(ord, idx, item)}
                                  style={{
                                    padding: '5px 12px',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.15s'
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; }}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                  Cancel Item
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

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
                    <img src={resolveItemImage(item)} alt={item.name || item.product_name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} onError={e=>e.target.src='/gift image.jpg'} />
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

      {/* Item Cancellation Modal (Amazon / Myntra Style) */}
      {cancelTarget && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: '480px',
            borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  Cancel Item
                </h3>
                <div style={{ fontSize: '12.5px', color: '#7f1d1d', marginTop: '2px' }}>
                  Order #{cancelTarget.order?.order_number}
                </div>
              </div>
              <button
                onClick={() => setCancelTarget(null)}
                style={{ background: 'none', border: 'none', fontSize: '24px', color: '#999', cursor: 'pointer', padding: '0 4px' }}
              >×</button>
            </div>

            {/* Modal Body */}
            {cancelSuccessMsg ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#dc2626' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '18px', color: '#dc2626' }}>Cancelled!</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>{cancelSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmCancelItem} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Target Product Summary Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f9fafb', padding: '12px', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                  <img
                    src={resolveItemImage(cancelTarget.item)}
                    alt={cancelTarget.item?.name || cancelTarget.item?.product_name}
                    style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                    onError={e => { e.target.src = '/gift image.jpg'; }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
                      {cancelTarget.item?.name || cancelTarget.item?.product_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      Qty: {cancelTarget.item?.qty || cancelTarget.item?.quantity || 1} • Amount: ₹{Number((cancelTarget.item?.price || 0) * (cancelTarget.item?.qty || cancelTarget.item?.quantity || 1)).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Reason Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Reason for Cancellation *
                  </label>
                  <select
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13.5px', outline: 'none' }}
                  >
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Product price decreased">Product price decreased</option>
                    <option value="Expected delivery time is too long">Expected delivery time is too long</option>
                    <option value="Want to change shipping address">Want to change shipping address</option>
                    <option value="Want to change size/color">Want to change size/color</option>
                    <option value="Other reason">Other reason</option>
                  </select>
                </div>

                {/* Comments */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Additional Comments (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Will re-order with different address"
                    value={cancelNotes}
                    onChange={e => setCancelNotes(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Stock restore hint */}
                <div style={{ fontSize: '12px', color: '#6b7280', background: '#f3f4f6', padding: '10px 12px', borderRadius: '6px' }}>
                  💡 Item will be removed from active shipment. Refund/Price adjustment will be reflected automatically.
                </div>

                {/* Submit / Cancel buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setCancelTarget(null)}
                    style={{ flex: 1, padding: '11px', background: '#f3f4f6', border: 'none', borderRadius: '8px', fontWeight: '600', color: '#4b5563', cursor: 'pointer' }}
                  >
                    Keep Item
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCancel}
                    style={{ flex: 1.5, padding: '11px', background: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}
                  >
                    {submittingCancel ? 'Cancelling…' : 'Confirm Cancel Item'}
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
