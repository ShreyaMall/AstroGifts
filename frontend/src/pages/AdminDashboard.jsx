
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { adminApi, contactApi, faqApi, productsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';


/* ══════════════════════════════════════════════════
   MOCK DATA (Graceful fallback)
══════════════════════════════════════════════════ */
const STATS = [
  { label: 'Total Revenue',  value: '₹0', delta: '0%', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="M6 13l8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>, color: '#d96b27' },
  { label: 'Total Orders',   value: '0',   delta: '0%',  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>, color: '#2563eb' },
  { label: 'Total Products', value: '0',     delta: '0%',  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, color: '#16a34a' },
  { label: 'Total Users',    value: '0',   delta: '0%', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, color: '#7c3aed' },
];

const MOCK_ORDERS = [
  { id: '#ORD-1001', customer: 'Alice Johnson',  product: 'Luxury Birthday Gift Hamper',   amount: '₹2,890', status: 'Delivered', date: 'Jul 28, 2026' },
  { id: '#ORD-1002', customer: 'Bob Smith',       product: 'Plush Teddy Bear Set',        amount: '₹1,620', status: 'Processing',date: 'Jul 29, 2026' },
  { id: '#ORD-1003', customer: 'Carol Williams',  product: 'Zodiac Crystal Gemstone Set', amount: '₹1,468', status: 'Shipped',   date: 'Jul 29, 2026' },
  { id: '#ORD-1004', customer: 'David Lee',       product: 'Handcrafted Ceramic Vase',    amount: '₹882',   status: 'Delivered', date: 'Jul 27, 2026' },
  { id: '#ORD-1005', customer: 'Eva Martinez',    product: 'Astrology Healing Quartz',    amount: '₹1,240', status: 'Pending',   date: 'Jul 30, 2026' },
];

const MOCK_MENU = [
  { id: 1, name: 'Gifts',     link: '/category/gifts',     order: 1, status: 'Active' },
  { id: 2, name: 'Toys',      link: '/category/toys',      order: 2, status: 'Active' },
  { id: 3, name: 'Astrology', link: '/category/astrology', order: 3, status: 'Active' },
  { id: 4, name: 'Flowers',   link: '/category/flowers',   order: 4, status: 'Active' },
  { id: 5, name: 'Decor',     link: '/category/decor',     order: 5, status: 'Active' },
  { id: 6, name: 'Jewelry',   link: '/category/jewelry',   order: 6, status: 'Active' },
];

const MOCK_POSTS = [
  { id: 1, title: '10 Perfect Birthday Gift Ideas for Loved Ones', category: 'Gifting Guide', status: 'Published', date: 'Jul 25, 2026' },
  { id: 2, title: 'How Zodiac Healing Crystals Work for Wellness', category: 'Astrology',     status: 'Published', date: 'Jul 22, 2026' },
  { id: 3, title: 'Top Educational Toys for Kids in 2026',        category: 'Toys & Games',   status: 'Draft',     date: 'Jul 30, 2026' },
  { id: 4, title: 'Choosing Fresh Flower Bouquets for Anniversaries', category: 'Flowers',    status: 'Published', date: 'Jul 18, 2026' },
  { id: 5, title: 'Spiritual Home Decor Trends for Harmony',      category: 'Home Decor',    status: 'Draft',     date: 'Jul 29, 2026' },
];

const DEFAULT_COLORS = [
  { id: '1',  name: 'White',       hex: '#ffffff', status: 'Active' },
  { id: '2',  name: 'Black',       hex: '#1a1a1a', status: 'Active' },
  { id: '3',  name: 'Blue',        hex: '#0066cc', status: 'Active' },
  { id: '4',  name: 'Red',         hex: '#d93838', status: 'Active' },
  { id: '5',  name: 'Gold',        hex: '#d4af37', status: 'Active' },
  { id: '6',  name: 'Multi',       hex: '#e74c3c', status: 'Active' },
  { id: '7',  name: 'Brown',       hex: '#6e3b1c', status: 'Active' },
  { id: '8',  name: 'Pink',        hex: '#e87a90', status: 'Active' },
  { id: '9',  name: 'Silver',      hex: '#c0c0c0', status: 'Active' },
  { id: '10', name: 'Green',       hex: '#27ae60', status: 'Active' },
  { id: '11', name: 'Navy Blue',   hex: '#1b2a4a', status: 'Active' },
  { id: '12', name: 'Maroon',      hex: '#800020', status: 'Active' },
  { id: '13', name: 'Grey',        hex: '#95a5a6', status: 'Active' },
  { id: '14', name: 'Rose Gold',   hex: '#b76e79', status: 'Active' },
  { id: '15', name: 'Purple',     hex: '#800080', status: 'Active' },
  { id: '16', name: 'Yellow',     hex: '#f4d03f', status: 'Active' },
  { id: '17', name: 'Beige',      hex: '#f5f5dc', status: 'Active' },
  { id: '18', name: 'Orange',     hex: '#f07d26', status: 'Active' },
];

export const getStoredColors = () => {
  try {
    const raw = localStorage.getItem('astrogifts_admin_colors');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate if old color names exist
      if (Array.isArray(parsed) && parsed.some(c => c.name === 'Celestial Blue')) {
        localStorage.setItem('astrogifts_admin_colors', JSON.stringify(DEFAULT_COLORS));
        return DEFAULT_COLORS;
      }
      return parsed;
    }
  } catch (e) {}
  return DEFAULT_COLORS;
};

export const saveStoredColors = (colors) => {
  try {
    localStorage.setItem('astrogifts_admin_colors', JSON.stringify(colors));
  } catch (e) {}
};

const DEFAULT_SIZES = [
  { id: '1', name: 'Small (S)',           code: 'S',     dimensions: 'Compact Gift Box (15x10x8 cm)', status: 'Active' },
  { id: '2', name: 'Medium (M)',          code: 'M',     dimensions: 'Standard Deluxe (25x18x12 cm)', status: 'Active' },
  { id: '3', name: 'Large (L)',           code: 'L',     dimensions: 'Premium Hamper (35x25x15 cm)', status: 'Active' },
  { id: '4', name: 'Extra Large (XL)',    code: 'XL',    dimensions: 'Grand Royal Hamper Box',       status: 'Active' },
  { id: '5', name: 'Single Pack',         code: '1PK',   dimensions: '1 Piece Standard Pack',         status: 'Active' },
  { id: '6', name: 'Combo Pack (Set of 2)',code: '2PK',  dimensions: '2 Pieces Gift Set',            status: 'Active' },
  { id: '7', name: 'Family Pack (Set of 4)',code: '4PK', dimensions: '4 Pieces Family Pack',         status: 'Active' },
];

export const getStoredSizes = () => {
  try {
    const raw = localStorage.getItem('astrogifts_admin_sizes');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_SIZES;
};

export const saveStoredSizes = (sizes) => {
  try {
    localStorage.setItem('astrogifts_admin_sizes', JSON.stringify(sizes));
  } catch (e) {}
};

const MOCK_SLIDERS = [
  { id: 1, title: 'Exclusive Astro Gift Hampers', subtitle: 'by AstroGifts Collection', cta: 'Shop Now', price: '₹1,499', bg: 'wd-furniture-slider-111.jpg.webp', status: 'Active' },
  { id: 2, title: 'Zodiac & Gemstone Crystals',    subtitle: 'by AstroGifts Studio',     cta: 'Shop Now', price: '₹899',  bg: 'wd-furniture-slider-112.jpg.webp', status: 'Active' },
  { id: 3, title: 'Handcrafted Toys & Plushies',  subtitle: 'by AstroGifts Kids',       cta: 'Shop Now', price: '₹599',  bg: 'wd-furniture-slider-113.jpg.webp', status: 'Active' },
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Gifts',     slug: 'gifts',     count: 48, status: 'Active' },
  { id: 2, name: 'Toys',      slug: 'toys',      count: 32, status: 'Active' },
  { id: 3, name: 'Astrology', slug: 'astrology', count: 27, status: 'Active' },
  { id: 4, name: 'Flowers',   slug: 'flowers',   count: 19, status: 'Active' },
  { id: 5, name: 'Decor',     slug: 'decor',     count: 41, status: 'Active' },
];

const MOCK_SKUS = [
  { id: 1, name: 'Luxury Birthday Gift Hamper', sku: 'AG-GFT-001', stock: 24, warehouse: 'Delhi' },
  { id: 2, name: 'Zodiac Crystal Gemstone Set', sku: 'AG-AST-002', stock: 18, warehouse: 'Mumbai' },
  { id: 3, name: 'Soft Plush Teddy Bear',       sku: 'AG-TOY-003', stock: 32, warehouse: 'Delhi' },
  { id: 4, name: 'Fresh Red Roses Bouquet',    sku: 'AG-FLW-004', stock: 15, warehouse: 'Bangalore' },
  { id: 5, name: 'Handcrafted Brass Idol',     sku: 'AG-DCR-005', stock: 27, warehouse: 'Delhi' },
];

const MOCK_ALL_PRODUCTS = [
  { id: 1, name: 'Luxury Birthday Gift Hamper', category: 'Gifts', price: '₹1,499', stock: 24, status: 'Active' },
  { id: 2, name: 'Zodiac Crystal Gemstone Set', category: 'Astrology', price: '₹899', stock: 18, status: 'Active' },
  { id: 3, name: 'Soft Plush Teddy Bear', category: 'Toys', price: '₹599', stock: 32, status: 'Active' },
];

const MOCK_PRICES = [
  { id: 1, name: 'Luxury Birthday Gift Hamper', original: '₹1,999', sale: '₹1,499', discount: '25%', currency: 'INR' },
  { id: 2, name: 'Zodiac Crystal Gemstone Set', original: '₹1,200', sale: '₹899',   discount: '25%', currency: 'INR' },
  { id: 3, name: 'Soft Plush Teddy Bear',       original: '₹799',   sale: '₹599',   discount: '25%', currency: 'INR' },
  { id: 4, name: 'Fresh Red Roses Bouquet',    original: '₹699',   sale: '₹499',   discount: '28%', currency: 'INR' },
  { id: 5, name: 'Handcrafted Brass Idol',     original: '₹1,500', sale: '₹1,199', discount: '20%', currency: 'INR' },
];

const MOCK_DESCRIPTIONS = [
  { id: 1, name: 'Luxury Birthday Gift Hamper', short: 'Curated premium birthday gift box.', full: 'Includes premium scented candle, custom mug, chocolates, and personalized greeting card.' },
  { id: 2, name: 'Zodiac Crystal Gemstone Set', short: 'Natural healing crystals aligned with zodiac sign.', full: 'Contains 7 natural polished gemstone crystals tuned to bring positivity, peace, and good vibes.' },
  { id: 3, name: 'Soft Plush Teddy Bear',       short: 'Ultra soft 12-inch plush stuffed toy.', full: 'Made from high quality non-toxic fabric. Hypoallergenic and washable.' },
];

const STATUS_COLORS = {
  Delivered:  { bg: '#dcfce7', color: '#166534' },
  Shipped:    { bg: '#dbeafe', color: '#1e40af' },
  Processing: { bg: '#fef9c3', color: '#92400e' },
  Pending:    { bg: '#fee2e2', color: '#991b1b' },
  Published:  { bg: '#dcfce7', color: '#166534' },
  Draft:      { bg: '#f3f4f6', color: '#6b7280' },
  Active:     { bg: '#dcfce7', color: '#166534' },
  Inactive:   { bg: '#fee2e2', color: '#991b1b' },
};

/* ══════════════════════════════════════════════════
   SUB-COMPONENTS (each admin page)
══════════════════════════════════════════════════ */

/* ── DASHBOARD ── */
function PageDashboard({ setActivePage }) {
  const [stats, setStats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleViewOrder = (order) => setSelectedOrder(order);

  const fetchDashboardData = async () => {
    setLoading(true);
    let apiOrders = [];
    let apiStats = [];
    
    try {
      const res = await adminApi.getStats();
      if (res && res.data) {
        if (res.data.stats && res.data.stats.length > 0) apiStats = res.data.stats;
        if (res.data.recent_orders) apiOrders = res.data.recent_orders;
      }
    } catch (err) {
      console.warn('Using local stats fallback:', err.message);
    }

    // Merge API orders with LocalStorage orders (saved from customer checkouts)
    try {
      const saved = localStorage.getItem('astrogifts_user_orders');
      if (saved) {
        const localOrders = JSON.parse(saved);
        const allOrders = [...localOrders, ...apiOrders];
        const unique = [];
        const seen = new Set();
        for (const o of allOrders) {
          const id = o.order_number || o.id;
          if (id && !seen.has(id)) {
            seen.add(id);
            unique.push(o);
          }
        }
        apiOrders = unique;
      }
    } catch(e) {}

    let mappedOrders = [];
    if (apiOrders.length > 0) {
      mappedOrders = apiOrders.map(o => ({
        id: o.order_number || `#ORD-${o.id || o._id}`,
        numericId: o.id || o._id || o.order_number,
        raw: o,
        customer: o.customer_name || 'Guest',
        email: o.email || '',
        phone: o.phone || '',
        payment: o.payment_method || 'COD',
        product: o.items && o.items.length > 0 ? ((o.items[0].product_name || o.items[0].name || 'Astro Gift Item') + (o.items.length > 1 ? ` +${o.items.length - 1} more` : '')) : 'Astro Gift Box',
        amount: '₹' + Number(o.total || o.amount || 0).toLocaleString('en-IN'),
        status: o.status || 'Processing',
        created_at: o.created_at || null,
        date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (o.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
      }));
    } else {
      mappedOrders = [];
    }
    setOrders(mappedOrders);

    // Calculate dynamic stats matching actual orders
    const totalRev = mappedOrders.reduce((sum, o) => {
      const val = typeof o.raw?.total === 'number' ? o.raw.total : parseFloat(String(o.amount).replace(/[^0-9.]/g, '')) || 0;
      return sum + val;
    }, 0);

    let realProductsCount = '0';
    try {
      const prodRes = await productsApi.getAll({ per_page: 100 });
      const pList = prodRes?.data || (Array.isArray(prodRes) ? prodRes : []);
      if (pList.length > 0) {
        realProductsCount = String(pList.length);
      } else {
        const statVal = apiStats.find(a => a.label === 'Total Products')?.value;
        realProductsCount = statVal !== undefined ? String(statVal) : '0';
      }
    } catch (e) {
      const statVal = apiStats.find(a => a.label === 'Total Products')?.value;
      realProductsCount = statVal !== undefined ? String(statVal) : '0';
    }

    const usersCount = (apiStats.find(a => a.label === 'Total Users')?.value) || '2';

    setStats([
      { label: 'Total Revenue',  value: '₹' + totalRev.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), delta: totalRev > 0 ? '+12.4%' : '0%', icon: STATS[0].icon, color: '#d96b27' },
      { label: 'Total Orders',   value: String(mappedOrders.length), delta: mappedOrders.length > 0 ? '+8.1%' : '0%',  icon: STATS[1].icon, color: '#2563eb' },
      { label: 'Total Products', value: String(realProductsCount), delta: realProductsCount > 0 ? '+3.5%' : '0%', icon: STATS[2].icon, color: '#16a34a' },
      { label: 'Total Users',    value: String(usersCount), delta: '+21.3%', icon: STATS[3].icon, color: '#7c3aed' },
    ]);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const displayedOrders = useMemo(() => {
    let list = [...orders];
    if (dateFilter) {
      list = list.filter(o => {
        if (!o.created_at && !o.date) return false;
        const d = o.created_at ? new Date(o.created_at) : new Date(o.date);
        if (isNaN(d.getTime())) return false;
        const yyyyMmDd = d.toISOString().slice(0, 10);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const localDate = `${year}-${month}-${day}`;
        return localDate === dateFilter || yyyyMmDd === dateFilter;
      });
    }
    return list;
  }, [orders, dateFilter]);

  const handleStatusUpdate = async (orderId, numericId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const targetId = numericId || orderId;
    if (targetId) {
      try {
        await adminApi.updateOrderStatus(targetId, newStatus);
      } catch (err) {
        console.warn('Status update failed:', err.message);
      }
    }
  };

  return (
    <>
      <div className="admin__stats">
        {stats.map(s => (
          <div className="admin__stat-card" key={s.label} style={{ '--stat-color': s.color }}>
            <div className="admin__stat-icon-wrap"><span className="admin__stat-icon">{s.icon}</span></div>
            <div className="admin__stat-info">
              <span className="admin__stat-label">{s.label}</span>
              <span className="admin__stat-value">{s.value}</span>
            </div>
            <span className="admin__stat-delta">{s.delta}</span>
          </div>
        ))}
      </div>
      <div className="admin__orders-section">
        <div className="admin__section-header" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h2 className="admin__section-title">Recent Orders</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '5px 10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Filter Date:
              </span>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  color: '#1e293b',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  title="Clear date filter"
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '10px',
                    color: '#64748b'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <button className="admin__view-all" onClick={fetchDashboardData}>
              {loading ? 'Refreshing…' : 'Refresh Data ⟳'}
            </button>
          </div>
        </div>
        <OrdersTable data={displayedOrders} onStatusChange={handleStatusUpdate} onViewOrder={handleViewOrder} />
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="admin__modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin__detailed-form" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1000, position: 'relative' }}>
            <div className="admin__detailed-form-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Order Details ({selectedOrder.id})</h3>
              <button className="admin__form-close" onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Info</h4>
                <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: '500' }}>{selectedOrder.customer}</p>
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>{selectedOrder.email}</p>
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>{selectedOrder.phone}</p>
                {selectedOrder.raw?.shipping_address && (
                  <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                    <strong>Shipping Address:</strong><br/>
                    {selectedOrder.raw.shipping_address.street_address || selectedOrder.raw.shipping_address}<br/>
                    {selectedOrder.raw.shipping_address.city || selectedOrder.raw.city}, {selectedOrder.raw.shipping_address.state || selectedOrder.raw.state} {selectedOrder.raw.shipping_address.postal_code || selectedOrder.raw.zip}
                  </p>
                )}
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Info</h4>
                <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: '500' }}>Amount: <span style={{ color: '#000' }}>{selectedOrder.amount}</span></p>
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>Method: <span style={{ textTransform: 'uppercase' }}>{selectedOrder.payment}</span></p>
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>Status: <strong>{selectedOrder.status}</strong></p>
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>Date: {selectedOrder.date}</p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items</h4>
              {selectedOrder.raw?.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: i !== selectedOrder.raw.items.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                  {(item.image || item.product_image || item.image_url) && (
                    <img src={item.image || item.product_image || item.image_url} alt={item.product_name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{item.product_name}</p>
                    <div style={{ marginTop: '4px' }}>
                      {item.size && <span style={{ fontSize: '12px', color: '#64748b', marginRight: '10px' }}>Size: {item.size}</span>}
                      {item.color && <span style={{ fontSize: '12px', color: '#64748b' }}>Color: {item.color}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>x{item.quantity || 1}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '600' }}>₹{item.price}</p>
                  </div>
                </div>
              ))}
              {(!selectedOrder.raw?.items || selectedOrder.raw.items.length === 0) && (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{selectedOrder.product}</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedOrder(null)} style={{ padding: '8px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── MENU ── */
function PageMenu() {
  const [items, setItems]     = useState(MOCK_MENU);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ name: '', link: '', order: '' });

  const toggleStatus = (id) =>
    setItems(prev => prev.map(i => i.id === id
      ? { ...i, status: i.status === 'Active' ? 'Inactive' : 'Active' }
      : i
    ));

  const deleteItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const addItem = () => {
    if (!form.name || !form.link) return;
    setItems(prev => [...prev, { id: Date.now(), name: form.name, link: form.link, order: form.order || prev.length + 1, status: 'Active' }]);
    setForm({ name: '', link: '', order: '' });
    setShowAdd(false);
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">Menu Items</h2>
          <p className="admin__panel-sub">Manage your site navigation links</p>
        </div>
        <button className="admin__add-btn" onClick={() => setShowAdd(s => !s)} id="add-menu-btn">
          + Add Menu Item
        </button>
      </div>

      {showAdd && (
        <div className="admin__inline-form">
          <input className="admin__form-input" placeholder="Menu Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="admin__form-input" placeholder="Link URL (e.g. /chairs)" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
          <input className="admin__form-input admin__form-input--sm" placeholder="Order #" type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} />
          <button className="admin__form-save" onClick={addItem}>Save</button>
          <button className="admin__form-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      )}

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead><tr><th>#</th><th>Menu Name</th><th>Link</th><th>Order</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td><span className="admin__order-id">{item.id}</span></td>
                <td><strong>{item.name}</strong></td>
                <td><code className="admin__code">{item.link}</code></td>
                <td>{item.order}</td>
                <td>
                  <div className="admin__actions-cell">
                    <button className="admin__action-btn admin__action-btn--toggle" onClick={() => toggleStatus(item.id)} title="Toggle status"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3l4 4-4 4"/><path d="M3 7h18"/><path d="M7 21l-4-4 4-4"/><path d="M21 17H3"/></svg></button>
                    <button className="admin__action-btn admin__action-btn--delete" onClick={() => deleteItem(item.id)} title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── POST ── */
function PagePost() {
  const [activeSubTab, setActiveSubTab] = useState('posts');
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', status: 'Draft' });

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await adminApi.getComments();
      if (res && res.data) setComments(res.data);
    } catch (e) {
      console.error('Failed to fetch comments', e);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await adminApi.deleteComment(id);
      setComments(prev => prev.filter(c => (c._id !== id && c.id !== id)));
    } catch (e) {
      console.error('Failed to delete comment', e);
    }
  };

  const toggleStatus = (id) =>
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, status: p.status === 'Published' ? 'Draft' : 'Published' }
      : p
    ));

  const deletePost = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  const addPost = () => {
    if (!form.title) return;
    setPosts(prev => [...prev, { id: Date.now(), title: form.title, category: form.category || 'General', status: form.status, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }]);
    setForm({ title: '', category: '', status: 'Draft' });
    setShowAdd(false);
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">Posts & Comments</h2>
          <p className="admin__panel-sub">Manage blog posts, announcements and reader comments</p>
        </div>
        {activeSubTab === 'posts' && (
          <button className="admin__add-btn" onClick={() => setShowAdd(s => !s)} id="add-post-btn">+ Add Post</button>
        )}
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveSubTab('posts')}
          style={{
            padding: '8px 18px',
            border: 'none',
            background: activeSubTab === 'posts' ? '#d96b27' : '#f1f5f9',
            color: activeSubTab === 'posts' ? '#fff' : '#475569',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Articles / Posts ({posts.length})
        </button>
        <button
          onClick={() => { setActiveSubTab('comments'); fetchComments(); }}
          style={{
            padding: '8px 18px',
            border: 'none',
            background: activeSubTab === 'comments' ? '#d96b27' : '#f1f5f9',
            color: activeSubTab === 'comments' ? '#fff' : '#475569',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Reader Comments ({comments.length})
        </button>
      </div>

      {activeSubTab === 'comments' ? (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center' }}>#</th>
                <th style={{ width: '22%' }}>Author</th>
                <th style={{ width: '38%' }}>Comment</th>
                <th style={{ width: '20%' }}>Article / Post</th>
                <th style={{ width: '12%' }}>Date</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingComments ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#888' }}>Loading comments...</td></tr>
              ) : comments.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#888' }}>No reader comments found in database.</td></tr>
              ) : comments.map((c, idx) => (
                <tr key={c._id || c.id || idx}>
                  <td style={{ textAlign: 'center' }}><span className="admin__order-id">{idx + 1}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={c.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user_name || 'User')}&background=fbe2d0&color=d96b27`}
                        alt={c.user_name}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '13px', color: '#111' }}>{c.user_name || 'Guest'}</strong>
                        {c.user_email && <div style={{ fontSize: '11px', color: '#888' }}>{c.user_email}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#333', lineHeight: 1.5 }}>
                    {c.comment}
                  </td>
                  <td>
                    <span style={{ fontSize: '12.5px', color: '#d96b27', fontWeight: '500' }}>
                      {c.post_title || c.post_slug}
                    </span>
                  </td>
                  <td className="admin__date-cell">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="admin__actions-cell" style={{ justifyContent: 'center' }}>
                      <button
                        className="admin__action-btn admin__action-btn--delete"
                        onClick={() => handleDeleteComment(c._id || c.id)}
                        title="Delete comment"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {showAdd && (
            <div className="admin__inline-form">
              <input className="admin__form-input admin__form-input--lg" placeholder="Post Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <input className="admin__form-input" placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              <select className="admin__form-input admin__form-input--sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option>Draft</option><option>Published</option>
              </select>
              <button className="admin__form-save" onClick={addPost}>Save</button>
              <button className="admin__form-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          )}

          <div className="admin__table-wrap">
            <table className="admin__table">
              <thead><tr><th>#</th><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {posts.map((p, idx) => (
                  <tr key={p.id}>
                    <td><span className="admin__order-id">{idx + 1}</span></td>
                    <td><strong>{p.title}</strong></td>
                    <td><span className="admin__tag">{p.category}</span></td>
                    <td><span className="admin__status-badge" style={STATUS_COLORS[p.status]}>{p.status}</span></td>
                    <td className="admin__date-cell">{p.date}</td>
                    <td>
                      <div className="admin__actions-cell">
                        <button className="admin__action-btn admin__action-btn--toggle" onClick={() => toggleStatus(p.id)} title="Toggle publish"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3l4 4-4 4"/><path d="M3 7h18"/><path d="M7 21l-4-4 4-4"/><path d="M21 17H3"/></svg></button>
                        <button className="admin__action-btn admin__action-btn--delete" onClick={() => deletePost(p.id)} title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ── SLIDERS ── */
function PageSliders() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState(null);
  const initialForm = {
    title: '', subtitle: '', designer: '', price: '',
    badge_text: 'Discover more products', badge_category: '',
    cta_text: 'Shop Now', link: '/category/wooden-furniture',
    status: 'Active', image: ''
  };
  const [form, setForm] = useState(initialForm);

  const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace('/api', '');

  const loadSlides = () => {
    setLoading(true);
    adminApi.getSliders()
      .then(res => setSlides(res.data || []))
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSlides(); }, []);

  const formatPrice = (p) => {
    if (!p) return '';
    let str = String(p).trim().replace(/\$/g, '₹');
    if (!str.startsWith('₹')) str = '₹' + str;
    return str;
  };

  const deleteSlide = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    try {
      await adminApi.deleteSlider(id);
      setSlides(prev => prev.filter(s => (s._id || s.id) !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const toggleStatus = async (slide) => {
    const newStatus = slide.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await adminApi.updateSlider(slide._id || slide.id, { status: newStatus });
      setSlides(prev => prev.map(s => (s._id || s.id) === (slide._id || slide.id) ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const handleEditSlide = (slide) => {
    setForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      designer: slide.designer || slide.subtitle || '',
      price: formatPrice(slide.price),
      badge_text: slide.badge_text || 'Discover more products',
      badge_category: slide.badge_category || '',
      cta_text: slide.cta_text || 'Shop Now',
      link: slide.link || '/category/wooden-furniture',
      status: slide.status || 'Active',
      image: slide.image || '',
    });
    setEditingSlideId(slide._id || slide.id);
    setShowAdd(true);
  };

  const handleCloseModal = () => {
    setShowAdd(false);
    setEditingSlideId(null);
    setForm(initialForm);
  };

  const handleSaveSlide = async () => {
    if (!form.title.trim()) return alert('Title required');
    setSaving(true);
    const payload = {
      ...form,
      price: formatPrice(form.price)
    };
    try {
      if (editingSlideId) {
        await adminApi.updateSlider(editingSlideId, payload);
        setSlides(prev => prev.map(s => (s._id || s.id) === editingSlideId ? { ...s, ...payload } : s));
      } else {
        const res = await adminApi.createSlider(payload);
        setSlides(prev => [res.data || { id: Date.now(), ...payload }, ...prev]);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Save slide error:', err);
      if (editingSlideId) {
        setSlides(prev => prev.map(s => (s._id || s.id) === editingSlideId ? { ...s, ...payload } : s));
        handleCloseModal();
      } else {
        alert('Save failed: ' + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const resolveImg = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${API_BASE}/storage/${img}`;
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">Hero Sliders</h2>
          <p className="admin__panel-sub">Manage homepage hero slider — images &amp; text from backend</p>
        </div>
        <button className="admin__add-btn" onClick={() => { setForm(initialForm); setEditingSlideId(null); setShowAdd(true); }} id="add-slide-btn">
          + Add Slide
        </button>
      </div>

      {showAdd && (
        <div className="admin__modal-overlay" onClick={handleCloseModal}>
          <div className="admin__detailed-form" onClick={e => e.stopPropagation()}>
            <div className="admin__detailed-form-header">
              <h3>{editingSlideId ? 'Edit Slide' : 'Add New Slide'}</h3>
              <button className="admin__form-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="admin__form-scroll-area">
              <div className="admin__form-section">
                <h4 className="admin__section-title">Slide Content</h4>
                <div className="admin__form-grid admin__form-grid--3col">
                  <div className="admin__input-group">
                    <label>Title *</label>
                    <input className="admin__form-input" placeholder="e.g. Luxury Birthday Gift Hamper" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>Designer / Subtitle</label>
                    <input className="admin__form-input" placeholder="e.g. AstroGifts Studio" value={form.designer} onChange={e => setForm(f => ({ ...f, designer: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>Price</label>
                    <input className="admin__form-input" placeholder="e.g. ₹1,499" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>Badge Title Text</label>
                    <input className="admin__form-input" placeholder="e.g. Discover exclusive gift boxes" value={form.badge_text} onChange={e => setForm(f => ({ ...f, badge_text: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>Badge Category</label>
                    <input className="admin__form-input" placeholder="e.g. gifts, toys, astrology, flowers, decor" value={form.badge_category} onChange={e => setForm(f => ({ ...f, badge_category: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>CTA Button Text</label>
                    <input className="admin__form-input" placeholder="Shop Now" value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>Link URL</label>
                    <input className="admin__form-input" placeholder="/category/gifts" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
                  </div>
                </div>
                <div className="admin__input-group" style={{ marginTop: '15px' }}>
                  <label>Slide Background Image</label>
                  <ImageUploader
                    initialImage={form.image}
                    onUploadSuccess={(url) => setForm(f => ({ ...f, image: url }))}
                  />
                  {form.image && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={form.image.startsWith('http') ? form.image : `${API_BASE}/storage/${form.image}`} alt="Preview" style={{ height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>
              <div className="admin__form-section">
                <h4 className="admin__section-title">Status</h4>
                <div className="admin__input-group">
                  <label>Status</label>
                  <select className="admin__form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="admin__form-footer">
              <button className="admin__form-cancel-btn" onClick={handleCloseModal}>Cancel</button>
              <button className="admin__form-save-btn" onClick={handleSaveSlide} disabled={saving}>
                {saving ? 'Saving…' : (editingSlideId ? 'Update Slide' : 'Save Slide')}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading slides…</div>
      ) : slides.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
          No slides yet. Click "+ Add Slide" to create one.
        </div>
      ) : (
        <div className="admin__slider-cards">
          {slides.map((slide, idx) => (
            <div className="admin__slider-card" key={slide._id || slide.id}>
              <div className="admin__slider-card__preview" style={{
                backgroundImage: resolveImg(slide.image) ? `url(${resolveImg(slide.image)})` : undefined,
                backgroundSize: 'cover', backgroundPosition: 'center',
                background: !slide.image ? `hsl(${idx * 60}, 30%, 70%)` : undefined,
              }}>
                <div className="admin__slider-card__num" style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', padding: '4px 10px', borderRadius: '6px' }}>
                  Slide {idx + 1}
                </div>
              </div>
              <div className="admin__slider-card__body">
                <h3 className="admin__slider-card__title">{slide.title}</h3>
                {(slide.designer || slide.subtitle) && <p className="admin__slider-card__sub">by {slide.designer || slide.subtitle}</p>}
                <div className="admin__slider-card__meta">
                  {slide.price && <span className="admin__slider-meta-item">{formatPrice(slide.price)}</span>}
                  {slide.badge_category && (
                    <span className="admin__slider-meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                      {slide.badge_category}
                    </span>
                  )}
                  <span className="admin__slider-meta-item" style={{ color: slide.status === 'Active' ? '#16a34a' : '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    {slide.status}
                  </span>
                </div>
              </div>
              <div className="admin__slider-card__actions">
                <button className="admin__action-btn admin__action-btn--edit" onClick={() => handleEditSlide(slide)} title="Edit slide">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
                <button className="admin__action-btn admin__action-btn--toggle" onClick={() => toggleStatus(slide)} title="Toggle status">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><path d="M17 3l4 4-4 4"/><path d="M3 7h18"/><path d="M7 21l-4-4 4-4"/><path d="M21 17H3"/></svg>
                  Toggle
                </button>
                <button className="admin__action-btn admin__action-btn--delete" onClick={() => deleteSlide(slide._id || slide.id)} title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── PRODUCT: CATEGORIES ── */
function PageCategories() {
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const initialFormState = {
    name: '', slug: '', parentCategory: 'None', description: '',
    status: 'Active', showInMenu: 'Yes', image: ''
  };
  const [form, setForm]       = useState(initialFormState);

  const fetchCategories = () => {
    setLoading(true);
    adminApi.getCategories()
      .then(res => {
        setCats(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch categories", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const deleteCat = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await adminApi.deleteCategory(id);
      setCats(prev => prev.filter(c => (c._id || c.id) !== id));
    } catch (err) {
      console.error("Failed to delete category", err);
      alert("Failed to delete category: " + err.message);
    }
  };

  const toggleCat = async (cat) => {
    const id = cat._id || cat.id;
    const newStatus = cat.status === 'Active' || cat.is_active === true ? 'Inactive' : 'Active';
    try {
      await adminApi.updateCategory(id, {
        status: newStatus,
        is_active: newStatus === 'Active'
      });
      setCats(prev => prev.map(c => {
        if ((c._id || c.id) === id) {
          return { ...c, status: newStatus, is_active: newStatus === 'Active' };
        }
        return c;
      }));
    } catch (err) {
      console.error("Failed to update category status", err);
      alert("Failed to update status: " + err.message);
    }
  };

  const addCat = async () => {
    if (!form.name.trim()) {
      alert("Please enter a category name");
      return;
    }
    setSaving(true);
    try {
      const res = await adminApi.createCategory({
        ...form,
        slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/\s+/g, '-'),
        is_active: form.status === 'Active',
      });
      if (res.data) {
        setCats(prev => [res.data, ...prev]);
      } else {
        fetchCategories();
      }
      setForm(initialFormState);
      setShowAdd(false);
    } catch (err) {
      console.error("Failed to create category", err);
      alert("Failed to save category: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">Product Categories</h2>
          <p className="admin__panel-sub">Organize your products into categories (Saved in Database)</p>
        </div>
        <button className="admin__add-btn" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? '✕ Close' : '+ Add Category'}
        </button>
      </div>

      {showAdd && (
        <div className="admin__modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="admin__detailed-form" onClick={e => e.stopPropagation()}>
            <div className="admin__detailed-form-header">
              <h3>Add New Category</h3>
              <button className="admin__form-close" onClick={() => setShowAdd(false)}>×</button>
            </div>
            
            <div className="admin__form-scroll-area">
              {/* Basic Information */}
              <div className="admin__form-section">
                <h4 className="admin__section-title">Basic Information</h4>
                <div className="admin__form-grid admin__form-grid--3col">
                  <div className="admin__input-group">
                    <label>Category Name *</label>
                    <input className="admin__form-input" placeholder="e.g. Birthday Gifts" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>Slug (auto-generated if empty)</label>
                    <input className="admin__form-input" placeholder="e.g. birthday-gifts" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>Parent Category</label>
                    <select className="admin__form-input" value={form.parentCategory} onChange={e => setForm(f => ({ ...f, parentCategory: e.target.value }))}>
                      <option value="None">None</option>
                      {cats.map(c => (
                        <option key={c._id || c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="admin__input-group" style={{ marginBottom: '10px' }}>
                  <label>Description</label>
                  <textarea className="admin__form-input" rows="6" style={{ resize: 'vertical', minHeight: '120px', width: '100%', boxSizing: 'border-box' }} placeholder="Category details..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}></textarea>
                </div>
                <div className="admin__input-group" style={{ marginTop: '15px' }}>
                  <label>Category Thumbnail Image</label>
                  <ImageUploader 
                    initialImage={form.image} 
                    onUploadSuccess={(url) => setForm(f => ({ ...f, image: url }))} 
                  />
                </div>
              </div>

              {/* Status & Visibility */}
              <div className="admin__form-section">
                <h4 className="admin__section-title">Status & Visibility</h4>
                <div className="admin__form-grid admin__form-grid--2col">
                  <div className="admin__input-group">
                    <label>Status</label>
                    <select className="admin__form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="admin__input-group">
                    <label>Include in Menu</label>
                    <select className="admin__form-input" value={form.showInMenu} onChange={e => setForm(f => ({ ...f, showInMenu: e.target.value }))}>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin__form-footer">
              <button className="admin__form-cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="admin__form-save-btn" onClick={addCat} disabled={saving}>
                {saving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin__table-wrap" style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>Loading categories...</div>
        ) : (
          <table className="admin__table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>#</th>
                <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Category Name</th>
                <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Slug</th>
                <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Products</th>
                <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cats.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    No categories found. Click "+ Add Category" to create one.
                  </td>
                </tr>
              ) : (
                cats.map((c, idx) => {
                  const catId = c._id || c.id;
                  const isActive = c.status === 'Active' || c.is_active !== false;
                  return (
                    <tr key={catId || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px', fontSize: '13px', fontWeight: '500', color: '#1e293b' }}><span className="admin__order-id">{idx + 1}</span></td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}><strong>{c.name}</strong></td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}><code className="admin__code">{c.slug}</code></td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: isActive ? '#dcfce7' : '#fee2e2',
                          color: isActive ? '#15803d' : '#b91c1c'
                        }}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}><span className="admin__count-badge">{c.products_count ?? c.count ?? 0}</span></td>
                      <td style={{ padding: '16px' }}>
                        <div className="admin__actions-cell" style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="admin__action-btn admin__action-btn--toggle"
                            onClick={() => toggleCat(c)}
                            title={isActive ? "Deactivate" : "Activate"}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3l4 4-4 4"/><path d="M3 7h18"/><path d="M7 21l-4-4 4-4"/><path d="M21 17H3"/></svg>
                          </button>
                          <button
                            className="admin__action-btn admin__action-btn--delete"
                            onClick={() => deleteCat(catId)}
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── PRODUCT: SKU ── */
function PageSKU() {
  const [skus, setSkus] = useState(MOCK_SKUS);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', stock: '', warehouse: '' });

  const addSku = () => {
    if (!form.name || !form.sku) return;
    setSkus(prev => [...prev, { id: Date.now(), name: form.name, sku: form.sku, stock: Number(form.stock) || 0, warehouse: form.warehouse || 'Delhi' }]);
    setShowAdd(false);
    setForm({ name: '', sku: '', stock: '', warehouse: '' });
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">SKU Management</h2>
          <p className="admin__panel-sub">Track product SKUs and stock levels</p>
        </div>
        <button className="admin__add-btn" onClick={() => setShowAdd(!showAdd)}>+ Add SKU</button>
      </div>

      {showAdd && (
        <div className="admin__inline-form">
          <input className="admin__form-input" placeholder="Product Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="admin__form-input admin__form-input--sm" placeholder="SKU Code" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
          <input className="admin__form-input admin__form-input--sm" placeholder="Stock" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
          <input className="admin__form-input admin__form-input--sm" placeholder="Warehouse" value={form.warehouse} onChange={e => setForm(f => ({ ...f, warehouse: e.target.value }))} />
          <button className="admin__form-save" onClick={addSku}>Save</button>
          <button className="admin__form-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      )}
      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead><tr><th>#</th><th>Product Name</th><th>SKU Code</th><th>Stock</th><th>Warehouse</th><th>Actions</th></tr></thead>
          <tbody>
            {skus.map((s, idx) => (
              <tr key={s.id}>
                <td><span className="admin__order-id">{idx + 1}</span></td>
                <td><strong>{s.name}</strong></td>
                <td><code className="admin__code">{s.sku}</code></td>
                <td>
                  <span className={`admin__stock-badge ${s.stock < 10 ? 'admin__stock-badge--low' : ''}`}>
                    {s.stock} units
                  </span>
                </td>
                <td>{s.warehouse}</td>
                <td>
                  <div className="admin__actions-cell">
                    <button className="admin__action-btn admin__action-btn--edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── PRODUCT: PRICE ── */
function PagePrice() {
  const [prices, setPrices] = useState(MOCK_PRICES);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', original: '', sale: '', discount: '' });

  const addPrice = () => {
    if (!form.name) return;
    setPrices(prev => [...prev, { id: Date.now(), name: form.name, original: form.original, sale: form.sale, discount: form.discount, currency: 'INR' }]);
    setShowAdd(false);
    setForm({ name: '', original: '', sale: '', discount: '' });
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">Price Management</h2>
          <p className="admin__panel-sub">Manage product pricing and discounts</p>
        </div>
        <button className="admin__add-btn" onClick={() => setShowAdd(!showAdd)}>+ Update Prices</button>
      </div>

      {showAdd && (
        <div className="admin__inline-form">
          <input className="admin__form-input" placeholder="Product Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="admin__form-input admin__form-input--sm" placeholder="Original Price" value={form.original} onChange={e => setForm(f => ({ ...f, original: e.target.value }))} />
          <input className="admin__form-input admin__form-input--sm" placeholder="Sale Price" value={form.sale} onChange={e => setForm(f => ({ ...f, sale: e.target.value }))} />
          <input className="admin__form-input admin__form-input--sm" placeholder="Discount" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} />
          <button className="admin__form-save" onClick={addPrice}>Save</button>
          <button className="admin__form-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      )}
      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead><tr><th>#</th><th>Product Name</th><th>Original Price</th><th>Sale Price</th><th>Discount</th><th>Currency</th><th>Actions</th></tr></thead>
          <tbody>
            {prices.map((p, idx) => (
              <tr key={p.id}>
                <td><span className="admin__order-id">{idx + 1}</span></td>
                <td><strong>{p.name}</strong></td>
                <td><span className="admin__price-original">{p.original}</span></td>
                <td><span className="admin__price-sale">{p.sale}</span></td>
                <td><span className="admin__discount-badge">{p.discount} OFF</span></td>
                <td>{p.currency}</td>
                <td>
                  <div className="admin__actions-cell">
                    <button className="admin__action-btn admin__action-btn--edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── PRODUCT: DESCRIPTION ── */
function PageDescription() {
  const [descs, setDescs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await adminApi.getProducts();
        const items = res?.data || res || [];
        if (items.length > 0) {
          setDescs(items.map(p => ({
            id: p.id || p._id,
            name: p.name,
            short: p.description ? (p.description.slice(0, 80) + '...') : 'No description provided.',
            full: p.description || '',
            category: p.category_name || p.category || 'Product',
          })));
        } else {
          setDescs(MOCK_DESCRIPTIONS);
        }
      } catch (e) {
        setDescs(MOCK_DESCRIPTIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const startEdit = (item) => {
    setEditing(item.id);
    setEditVal(item.full);
    setSaveSuccess('');
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      await adminApi.updateProduct(id, { description: editVal });
      setDescs(prev => prev.map(d => d.id === id ? {
        ...d,
        full: editVal,
        short: editVal.slice(0, 80) + (editVal.length > 80 ? '...' : '')
      } : d));
      setEditing(null);
      setSaveSuccess(`Updated description for product #${id}! Changes are live on frontend.`);
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      alert('Failed to update description: ' + (err.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">Product Descriptions</h2>
          <p className="admin__panel-sub">Edit product descriptions live — updates show instantly on frontend Product Pages</p>
        </div>
      </div>

      {saveSuccess && (
        <div style={{
          background: '#dcfce7',
          color: '#15803d',
          padding: '10px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          ✓ {saveSuccess}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>Loading products...</div>
      ) : (
        <div className="admin__desc-list">
          {descs.map(d => (
            <div className="admin__desc-card" key={d.id}>
              <div className="admin__desc-card__header">
                <div>
                  <h3 className="admin__desc-card__name">{d.name}</h3>
                  {d.category && <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>{d.category}</span>}
                </div>
                {editing !== d.id
                  ? <button className="admin__action-btn admin__action-btn--edit" onClick={() => startEdit(d)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit Description
                    </button>
                  : <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="admin__action-btn" onClick={() => setEditing(null)} style={{ background: '#eee' }}>Cancel</button>
                      <button className="admin__form-save" onClick={() => saveEdit(d.id)} disabled={saving} style={{ background: '#d96b27', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                }
              </div>
              <p className="admin__desc-card__short"><strong>Summary:</strong> {d.short}</p>
              {editing === d.id ? (
                <textarea
                  className="admin__desc-textarea"
                  value={editVal}
                  onChange={e => setEditVal(e.target.value)}
                  rows={4}
                  style={{ width: '100%', boxSizing: 'border-box', marginTop: '8px' }}
                />
              ) : (
                <p className="admin__desc-card__full">{d.full}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── PRODUCT: COLORS ── */
function PageColors() {
  const [colors, setColors] = useState(() => getStoredColors());
  const [showAdd, setShowAdd] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [form, setForm] = useState({ name: '', hex: '', status: 'Active' });

  const openAddModal = () => {
    setEditingColor(null);
    setForm({ name: '', hex: '', status: 'Active' });
    setShowAdd(true);
  };

  const openEditModal = (c) => {
    setEditingColor(c);
    setForm({
      name: c.name || '',
      hex: c.hex || '#333333',
      status: c.status || 'Active'
    });
    setShowAdd(true);
  };

  const handleSaveColor = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    let updated;
    if (editingColor) {
      updated = colors.map(c => c.id === editingColor.id ? {
        ...c,
        name: form.name.trim(),
        hex: form.hex || '#333333',
        status: form.status,
      } : c);
    } else {
      const newColor = {
        id: String(Date.now()),
        name: form.name.trim(),
        hex: form.hex || '#333333',
        status: form.status,
      };
      updated = [newColor, ...colors];
    }

    setColors(updated);
    saveStoredColors(updated);
    setShowAdd(false);
    setEditingColor(null);
    setForm({ name: '', hex: '', status: 'Active' });
  };

  const toggleColorStatus = (id) => {
    const updated = colors.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c);
    setColors(updated);
    saveStoredColors(updated);
  };

  const deleteColor = (id) => {
    if (!window.confirm('Are you sure you want to delete this color option?')) return;
    const updated = colors.filter(c => c.id !== id);
    setColors(updated);
    saveStoredColors(updated);
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">Product Colors</h2>
          <p className="admin__panel-sub">Manage product color options for All Products dropdown</p>
        </div>
        <button className="admin__add-btn" onClick={() => showAdd ? setShowAdd(false) : openAddModal()}>
          {showAdd ? '✕ Close' : '+ Add Color'}
        </button>
      </div>

      {showAdd && (
        <div className="admin__modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="admin__detailed-form" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '90%' }}>
            <div className="admin__detailed-form-header">
              <h3>{editingColor ? 'Edit Color Option' : 'Add New Color Option'}</h3>
              <button className="admin__form-close" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <form onSubmit={handleSaveColor}>
              <div className="admin__form-scroll-area">
                <div className="admin__form-section">
                  <h4 className="admin__section-title">Color Details</h4>
                  
                  <div className="admin__input-group" style={{ marginBottom: '14px' }}>
                    <label>Color Name *</label>
                    <input
                      className="admin__form-input"
                      type="text"
                      placeholder="e.g. Royal Navy, Rose Gold"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="admin__input-group" style={{ marginBottom: '14px' }}>
                    <label>Color Code (HEX)</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={form.hex || '#333333'}
                        onChange={e => setForm(f => ({ ...f, hex: e.target.value }))}
                        style={{ width: '45px', height: '38px', padding: 0, border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        className="admin__form-input"
                        type="text"
                        placeholder="e.g. #1c1c1c"
                        value={form.hex}
                        onChange={e => setForm(f => ({ ...f, hex: e.target.value }))}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>

                  <div className="admin__input-group">
                    <label>Status</label>
                    <select
                      className="admin__form-input"
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin__form-footer">
                <button type="button" className="admin__form-cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="admin__form-save-btn">Save Color</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Color Preview</th>
              <th>Color Name</th>
              <th>HEX Code</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {colors.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                  No colors added yet. Click "+ Add Color" to create one.
                </td>
              </tr>
            ) : (
              colors.map((c, idx) => (
                <tr key={c.id || idx}>
                  <td><span className="admin__order-id">{idx + 1}</span></td>
                  <td>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: c.hex || '#cccccc',
                      border: '2px solid #ffffff',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                      display: 'inline-block',
                      verticalAlign: 'middle'
                    }} />
                  </td>
                  <td><strong>{c.name}</strong></td>
                  <td><code className="admin__code">{c.hex}</code></td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: c.status === 'Active' ? '#dcfce7' : '#fee2e2',
                      color: c.status === 'Active' ? '#15803d' : '#b91c1c'
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin__actions-cell" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => openEditModal(c)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: '#eff6ff',
                          color: '#4f46e5',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        title="Edit Color"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                      <button
                        onClick={() => deleteColor(c.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          width: '32px',
                          height: '32px',
                          background: '#fee2e2',
                          color: '#ef4444',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── PRODUCT: SIZES ── */
function PageSizes() {
  const [sizes, setSizes] = useState(() => getStoredSizes());
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingSize, setEditingSize] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', dimensions: '', status: 'Active' });

  const fetchSizes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSizes();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setSizes(res.data);
        saveStoredSizes(res.data);
      }
    } catch (e) {
      console.warn("Backend sizes fetch fallback to local:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  const openAddModal = () => {
    setEditingSize(null);
    setForm({ name: '', code: '', dimensions: '', status: 'Active' });
    setShowAdd(true);
  };

  const openEditModal = (s) => {
    setEditingSize(s);
    setForm({
      name: s.name || '',
      code: s.code || '',
      dimensions: s.dimensions || '',
      status: s.status || 'Active'
    });
    setShowAdd(true);
  };

  const handleSaveSize = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Please enter a size name");
      return;
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase() || form.name.trim().substring(0, 3).toUpperCase(),
      dimensions: form.dimensions.trim() || 'Standard',
      status: form.status,
    };

    try {
      if (editingSize) {
        const id = editingSize.id || editingSize._id;
        await adminApi.updateSize(id, payload);
      } else {
        await adminApi.addSize(payload);
      }
      await fetchSizes();
    } catch (err) {
      console.warn("API save error, fallback to local:", err.message);
      if (editingSize) {
        const updated = sizes.map(s => (s.id === editingSize.id || s._id === editingSize._id) ? { ...s, ...payload } : s);
        setSizes(updated);
        saveStoredSizes(updated);
      } else {
        const newSize = { id: String(Date.now()), ...payload };
        const updated = [newSize, ...sizes];
        setSizes(updated);
        saveStoredSizes(updated);
      }
    }

    setShowAdd(false);
    setEditingSize(null);
    setForm({ name: '', code: '', dimensions: '', status: 'Active' });
  };

  const toggleSizeStatus = async (s) => {
    const id = s.id || s._id;
    const nextStatus = s.status === 'Active' ? 'Inactive' : 'Active';
    setSizes(prev => prev.map(item => (item.id === id || item._id === id) ? { ...item, status: nextStatus } : item));
    try {
      await adminApi.updateSize(id, { status: nextStatus });
    } catch (e) {
      console.warn("API status update error:", e.message);
    }
  };

  const deleteSize = async (s) => {
    const id = s.id || s._id;
    if (!window.confirm(`Are you sure you want to delete size "${s.name}"?`)) return;
    setSizes(prev => prev.filter(item => item.id !== id && item._id !== id));
    try {
      await adminApi.deleteSize(id);
    } catch (e) {
      console.warn("API delete error:", e.message);
    }
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">Product Sizes</h2>
          <p className="admin__panel-sub">Manage product size variations, dimensions, and specifications</p>
        </div>
        <button className="admin__add-btn" onClick={openAddModal}>
          + Add Size
        </button>
      </div>

      {showAdd && (
        <div className="admin__modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="admin__detailed-form" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '90%' }}>
            <div className="admin__detailed-form-header">
              <h3>{editingSize ? 'Edit Size Option' : 'Add New Size Option'}</h3>
              <button className="admin__form-close" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <form onSubmit={handleSaveSize}>
              <div className="admin__form-scroll-area">
                <div className="admin__form-section">
                  <h4 className="admin__section-title">Size Details</h4>
                  
                  <div className="admin__input-group" style={{ marginBottom: '14px' }}>
                    <label>Size Name *</label>
                    <input
                      className="admin__form-input"
                      type="text"
                      placeholder="e.g. Deluxe Gift Box, Single Pack, Medium"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="admin__form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div className="admin__input-group">
                      <label>Size Code (Short)</label>
                      <input
                        className="admin__form-input"
                        type="text"
                        placeholder="e.g. S, M, L, XL, SET2"
                        value={form.code}
                        onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                      />
                    </div>

                    <div className="admin__input-group">
                      <label>Status</label>
                      <select
                        className="admin__form-input"
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin__input-group">
                    <label>Dimensions / Measurements</label>
                    <input
                      className="admin__form-input"
                      type="text"
                      placeholder="e.g. 25x18x12 cm or 350g"
                      value={form.dimensions}
                      onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))}
                    />
                    <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', display: 'block' }}>
                      Visible to customers when viewing product specifications
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin__form-footer">
                <button type="button" className="admin__form-cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="admin__form-save-btn">{editingSize ? 'Update Size' : 'Save Size'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th style={{ width: '110px' }}>Size Code</th>
              <th>Size Name</th>
              <th>Dimensions / Measurement</th>
              <th style={{ width: '110px' }}>Status</th>
              <th style={{ width: '130px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sizes.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                  No sizes added yet. Click "+ Add Size" to create one.
                </td>
              </tr>
            ) : (
              sizes.map((s, idx) => (
                <tr key={s.id || idx}>
                  <td><span className="admin__order-id">{idx + 1}</span></td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 9px',
                      background: '#f3f4f6',
                      borderRadius: '5px',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      fontSize: '12px',
                      color: '#1f2937',
                      border: '1px solid #e5e7eb'
                    }}>
                      {s.code || s.name.substring(0, 3).toUpperCase()}
                    </span>
                  </td>
                  <td><strong style={{ color: '#111827', fontSize: '13.5px' }}>{s.name}</strong></td>
                  <td>
                    <span style={{ color: '#4b5563', fontSize: '13px' }}>
                      {s.dimensions || '—'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleSizeStatus(s)}
                      title="Click to toggle status"
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '14px',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        border: 'none',
                        background: s.status === 'Active' ? '#dcfce7' : '#fee2e2',
                        color: s.status === 'Active' ? '#15803d' : '#b91c1c',
                        transition: 'opacity 0.15s'
                      }}
                      onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                      onMouseOut={e => e.currentTarget.style.opacity = '1'}
                    >
                      {s.status}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => openEditModal(s)}
                        title="Edit Size"
                        style={{
                          background: '#eef2ff',
                          color: '#4f46e5',
                          border: 'none',
                          borderRadius: '7px',
                          padding: '6px 14px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.18s ease'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'}
                        onMouseOut={e => e.currentTarget.style.background = '#eef2ff'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => deleteSize(s)}
                        title="Delete Size"
                        style={{
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          borderRadius: '7px',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.18s ease'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#fecaca'}
                        onMouseOut={e => e.currentTarget.style.background = '#fee2e2'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

  /* ── IMAGE UPLOADER ── */
  function ImageUploader({ onUploadSuccess, initialImage = '', multiple = false, initialImages = [] }) {
    const [preview, setPreview] = useState(initialImage);
    const [previews, setPreviews] = useState(initialImages.length > 0 ? initialImages : (initialImage ? [initialImage] : []));
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
      else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        if (multiple) {
            await handleMultipleUpload(Array.from(e.dataTransfer.files));
        } else {
            await handleUpload(e.dataTransfer.files[0]);
        }
      }
    };

    const handleChange = async (e) => {
      e.preventDefault();
      if (e.target.files && e.target.files.length > 0) {
        if (multiple) {
            await handleMultipleUpload(Array.from(e.target.files));
        } else {
            await handleUpload(e.target.files[0]);
        }
      }
    };

    const handleUpload = async (file) => {
      setUploading(true);
      try {
        const res = await adminApi.uploadImage(file);
        setPreview(res.url);
        if (onUploadSuccess) onUploadSuccess(res.url);
      } catch (err) {
        alert('Image upload failed. Please try again.');
        console.error(err);
      } finally {
        setUploading(false);
      }
    };

    const handleMultipleUpload = async (files) => {
      setUploading(true);
      try {
        const uploadedUrls = [];
        for (const file of files) {
           const res = await adminApi.uploadImage(file);
           uploadedUrls.push(res.url);
        }
        const newPreviews = [...previews, ...uploadedUrls];
        setPreviews(newPreviews);
        if (onUploadSuccess) onUploadSuccess(newPreviews);
      } catch (err) {
        alert('Some images failed to upload. Please try again.');
        console.error(err);
      } finally {
        setUploading(false);
      }
    };

    const removeImage = (index, e) => {
      e.stopPropagation();
      const newPreviews = previews.filter((_, i) => i !== index);
      setPreviews(newPreviews);
      if (onUploadSuccess) onUploadSuccess(newPreviews);
    };

    if (multiple) {
       return (
         <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <div 
              className={`admin__image-upload-box ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => document.getElementById('image-upload-input-multi').click()}
            >
              <input 
                id="image-upload-input-multi" 
                type="file" 
                accept="image/*" 
                multiple
                style={{ display: 'none' }} 
                onChange={handleChange} 
              />
              {uploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span>Click to upload images or drag and drop</span>
                  <small>SVG, PNG, JPG or GIF (max. 800x400px)</small>
                </>
              )}
            </div>
            {previews.length > 0 && (
              <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginTop:'10px'}}>
                 {previews.map((p, i) => (
                    <div key={i} style={{position:'relative', width:'80px', height:'80px', border:'1px solid #ddd', borderRadius:'4px', overflow:'hidden'}}>
                       <img src={p} alt={`Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       <button onClick={(e) => removeImage(i, e)} type="button" style={{position:'absolute', top:'2px', right:'2px', background:'rgba(255,0,0,0.7)', color:'white', border:'none', borderRadius:'50%', width:'20px', height:'20px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px'}}>X</button>
                    </div>
                 ))}
              </div>
            )}
         </div>
       );
    }

    return (
      <div 
        className={`admin__image-upload-box ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
        onClick={() => document.getElementById('image-upload-input').click()}
      >
        <input 
          id="image-upload-input" 
          type="file" 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleChange} 
        />
        {preview ? (
          <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
        ) : uploading ? (
          <span>Uploading...</span>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Click to upload image or drag and drop</span>
            <small>SVG, PNG, JPG or GIF (max. 800x400px)</small>
          </>
        )}
      </div>
    );
  }

  /* ── PRODUCT: ALL PRODUCTS ── */
function PageAllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState(() => getStoredSizes());
  const [colors, setColors] = useState(() => getStoredColors());
  const [dateFilter, setDateFilter] = useState('');
  const [sortDateOrder, setSortDateOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSize, setFilterSize] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const initialFormState = {
    name: '', sku: '', category: '', description: '',
    regularPrice: '', salePrice: '', discount: '', tax: '',
    stockQuantity: '', stockStatus: 'In Stock', lowStockThreshold: '', allowBackorders: 'No',
    material: '', color: '', colors: [], stock_by_color: {}, size: '', dimensions: '', weight: '', brand: '',
    status: 'Active', featured: 'No', image: '', images: [], 
    trust_badges: [
      { title: '7 Days Return', description: 'Easy return process', icon: 'return' }
    ]
  };
  const [form, setForm] = useState(initialFormState);

  const fetchCategories = () => {
    adminApi.getCategories()
      .then(res => {
        const cats = res.data || [];
        setCategories(cats);
        if (cats.length > 0 && !form.category) {
          setForm(f => ({ ...f, category: f.category || cats[0].name }));
        }
      })
      .catch(err => console.error('Failed to fetch categories', err));
  };

  const fetchSizes = () => {
    setSizes(getStoredSizes());
  };

  const fetchColors = () => {
    setColors(getStoredColors());
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts();
      if (res.data && Array.isArray(res.data)) {
        setProducts(res.data.map(p => {
          const catName = p.category_name || (p.category ? p.category.name : 'Uncategorized');
          let imgSrc = p.image || p.image_url;
          if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('data:') && !imgSrc.startsWith('/assets/')) {
            if (imgSrc.startsWith('/uploads/')) {
              imgSrc = `http://127.0.0.1:8000${imgSrc}`;
            }
          }
          return {
            id: p._id || p.id,
            raw: p,
            name: p.name,
            sku: p.sku || '—',
            category: catName,
            price: `₹${Number(p.price || 0).toLocaleString()}`,
            old_price: p.old_price,
            stock: p.stock !== undefined && p.stock !== null ? p.stock : (p.stock_quantity !== undefined ? p.stock_quantity : (p.in_stock ? 'In Stock' : 'Out of Stock')),
            image: imgSrc,
            status: p.status || (p.is_active !== false ? 'Active' : 'Inactive'),
            created_at: p.created_at || null,
            date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          };
        }));
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductStatusStyle = (status) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'active') return { bg: '#dcfce7', color: '#15803d', border: '#86efac', value: 'Active' };
    if (s === 'inactive') return { bg: '#f3f4f6', color: '#4b5563', border: '#d1d5db', value: 'Inactive' };
    if (s === 'coming soon') return { bg: '#e0e7ff', color: '#3730a3', border: '#a5b4fc', value: 'Coming Soon' };
    if (s === 'out of stock') return { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', value: 'Out of Stock' };
    return { bg: '#dcfce7', color: '#15803d', border: '#86efac', value: 'Active' };
  };

  const handleProductStatusChange = async (p, newStatus) => {
    const id = p.id || p._id;
    setProducts(prev => prev.map(item => (item.id === id || item._id === id) ? { ...item, status: newStatus } : item));
    try {
      await adminApi.updateProduct(id, {
        status: newStatus,
        is_active: newStatus === 'Active'
      });
    } catch (err) {
      console.error("Failed to update product status:", err);
      await fetchProducts();
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSizes();
    fetchColors();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (form.regularPrice && form.salePrice) {
      const reg = parseFloat(form.regularPrice);
      const sale = parseFloat(form.salePrice);
      if (reg > 0 && sale < reg) {
        const disc = Math.round(((reg - sale) / reg) * 100);
        if (form.discount !== disc + '%') {
          setForm(f => ({ ...f, discount: disc + '%' }));
        }
      }
    }
  }, [form.regularPrice, form.salePrice]);

  const handleEditClick = (p) => {
    const raw = p.raw || {};
    setForm({
      ...initialFormState,
      name: p.name || '',
      category: p.category || (categories.length > 0 ? categories[0].name : 'Gifts'),
      regularPrice: raw.old_price ? String(raw.old_price) : '',
      salePrice: raw.price ? String(raw.price) : (p.price ? String(p.price).replace(/[^0-9.]/g, '') : ''),
      stockQuantity: raw.stock !== undefined && raw.stock !== null ? raw.stock : (p.stock !== undefined && p.stock !== null ? p.stock : 50),
      material: raw.material || '',
      color: raw.color || '',
      colors: raw.colors || [],
      stock_by_color: raw.stock_by_color || {},
      size: raw.size || p.size || '',
      dimensions: raw.dimensions || '',
      weight: raw.weight || '',
      brand: raw.brand || '',
      sku: raw.sku || (p.sku !== '—' ? p.sku : '') || '',
      description: raw.description || '',
      image: raw.image || raw.image_url || p.image || '',
      images: raw.images || (raw.image ? [raw.image] : []) || [],
      status: p.status || 'Active',
      trust_badges: Array.isArray(raw.trust_badges) ? [...raw.trust_badges] : initialFormState.trust_badges,
    });
    setEditingProductId(p.id);
    setShowAdd(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete product", err);
      // Fallback local remove if backend failed
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveProduct = async () => {
    if (!form.name.trim()) {
      alert("Please enter a product name");
      return;
    }
    if (!form.salePrice && !form.regularPrice) {
      alert("Please enter a product price");
      return;
    }
    
    setSaving(true);
    const priceNum = form.salePrice || form.regularPrice;
    const catObj = categories.find(c => c.name === form.category);
    const catSlug = catObj?.slug || form.category.toLowerCase().replace(/\s+/g, '-');

    const payload = {
      name: form.name,
      category_slug: catSlug,
      category_name: form.category || 'Gifts',
      category_id: catObj?._id || catObj?.id || null,
      price: priceNum,
      old_price: form.regularPrice || null,
      stock: form.stockQuantity || 50,
      stock_quantity: form.stockQuantity || 50,
      status: form.status || 'Active',
      is_active: form.status === 'Active',
      image: form.image || (form.images && form.images.length > 0 ? form.images[0] : ''),
      image_url: form.image || (form.images && form.images.length > 0 ? form.images[0] : ''),
      images: form.images || [],
      material: form.material,
      color: form.color,
      colors: form.colors || [],
      stock_by_color: form.stock_by_color || {},
      size: form.size,
      dimensions: form.dimensions,
      weight: form.weight,
      brand: form.brand || 'AstroGifts',
      sku: form.sku,
      description: form.description,
      trust_badges: form.trust_badges || []
    };

    try {
      if (editingProductId) {
        await adminApi.updateProduct(editingProductId, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      await fetchProducts();
      setShowAdd(false);
      setEditingProductId(null);
      setForm(initialFormState);
    } catch (e) {
      console.error('Failed to save product on backend', e);
      if (editingProductId) {
        setProducts(prev => prev.map(p => p.id === editingProductId ? {
          ...p,
          name: form.name,
          category: form.category || p.category,
          price: `₹${Number(priceNum || 0).toLocaleString()}`,
          stock: form.stockQuantity || p.stock,
          sku: form.sku || p.sku,
          status: form.status || p.status,
          image: form.image || p.image,
          raw: { ...p.raw, ...payload }
        } : p));
        setShowAdd(false);
        setEditingProductId(null);
        setForm(initialFormState);
      } else {
        alert('Failed to save product: ' + e.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowAdd(false);
    setEditingProductId(null);
    setForm(initialFormState);
  };

  const displayedProducts = useMemo(() => {
    let list = [...products];

    if (filterCategory) {
      list = list.filter(p => p.category === filterCategory || (p.raw && p.raw.category === filterCategory));
    }
    if (filterSize) {
      list = list.filter(p => p.raw && p.raw.size === filterSize);
    }
    if (filterColor) {
      list = list.filter(p => p.raw && p.raw.color === filterColor);
    }

    if (dateFilter) {
      list = list.filter(p => {
        if (!p.created_at) return false;
        const d = new Date(p.created_at);
        if (isNaN(d.getTime())) return false;
        const yyyyMmDd = d.toISOString().slice(0, 10);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const localDate = `${year}-${month}-${day}`;
        return localDate === dateFilter || yyyyMmDd === dateFilter;
      });
    }

    list.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortDateOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return list;
  }, [products, dateFilter, sortDateOrder, filterCategory, filterSize, filterColor]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();
  }, [products]);

  const uniqueSizes = useMemo(() => {
    if (sizes && sizes.length > 0) {
      return Array.from(new Set(sizes.map(s => s.name || s.code).filter(Boolean))).sort();
    }
    return Array.from(new Set(products.map(p => p.raw?.size).filter(Boolean))).sort();
  }, [products, sizes]);

  const uniqueColors = useMemo(() => {
    if (colors && colors.length > 0) {
      return Array.from(new Set(colors.map(c => c.name || c.hex).filter(Boolean))).sort();
    }
    return Array.from(new Set(products.map(p => p.raw?.color).filter(Boolean))).sort();
  }, [products, colors]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil((displayedProducts?.length || 0) / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [displayedProducts, totalPages, currentPage]);

  const paginatedProducts = displayedProducts?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="admin__panel-title">All Products</h2>
          <p className="admin__panel-sub">Manage all items across categories ({displayedProducts.length} Products)</p>
        </div>

        {/* Date Filter & Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none', background: '#fff' }}>
            <option value="">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={filterSize} onChange={e => setFilterSize(e.target.value)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none', background: '#fff' }}>
            <option value="">All Sizes</option>
            {uniqueSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={filterColor} onChange={e => setFilterColor(e.target.value)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none', background: '#fff' }}>
            <option value="">All Colors</option>
            {uniqueColors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Filter Date:
            </span>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '12.5px',
                color: '#1e293b',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                title="Clear date filter"
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '10px',
                  color: '#64748b'
                }}
              >
                ✕
              </button>
            )}
          </div>



          <button className="admin__add-btn" onClick={() => { if (showAdd) handleCancel(); else setShowAdd(true); }}>
            {showAdd ? '✕ Close' : '+ Add Product'}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="admin__modal-overlay" onClick={handleCancel}>
          <div className="admin__detailed-form" onClick={e => e.stopPropagation()}>
            <div className="admin__detailed-form-header">
              <h3>{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="admin__form-close" onClick={handleCancel}>×</button>
            </div>
            
            <div className="admin__form-scroll-area">
              {/* Basic Information */}
              <div className="admin__form-section">
                <h4 className="admin__section-title">Basic Information</h4>
                {/* Product Name, SKU, Category in one row */}
                <div className="admin__form-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', marginBottom: '10px' }}>
                  <div className="admin__input-group">
                    <label>Product Name *</label>
                    <input className="admin__form-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="e.g. Karungali Bracelet / Rose Quartz Crystal" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>SKU</label>
                    <input className="admin__form-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="e.g. ASTRO-001" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>Category *</label>
                    <select className="admin__form-input" style={{ width: '100%', boxSizing: 'border-box' }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {categories.length === 0 ? (
                        <>
                          <option value="Gifts">Gifts</option>
                          <option value="Astrology">Astrology</option>
                          <option value="Toys">Toys</option>
                          <option value="Flowers">Flowers</option>
                          <option value="Decor">Decor</option>
                        </>
                      ) : (
                        categories.map(c => (
                          <option key={c._id || c.id} value={c.name}>{c.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
                {/* Description - large & resizable */}
                <div className="admin__input-group" style={{ marginBottom: '10px' }}>
                  <label>Description</label>
                  <textarea className="admin__form-input" rows="6" style={{ resize: 'vertical', minHeight: '120px', width: '100%', boxSizing: 'border-box' }} placeholder="Product details..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}></textarea>
                </div>
                <div className="admin__input-group" style={{ marginTop: '15px' }}>
                  <label>Product Images</label>
                  <ImageUploader 
                    initialImages={form.images || (form.image ? [form.image] : [])} 
                    multiple={true}
                    onUploadSuccess={(urls) => {
                      const newImages = Array.isArray(urls) ? urls : [urls];
                      setForm(f => ({ ...f, images: newImages, image: newImages.length > 0 ? newImages[0] : '' }))
                    }} 
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="admin__form-section">
                <h4 className="admin__section-title">Pricing</h4>
                <div className="admin__form-grid admin__form-grid--3col">
                  <div className="admin__input-group">
                    <label>Regular / Old Price (₹)</label>
                    <input className="admin__form-input" type="number" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="5000" value={form.regularPrice} onChange={e => setForm(f => ({ ...f, regularPrice: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>Sale Price (₹) *</label>
                    <input className="admin__form-input" type="number" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="3500" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>Discount</label>
                    <input className="admin__form-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="Calculated automatically" value={form.discount} readOnly />
                  </div>
                </div>
              </div>

              {/* Inventory & Specifications */}
              <div className="admin__form-section">
                <h4 className="admin__section-title">Inventory & Specifications</h4>
                <div className="admin__form-grid admin__form-grid--3col">
                  <div className="admin__input-group">
                    <label>Stock Quantity</label>
                    <input 
                      className="admin__form-input" 
                      type="number" 
                      style={{ width: '100%', boxSizing: 'border-box', backgroundColor: form.colors?.length > 0 ? '#f3f4f6' : '#fff' }} 
                      placeholder="50" 
                      value={form.colors?.length > 0 
                        ? (Object.values(form.stock_by_color || {}).reduce((sum, val) => sum + (parseInt(val, 10) || 0), 0)) 
                        : form.stockQuantity
                      } 
                      onChange={e => {
                        if (!form.colors || form.colors.length === 0) {
                          setForm(f => ({ ...f, stockQuantity: e.target.value }));
                        }
                      }} 
                      readOnly={form.colors?.length > 0}
                      title={form.colors?.length > 0 ? "Calculated automatically from colors" : ""}
                    />
                  </div>
                  <div className="admin__input-group">
                    <label>Material</label>
                    <input className="admin__form-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="e.g. Solid Teak Wood" value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} />
                  </div>
                  <div className="admin__input-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Colors & Stock Variations</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#6b7280' }}>Select available colors and set individual stock quantities for each. Total stock will be automatically calculated.</p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                        {uniqueColors.map(c => {
                          const isSelected = form.colors?.includes(c);
                          return (
                            <button 
                              key={c}
                              type="button"
                              onClick={() => {
                                const newColors = isSelected ? form.colors.filter(col => col !== c) : [...(form.colors || []), c];
                                const newStockByColor = { ...form.stock_by_color };
                                if (!isSelected) newStockByColor[c] = form.stock_by_color[c] || 0; // Initialize stock to 0
                                setForm(f => ({ ...f, colors: newColors, stock_by_color: newStockByColor }));
                              }}
                              style={{ 
                                padding: '6px 14px', 
                                borderRadius: '20px', 
                                border: isSelected ? '1px solid #d96b27' : '1px solid #d1d5db',
                                background: isSelected ? '#fff4ed' : '#ffffff',
                                color: isSelected ? '#d96b27' : '#374151',
                                fontSize: '13px',
                                fontWeight: isSelected ? '600' : '400',
                                cursor: 'pointer'
                              }}
                            >
                              {isSelected && <span style={{ marginRight: '6px' }}>✓</span>}
                              {c}
                            </button>
                          );
                        })}
                      </div>

                      {form.colors?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                          {form.colors.map(col => (
                            <div key={col} style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                              <span 
                                title={col} 
                                style={{ fontSize: '13px', fontWeight: '600', marginRight: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}
                              >
                                {col}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Qty</span>
                                <input 
                                  type="number"
                                  className="admin__form-input"
                                  style={{ width: '60px', padding: '4px 8px', margin: 0, height: '30px', fontSize: '13px' }}
                                  placeholder="0"
                                  min="0"
                                  value={form.stock_by_color?.[col] ?? ''}
                                  onChange={e => {
                                    const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                    setForm(f => ({ ...f, stock_by_color: { ...f.stock_by_color, [col]: val } }));
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="admin__input-group">
                    <label>Dimensions / Size</label>
                    <select className="admin__form-input" style={{ width: '100%', boxSizing: 'border-box' }} value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}>
                      <option value="">Select Size...</option>
                      {uniqueSizes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="admin__input-group">
                    <label>Dimensions (W x D x H)</label>
                    <input className="admin__form-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="e.g. W: 167cm x D: 47cm x H: 65cm" value={form.dimensions} onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>Weight</label>
                    <input className="admin__form-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="e.g. 45 kg" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>Brand</label>
                    <input className="admin__form-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="e.g. AstroGifts Studio" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
                  </div>
                  <div className="admin__input-group">
                    <label>Featured Product?</label>
                    <select className="admin__form-input" style={{ width: '100%', boxSizing: 'border-box' }} value={form.is_featured ? 'Yes' : 'No'} onChange={e => setForm(f => ({ ...f, is_featured: e.target.value === 'Yes' }))}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="admin__form-section">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                  <h4 className="admin__section-title" style={{margin: 0}}>Trust Badges & Policies</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(f => ({
                        ...f,
                        trust_badges: [...(f.trust_badges || []), { title: '', description: '', icon: 'return' }]
                      }));
                    }}
                    style={{
                      background: '#d96b27',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    + Add Badge
                  </button>
                </div>
                <p style={{fontSize: '13px', color: '#6b7280', marginBottom: '16px'}}>
                  Add, edit, or remove custom trust badges to display on the product detail page.
                </p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {(!form.trust_badges || form.trust_badges.length === 0) && (
                    <div style={{padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', fontSize: '13px'}}>
                      No trust badges added yet. Click "+ Add Badge" above to add one.
                    </div>
                  )}
                  {form.trust_badges?.map((badge, index) => (
                    <div key={index} style={{display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative'}}>
                      <div className="admin__input-group" style={{marginBottom: 0, flex: '1 1 180px'}}>
                        <label>Title</label>
                        <input className="admin__form-input" style={{width: '100%', boxSizing: 'border-box'}} placeholder="e.g. 7 Days Return" value={badge.title || ''} onChange={e => {
                          const newBadges = [...form.trust_badges];
                          newBadges[index] = { ...newBadges[index], title: e.target.value };
                          setForm(f => ({ ...f, trust_badges: newBadges }));
                        }} />
                      </div>
                      <div className="admin__input-group" style={{marginBottom: 0, flex: '1 1 200px'}}>
                        <label>Description</label>
                        <input className="admin__form-input" style={{width: '100%', boxSizing: 'border-box'}} placeholder="e.g. Easy return process" value={badge.description || ''} onChange={e => {
                          const newBadges = [...form.trust_badges];
                          newBadges[index] = { ...newBadges[index], description: e.target.value };
                          setForm(f => ({ ...f, trust_badges: newBadges }));
                        }} />
                      </div>
                      <div className="admin__input-group" style={{marginBottom: 0, flex: '0 0 120px'}}>
                        <label>Icon</label>
                        <select className="admin__form-input" style={{width: '100%', boxSizing: 'border-box'}} value={badge.icon || 'return'} onChange={e => {
                          const newBadges = [...form.trust_badges];
                          newBadges[index] = { ...newBadges[index], icon: e.target.value };
                          setForm(f => ({ ...f, trust_badges: newBadges }));
                        }}>
                          <option value="return">Return</option>
                          <option value="warranty">Warranty</option>
                          <option value="truck">Delivery</option>
                          <option value="lock">Secure</option>
                          <option value="star">Star</option>
                          <option value="shield">Shield</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newBadges = form.trust_badges.filter((_, i) => i !== index);
                          setForm(f => ({ ...f, trust_badges: newBadges }));
                        }}
                        title="Delete Badge"
                        style={{
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0 12px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          height: '38px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justify: 'center'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Status */}
              <div className="admin__form-section">
                <h4 className="admin__section-title">Product Status</h4>
                <div className="admin__form-grid admin__form-grid--2col">
                  <div className="admin__input-group">
                    <label>Status</label>
                    <select className="admin__form-input" style={{ width: '100%', boxSizing: 'border-box' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Coming Soon">Coming Soon</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                  <div className="admin__input-group">
                    <label>Featured</label>
                    <select className="admin__form-input" style={{ width: '100%', boxSizing: 'border-box' }} value={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.value }))}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin__form-footer">
              <button className="admin__form-cancel-btn" onClick={handleCancel}>Cancel</button>
              <button className="admin__form-save-btn" onClick={handleSaveProduct} disabled={saving}>
                {saving ? 'Saving...' : (editingProductId ? 'Update Product' : 'Save Product')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin__table-wrap" style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
        <table className="admin__table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>#</th>
              <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b', textAlign: 'center' }}>Images</th>
              <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b', textAlign: 'center' }}>Product Name</th>
              <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Category</th>
              <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Price</th>
              <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Date Added</th>
              <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</td></tr>
            ) : paginatedProducts.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                {dateFilter ? `No products found on ${dateFilter}.` : 'No products found. Click "+ Add Product" to add one.'}
              </td></tr>
            ) : paginatedProducts.map((p, idx) => (
              <tr key={p.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px', fontSize: '13px', fontWeight: '500', color: '#1e293b' }}><span className="admin__order-id">{(currentPage - 1) * itemsPerPage + idx + 1}</span></td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee', display: 'inline-block' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ width: '42px', height: '42px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8">
                        <path d="M7 11V6a3 3 0 0 1 6 0v5" />
                        <rect x="5" y="11" width="14" height="6" rx="2" />
                        <path d="M7 17v4M17 17v4" />
                      </svg>
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px', textAlign: 'center', maxWidth: '200px' }}>
                  <strong style={{ 
                    fontSize: '14px', 
                    color: '#1e293b', 
                    display: 'block', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }} title={p.name}>
                    {p.name}
                  </strong>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>SKU: {p.sku}</div>
                </td>
                <td style={{ padding: '16px' }}><span className="admin__count-badge" style={{ background: '#f1f5f9', color: '#334155' }}>{p.category}</span></td>
                <td style={{ padding: '16px' }}><span className="admin__price-sale" style={{ fontSize: '14px', fontWeight: '600' }}>{p.price}</span></td>
                <td style={{ padding: '16px' }}><span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{p.date}</span></td>
                <td style={{ padding: '16px' }}>
                  <div className="admin__actions-cell" style={{ display: 'flex', gap: '8px' }}>
                    <button className="admin__action-btn admin__action-btn--edit" onClick={() => handleEditClick(p)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit
                    </button>
                    <button className="admin__action-btn admin__action-btn--delete" onClick={() => handleDeleteProduct(p.id)} title="Delete product">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, displayedProducts.length)} of {displayedProducts.length} products
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  background: currentPage === 1 ? '#f1f5f9' : '#fff',
                  color: currentPage === 1 ? '#94a3b8' : '#334155',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Previous
              </button>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(totalPages)].map((_, i) => {
                  if (totalPages > 7 && i !== 0 && i !== totalPages - 1 && Math.abs(i + 1 - currentPage) > 1) {
                    if (Math.abs(i + 1 - currentPage) === 2) return <span key={i} style={{ padding: '4px' }}>...</span>;
                    return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: currentPage === i + 1 ? 'none' : '1px solid #cbd5e1',
                        borderRadius: '6px',
                        background: currentPage === i + 1 ? '#3b82f6' : '#fff',
                        color: currentPage === i + 1 ? '#fff' : '#334155',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  background: currentPage === totalPages ? '#f1f5f9' : '#fff',
                  color: currentPage === totalPages ? '#94a3b8' : '#334155',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── SHARED: Orders Table ── */
const getAdminOrderStatusStyle = (status) => {
  switch (status) {
    case 'Delivered':          return { bg: '#dcfce7', color: '#15803d', border: '#86efac', shadow: 'rgba(21, 128, 61, 0.4)' };
    case 'Shipped':            return { bg: '#dbeafe', color: '#16a34a', border: '#93c5fd', shadow: 'rgba(34, 197, 94, 0.6)' };
    case 'Processing':         return { bg: '#fef3c7', color: '#0284c7', border: '#fde68a', shadow: 'rgba(2, 132, 199, 0.4)' };
    case 'Pending':            return { bg: '#fef3c7', color: '#b45309', border: '#fde68a', shadow: 'rgba(180, 83, 9, 0.4)' };
    case 'Return Requested':   return { bg: '#ffedd5', color: '#c2410c', border: '#fdba74', shadow: 'rgba(194, 65, 12, 0.4)' };
    case 'Return Approved':    return { bg: '#f3e8ff', color: '#7e22ce', border: '#d8b4fe', shadow: 'rgba(126, 34, 206, 0.4)' };
    case 'Return Rejected':    return { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', shadow: 'rgba(185, 28, 28, 0.4)' };
    case 'Exchange Requested': return { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc', shadow: 'rgba(3, 105, 161, 0.4)' };
    case 'Exchange Approved':  return { bg: '#e0e7ff', color: '#4338ca', border: '#a5b4fc', shadow: 'rgba(67, 56, 202, 0.4)' };
    case 'Refunded':           return { bg: '#ccfbf1', color: '#0f766e', border: '#5eead4', shadow: 'rgba(15, 118, 110, 0.4)' };
    case 'Cancelled':          return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', shadow: 'rgba(153, 27, 27, 0.4)' };
    default:                   return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', shadow: 'rgba(71, 85, 105, 0.4)' };
  }
};

function OrdersTable({ data, onStatusChange, onViewOrder }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [data, totalPages, currentPage]);

  const paginatedData = data?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  return (
    <div className="admin__table-wrap" style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
      <table className="admin__table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <tr>
            <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>S.No.</th>
            <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Name</th>
            <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Date</th>
            <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Status</th>
            <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Amount</th>
            <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Shipping Status</th>
            <th style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No orders found.</td></tr>
          ) : paginatedData.map((o, idx) => {
            return (
              <tr key={o.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px', fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                  {(currentPage - 1) * itemsPerPage + idx + 1}
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>
                  {o.customer}
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
                  {o.date}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ position: 'relative', display: 'inline-block', width: '150px' }}>
                    <select
                      value={o.status}
                      onChange={e => onStatusChange && onStatusChange(o.id, o.numericId, e.target.value)}
                      style={{
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '6px 28px 6px 12px',
                        fontSize: '13px',
                        color: '#475569',
                        width: '100%',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Return Requested">Return Requested</option>
                      <option value="Return Approved">Return Approved</option>
                      <option value="Return Rejected">Return Rejected</option>
                      <option value="Refunded">Refunded</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 'bold', color: '#000' }}>
                  {o.amount}
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
                  {(() => {
                    const styleConfig = getAdminOrderStatusStyle(o.status);
                    return (
                      <span style={{
                        color: styleConfig.color,
                        textShadow: `0 0 10px ${styleConfig.shadow}`,
                        fontWeight: '600'
                      }}>
                        {o.status}
                      </span>
                    );
                  })()}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      onClick={() => onViewOrder && onViewOrder(o)}
                      style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: '#eff6ff',
                      color: '#4f46e5',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }} title="View Details">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View
                    </button>
                    <button style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px',
                      width: '32px',
                      height: '32px',
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }} title="Delete Order">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} orders
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: currentPage === 1 ? '#f1f5f9' : '#fff',
                color: currentPage === 1 ? '#94a3b8' : '#334155',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              Previous
            </button>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: currentPage === i + 1 ? 'none' : '1px solid #cbd5e1',
                    borderRadius: '6px',
                    background: currentPage === i + 1 ? '#3b82f6' : '#fff',
                    color: currentPage === i + 1 ? '#fff' : '#334155',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: currentPage === totalPages ? '#f1f5f9' : '#fff',
                color: currentPage === totalPages ? '#94a3b8' : '#334155',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── REVIEWS (TESTIMONIALS) ── */
function PageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    user_name: '',
    image: '',
    rating: 5,
    comment: '',
    status: 'Active',
    product_name: 'Premium Furniture'
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReviews();
      if (res && res.data && Array.isArray(res.data)) {
        setReviews(res.data);
      }
    } catch (e) {
      console.error("Backend reviews fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const getReviewStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved' || s === 'active') {
      return { bg: '#dcfce7', color: '#15803d', border: '#86efac', value: 'Approved' };
    }
    if (s === 'rejected' || s === 'inactive') {
      return { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', value: 'Rejected' };
    }
    return { bg: '#fef3c7', color: '#b45309', border: '#fcd34d', value: 'Pending' };
  };

  const openAddModal = () => {
    setEditingReview(null);
    setForm({
      user_name: '',
      image: '',
      rating: 5,
      comment: '',
      status: 'Approved',
      product_name: 'Premium Furniture'
    });
    setShowModal(true);
  };

  const openEditModal = (review) => {
    setEditingReview(review);
    setForm({
      user_name: review.user_name || review.name || '',
      image: review.user_image || review.image || '',
      rating: review.rating || 5,
      comment: review.comment || review.message || '',
      status: getReviewStatusBadge(review.status).value,
      product_name: review.product_name || 'Premium Furniture'
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.user_name.trim()) {
      alert("Customer Name is required");
      return;
    }
    if (!form.comment.trim()) {
      alert("Review Message is required");
      return;
    }

    setSaving(true);
    const fallbackImg = form.image.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.user_name.trim())}&background=fbe2d0&color=d96b27`;

    try {
      if (editingReview) {
        const id = editingReview.id || editingReview._id;
        await adminApi.updateReview(id, {
          user_name: form.user_name.trim(),
          image: fallbackImg,
          user_image: fallbackImg,
          rating: Number(form.rating),
          comment: form.comment.trim(),
          status: form.status,
          product_name: form.product_name
        });
        setToast('Review updated successfully!');
      } else {
        await adminApi.addReview({
          user_name: form.user_name.trim(),
          image: fallbackImg,
          user_image: fallbackImg,
          rating: Number(form.rating),
          comment: form.comment.trim(),
          status: form.status,
          product_name: form.product_name
        });
        setToast('Review created successfully!');
      }

      setShowModal(false);
      await fetchReviews();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleDelete = async (review) => {
    const id = review.id || review._id;
    if (!window.confirm(`Are you sure you want to delete the review from "${review.user_name || review.name}"?`)) return;

    try {
      await adminApi.deleteReview(id);
      setToast('Review deleted successfully!');
      await fetchReviews();
    } catch (err) {
      alert("Error deleting review: " + err.message);
    } finally {
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleStatusChange = async (review, newStatus) => {
    const id = review.id || review._id;
    setReviews(prev => prev.map(r => (r.id === id || r._id === id) ? { ...r, status: newStatus } : r));

    try {
      await adminApi.updateReview(id, { status: newStatus });
      setToast(`Review status changed to ${newStatus}!`);
    } catch (err) {
      alert("Error updating status: " + err.message);
      await fetchReviews();
    } finally {
      setTimeout(() => setToast(''), 2500);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const q = search.toLowerCase();
    const name = (r.user_name || r.name || '').toLowerCase();
    const msg = (r.comment || r.message || '').toLowerCase();
    return name.includes(q) || msg.includes(q);
  });

  return (
    <div className="admin__page-panel" style={{ padding: '24px 32px' }}>
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '32px',
          background: '#198754',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          zIndex: 99999,
          fontSize: '13.5px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}

      {/* Header matching screenshot 2 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '22px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
            Reviews
          </h2>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Manage customer reviews
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '8px 12px 8px 32px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
                width: '190px'
              }}
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '10px' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>

          <button
            onClick={openAddModal}
            id="add-review-btn"
            style={{
              background: '#18181b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#27272a'}
            onMouseOut={e => e.currentTarget.style.background = '#18181b'}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> Add Review
          </button>
        </div>
      </div>

      {/* Table wrapping card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #ede9e3',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}>
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
            Loading reviews...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
            {search ? 'No reviews matching your search.' : 'No customer reviews found. Click "+ Add Review" to create one.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f3f5' }}>
                  <th style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '700', color: '#111827', width: '60px' }}>S.No.</th>
                  <th style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '700', color: '#111827', width: '80px' }}>Image</th>
                  <th style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '700', color: '#111827', width: '160px' }}>Name</th>
                  <th style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '700', color: '#111827' }}>Message</th>
                  <th style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '700', color: '#111827', width: '140px' }}>Rating</th>
                  <th style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '700', color: '#111827', width: '100px' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '700', color: '#111827', width: '130px', whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((r, idx) => {
                  const itemImg = r.product_image || r.image || r.user_image || '/chair1.jpg';
                  const userName = r.user_name || r.name || 'Anonymous';
                  const prodName = r.product_name || '';
                  const userMsg = r.comment || r.message || '';
                  const userRating = Number(r.rating) || 5;
                  const isActive = (r.status === 'Active' || !r.status);

                  return (
                    <tr
                      key={r.id || r._id || idx}
                      style={{ borderBottom: '1px solid #f8f9fa', transition: 'background 0.15s' }}
                      onMouseOver={e => e.currentTarget.style.background = '#fafaf9'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* S.No. */}
                      <td style={{ padding: '14px 18px', fontSize: '13.5px', color: '#374151', fontWeight: '500' }}>
                        {idx + 1}
                      </td>

                      {/* Image */}
                      <td style={{ padding: '14px 18px' }}>
                        <img
                          src={itemImg}
                          alt={prodName || userName}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid #eaeaea',
                            display: 'block'
                          }}
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = '/chair1.jpg';
                          }}
                        />
                      </td>

                      {/* Name & Product */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#111827' }}>
                          {userName}
                        </div>
                        {prodName && (
                          <div style={{ fontSize: '11.5px', color: '#d96b27', fontWeight: '500', marginTop: '2px' }}>
                            {prodName}
                          </div>
                        )}
                      </td>

                      {/* Message */}
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#374151', lineHeight: '1.5', maxWidth: '360px' }}>
                        <div style={{
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          textOverflow: 'ellipsis'
                        }} title={userMsg}>
                          {userMsg}
                        </div>
                      </td>

                      {/* Rating */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ color: '#eab308', fontSize: '14px', letterSpacing: '1px' }}>
                            {'★'.repeat(Math.min(5, Math.max(1, userRating)))}
                            {'☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(1, userRating))))}
                          </span>
                          <span style={{ color: '#4b5563', fontSize: '12.5px', fontWeight: '500' }}>
                            ({userRating})
                          </span>
                        </div>
                      </td>

                      {/* Status: 3 options (Pending, Approved, Rejected) */}
                      <td style={{ padding: '14px 18px' }}>
                        {(() => {
                          const badge = getReviewStatusBadge(r.status);
                          return (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <select
                                value={badge.value}
                                onChange={e => handleStatusChange(r, e.target.value)}
                                title="Change review status: Pending, Approved, or Rejected"
                                style={{
                                  appearance: 'none',
                                  WebkitAppearance: 'none',
                                  MozAppearance: 'none',
                                  background: badge.bg,
                                  color: badge.color,
                                  border: `1px solid ${badge.border}`,
                                  borderRadius: '16px',
                                  padding: '4px 24px 4px 12px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  outline: 'none',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <option value="Pending" style={{ background: '#ffffff', color: '#b45309' }}>Pending</option>
                                <option value="Approved" style={{ background: '#ffffff', color: '#15803d' }}>Approved</option>
                                <option value="Rejected" style={{ background: '#ffffff', color: '#b91c1c' }}>Rejected</option>
                              </select>
                              <span style={{
                                position: 'absolute',
                                right: '9px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                fontSize: '8px',
                                color: badge.color
                              }}>
                                ▼
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Edit button with icon and text */}
                          <button
                            onClick={() => openEditModal(r)}
                            title="Edit Review"
                            style={{
                              background: '#eef2ff',
                              color: '#4f46e5',
                              border: 'none',
                              borderRadius: '7px',
                              padding: '6px 14px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.18s ease'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'}
                            onMouseOut={e => e.currentTarget.style.background = '#eef2ff'}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            <span>Edit</span>
                          </button>

                          {/* Delete button (X button) */}
                          <button
                            onClick={() => handleDelete(r)}
                            title="Delete Review"
                            style={{
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: 'none',
                              borderRadius: '7px',
                              width: '32px',
                              height: '32px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.18s ease'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#fecaca'}
                            onMouseOut={e => e.currentTarget.style.background = '#fee2e2'}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add / Edit Review */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 45px rgba(0,0,0,0.22)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #f1f3f5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#111827' }}>
                {editingReview ? 'Edit Review' : 'Add New Review'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ padding: '22px 24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Customer Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nia Sharma"
                  value={form.user_name}
                  onChange={e => setForm({ ...form, user_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Customer Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (optional)"
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', display: 'block' }}>
                  Leave blank to auto-generate a profile avatar
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Rating <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={form.rating}
                    onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★☆ (4 Stars)</option>
                    <option value={3}>★★★☆☆ (3 Stars)</option>
                    <option value={2}>★★☆☆☆ (2 Stars)</option>
                    <option value={1}>★☆☆☆☆ (1 Star)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Review Message <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter the customer review message here..."
                  value={form.comment}
                  onChange={e => setForm({ ...form, comment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '9px 18px',
                    border: '1px solid #d1d5db',
                    background: '#fff',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '9px 20px',
                    border: 'none',
                    background: '#d96b27',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(217,107,39,0.2)'
                  }}
                >
                  {saving ? 'Saving...' : (editingReview ? 'Update Review' : 'Save Review')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SIDEBAR NAV CONFIG
══════════════════════════════════════════════════ */
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },

  { id: 'post',      label: 'Post',      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
  { id: 'sliders',   label: 'Sliders',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  {
    id: 'product', label: 'Product', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    children: [
      { id: 'categories',label: 'Categories',icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
      { id: 'all-products',label: 'All Products',icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
      { id: 'colors', label: 'Colors', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.75 1.7-1.67 0-.42-.16-.82-.46-1.14-.3-.32-.47-.74-.47-1.19 0-.92.75-1.67 1.67-1.67H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"/></svg> },
      { id: 'sizes', label: 'Sizes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/><path d="m14.5 3.5 2 2"/><path d="m11.5 6.5 2 2"/><path d="m8.5 9.5 2 2"/><path d="m5.5 12.5 2 2"/></svg> },

    ],
  },
  { id: 'orders',    label: 'Orders',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
  { id: 'reviews',   label: 'Reviews',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { id: 'users',     label: 'Users',     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: 'settings',  label: 'Settings',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard',   categories: 'Categories', post: 'Post',
  sliders: 'Sliders',
  'all-products': 'Product › All Products',
  colors: 'Product › Colors',
  sizes: 'Product › Sizes',
  sku: 'Product › SKU',     price: 'Product › Price',
  description: 'Product › Description',
  orders: 'Orders',         reviews: 'Reviews',  users: 'Users',      settings: 'Settings',
};
function PageContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const fetchContacts = () => {
    setLoading(true);
    contactApi.getAll().then(res => setContacts(res)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Kya aap is message ko delete karna chahte hain?')) return;
    try {
      await contactApi.delete(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      alert('Delete karte waqt koi error aaya. Dobara try karein.');
    }
  };

  const handleReply = (email, name) => {
    const subject = encodeURIComponent('Re: Your message to AstroGifts');
    const body = encodeURIComponent(`Hi ${name},\n\nThank you for reaching out to us!\n\n`);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const tdStyle = { padding: '13px 14px', borderBottom: '1px solid #e2e8f0', fontSize: '13.5px', verticalAlign: 'middle' };
  const thStyle = { padding: '12px 14px', borderBottom: '2px solid #e2e8f0', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', background: '#f8fafc', textAlign: 'left' };

  return (
    <div className="admin__page-panel">
      <h2 className="admin__panel-title">Contacts</h2>

      {/* Full Message Modal */}
      {selectedMsg && (
        <div
          onClick={() => setSelectedMsg(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '14px', padding: '28px 32px', maxWidth: '520px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Message from {selectedMsg.name}</h3>
              <button onClick={() => setSelectedMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ marginBottom: '8px', fontSize: '13px', color: '#64748b' }}>
              <strong>Email:</strong> {selectedMsg.email}
            </div>
            <div style={{ marginBottom: '8px', fontSize: '13px', color: '#64748b' }}>
              <strong>Date:</strong> {new Date(selectedMsg.created_at).toLocaleString()}
            </div>
            <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', fontSize: '14px', color: '#334155', lineHeight: '1.7', border: '1px solid #e2e8f0' }}>
              {selectedMsg.message}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => handleReply(selectedMsg.email, selectedMsg.name)}
                style={{ flex: 1, padding: '10px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Reply via Email
              </button>
              <button
                onClick={() => { handleDelete(selectedMsg.id); setSelectedMsg(null); }}
                style={{ padding: '10px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '7px' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p>Loading...</p> : contacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div style={{ fontSize: '15px', fontWeight: '600' }}>Koi message nahi mila abhi tak</div>
        </div>
      ) : (
        <table className="admin__table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Message</th>
              <th style={thStyle}>Date</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c.id} style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ ...tdStyle, fontWeight: '600', color: '#1e293b' }}>{c.name}</td>
                <td style={{ ...tdStyle, color: '#475569' }}>{c.email}</td>
                <td style={{ ...tdStyle, color: '#64748b', maxWidth: '280px' }}>
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.message}
                  </span>
                  {c.message && c.message.length > 80 && (
                    <button
                      onClick={() => setSelectedMsg(c)}
                      style={{ background: 'none', border: 'none', color: '#d96b27', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: '2px 0', display: 'block', marginTop: '2px' }}
                    >
                      View full message →
                    </button>
                  )}
                </td>
                <td style={{ ...tdStyle, color: '#94a3b8', whiteSpace: 'nowrap', fontSize: '12px' }}>
                  {new Date(c.created_at).toLocaleString()}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {/* Reply Button */}
                    <button
                      onClick={() => handleReply(c.email, c.name)}
                      title="Reply via Email"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      Reply
                    </button>
                    {/* View Button */}
                    <button
                      onClick={() => setSelectedMsg(c)}
                      title="View Full Message"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#d96b27'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#d96b27'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Delete Message"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 10px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PageFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    faqApi.getAll().then(res => setFaqs(res)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin__page-panel">
      <h2 className="admin__panel-title">FAQs</h2>
      {loading ? <p>Loading...</p> : (
        <table className="admin__table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Question</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Answer</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Order</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map(f => (
              <tr key={f.id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>{f.question}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>{f.answer}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>{f.sort_order}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function AdminDashboard({ onLogout }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage]       = useState(() => localStorage.getItem('admin_active_page') || 'dashboard');
  const [productOpen, setProductOpen]     = useState(() => localStorage.getItem('admin_product_open') === 'true');

  useEffect(() => {
    localStorage.setItem('admin_active_page', activePage);
  }, [activePage]);

  useEffect(() => {
    localStorage.setItem('admin_product_open', productOpen);
  }, [productOpen]);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await logout();
      navigate('/admin/login');
    }
  };

  const goTo = (id) => {
    setActivePage(id);
    if (['all-products','sku','price','description','categories','colors','sizes'].includes(id)) setProductOpen(true);
  };

function PageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleViewOrder = (order) => setSelectedOrder(order);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getOrders();
        if (res && res.data && res.data.length > 0) {
          const mappedOrders = res.data.map(o => ({
            id: o.order_number || `#ORD-${o.id}`,
            numericId: o.order_number || o.id || o._id,
            raw: o,
            customer: o.customer_name || 'Guest',
            email: o.email || '',
            phone: o.phone || '',
            payment: o.payment_method || '',
            product: o.items && o.items.length > 0 ? (o.items[0].product_name + (o.items.length > 1 ? ` +${o.items.length - 1} more` : '')) : 'Furniture Item',
            amount: '₹' + Number(o.total || 0).toLocaleString(),
            status: o.status ? o.status.replace(/\b\w/g, l => l.toUpperCase()) : 'Pending',
            return_type: o.return_type || '',
            return_reason: o.return_reason || '',
            return_notes: o.return_notes || '',
            return_bank_details: o.return_bank_details || '',
            created_at: o.created_at || null,
            date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (o.date || 'Recently'),
          }));
          setOrders(mappedOrders);
        } else {
          setOrders([]);
        }
      } catch (e) {
        console.warn('Orders API failed:', e.message);
        setOrders([]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, numericId, newStatus) => {
    const isReturnExchange = ['Return Requested', 'Return Approved', 'Return Rejected', 'Exchange Requested', 'Exchange Approved'].includes(newStatus);
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status: newStatus,
      return_reason: isReturnExchange ? o.return_reason : '',
      return_type: isReturnExchange ? o.return_type : '',
      return_notes: isReturnExchange ? o.return_notes : '',
    } : o));
    const targetId = numericId || orderId;
    if (targetId) {
      try {
        await adminApi.updateOrderStatus(targetId, { status: newStatus });
      } catch (e) {
        console.error('Failed to update status', e);
      }
    }
  };

  const displayedOrders = useMemo(() => {
    let list = [...orders];

    if (dateFilter) {
      list = list.filter(o => {
        if (!o.created_at && !o.date) return false;
        const d = o.created_at ? new Date(o.created_at) : new Date(o.date);
        if (isNaN(d.getTime())) return false;
        const yyyyMmDd = d.toISOString().slice(0, 10);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const localDate = `${year}-${month}-${day}`;
        return localDate === dateFilter || yyyyMmDd === dateFilter;
      });
    }

    list.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : (a.date ? new Date(a.date).getTime() : 0);
      const timeB = b.created_at ? new Date(b.created_at).getTime() : (b.date ? new Date(b.date).getTime() : 0);
      return timeB - timeA;
    });

    return list;
  }, [orders, dateFilter]);

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between' }}>
        <div>
          <h2 className="admin__panel-title" style={{ fontSize: '24px', fontWeight: 'bold' }}>Orders</h2>
          <p className="admin__panel-sub" style={{ fontSize: '14px', color: '#64748b' }}>Manage all customer orders</p>
        </div>

        <div style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontSize: '14px' }}>
          <span style={{ color: '#64748b' }}>Total Orders</span> <strong style={{ marginLeft: '8px' }}>{displayedOrders.length}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Filter by Date:
          </span>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: '#334155',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginLeft: '10px'
            }}
          />
        </div>
      </div>
      <OrdersTable data={displayedOrders} onStatusChange={handleStatusUpdate} onViewOrder={handleViewOrder} />

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="admin__modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin__detailed-form" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div className="admin__detailed-form-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Order Details ({selectedOrder.id})</h3>
              <button className="admin__form-close" onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Info</h4>
                <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: '500' }}>{selectedOrder.customer}</p>
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>{selectedOrder.email}</p>
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>{selectedOrder.phone}</p>
                {selectedOrder.raw?.shipping_address && (
                  <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                    <strong>Shipping Address:</strong><br/>
                    {selectedOrder.raw.shipping_address.street_address}<br/>
                    {selectedOrder.raw.shipping_address.city}, {selectedOrder.raw.shipping_address.state} {selectedOrder.raw.shipping_address.postal_code}
                  </p>
                )}
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Info</h4>
                <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: '500' }}>Amount: <span style={{ color: '#000' }}>{selectedOrder.amount}</span></p>
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>Method: <span style={{ textTransform: 'uppercase' }}>{selectedOrder.payment}</span></p>
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>Status: <strong>{selectedOrder.status}</strong></p>
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>Date: {selectedOrder.date}</p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items</h4>
              {selectedOrder.raw?.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: i !== selectedOrder.raw.items.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                  {(item.image || item.product_image || item.image_url) && (
                    <img src={item.image || item.product_image || item.image_url} alt={item.product_name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{item.product_name}</p>
                    <div style={{ marginTop: '4px' }}>
                      {item.size && <span style={{ fontSize: '12px', color: '#64748b', marginRight: '10px' }}>Size: {item.size}</span>}
                      {item.color && <span style={{ fontSize: '12px', color: '#64748b' }}>Color: {item.color}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>x{item.quantity || 1}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '600' }}>₹{item.price}</p>
                  </div>
                </div>
              ))}
              {(!selectedOrder.raw?.items || selectedOrder.raw.items.length === 0) && (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{selectedOrder.product}</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedOrder(null)} style={{ padding: '8px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── USERS PAGE ── */
function PageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminApi.getUsers();
        if (res && res.data) {
          setUsers(res.data);
        }
      } catch (e) {
        // Fallback dummy data
        setUsers([]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">Users</h2>
          <p className="admin__panel-sub">Manage registered customers and admins</p>
        </div>
      </div>
      <div className="admin__table-wrap">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div>
        ) : (
        <table className="admin__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User Name</th>
              <th>Email</th>
              <th>Phone No.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id}>
                <td><span className="admin__order-id">{idx + 1}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="admin__customer-avatar">{u.name.charAt(0)}</span>
                    <strong style={{ color: '#111', fontSize: '14px' }}>{u.name}</strong>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>
                  <div className="admin__actions-cell">
                    <button className="admin__action-btn admin__action-btn--edit" title="Edit User"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button>
                    <button className="admin__action-btn admin__action-btn--delete" title="Delete User"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

/* ── SETTINGS PAGE ── */
function PageSettings() {
  const [razorpayMode, setRazorpayMode] = useState('test'); // 'test' or 'live'
  const [formData, setFormData] = useState({
    razorpayKeyId: 'rzp_test_TWLMva2WMHr864',
    razorpaySecret: 'C4wy66QaYjPwBkTMGSPWfRKP',
    razorpayLiveKeyId: '',
    razorpayLiveSecret: '',
    shiprocketKey: 'XFf2@IVCaj^xeUDj352b&YDK@XzHnmgj',
    shiprocketSecret: ''
  });
  const [showKeys, setShowKeys] = useState({ rzpKey: false, rzpSec: false, shipKey: false, shipSec: false });

  const toggleKey = (field) => setShowKeys(prev => ({ ...prev, [field]: !prev[field] }));

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  const isTestMode = razorpayMode === 'test';
  const rzpKeyField = isTestMode ? 'razorpayKeyId' : 'razorpayLiveKeyId';
  const rzpSecField = isTestMode ? 'razorpaySecret' : 'razorpayLiveSecret';

  return (
    <div className="admin__page-panel" style={{ background: '#f5f7f9', padding: '24px' }}>
      <div className="admin__panel-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="admin__panel-title">Settings</h2>
          <p className="admin__panel-sub">Manage your integrations and API keys.</p>
        </div>
      </div>
      
      <form onSubmit={handleSave} style={{ maxWidth: '1200px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Razorpay Card */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>Razorpay</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Online payment gateway configuration</p>
              </div>
            </div>

            {/* Test / Live Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '8px', padding: '4px', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setRazorpayMode('test')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '700', transition: 'all 0.2s',
                  background: isTestMode ? '#fef3c7' : 'transparent',
                  color: isTestMode ? '#b45309' : '#6b7280',
                  boxShadow: isTestMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
                Test
              </button>
              <button
                type="button"
                onClick={() => setRazorpayMode('live')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '700', transition: 'all 0.2s',
                  background: !isTestMode ? '#dcfce7' : 'transparent',
                  color: !isTestMode ? '#16a34a' : '#6b7280',
                  boxShadow: !isTestMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill={!isTestMode ? '#16a34a' : '#9ca3af'} stroke="none"><circle cx="12" cy="12" r="10"/></svg>
                Live
              </button>
            </div>
          </div>

          {/* Mode Banner */}
          <div style={{
            padding: '8px 24px', fontSize: '12px', fontWeight: '600',
            background: isTestMode ? '#fffbeb' : '#f0fdf4',
            color: isTestMode ? '#b45309' : '#15803d',
            borderBottom: `1px solid ${isTestMode ? '#fde68a' : '#bbf7d0'}`,
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            {isTestMode
              ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Test Mode — Payments will NOT be charged</>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Live Mode — Real payments will be processed</>
            }
          </div>
          
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                {isTestMode ? 'Test' : 'Live'} API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showKeys.rzpKey ? "text" : "password"} name={rzpKeyField} value={formData[rzpKeyField]} onChange={handleChange} placeholder={`Enter ${isTestMode ? 'test' : 'live'} API key`} style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
                <button type="button" onClick={() => toggleKey('rzpKey')} style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                  {showKeys.rzpKey ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                {isTestMode ? 'Test' : 'Live'} API Secret
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showKeys.rzpSec ? "text" : "password"} name={rzpSecField} value={formData[rzpSecField]} onChange={handleChange} placeholder={`Enter ${isTestMode ? 'test' : 'live'} API secret`} style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
                <button type="button" onClick={() => toggleKey('rzpSec')} style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                  {showKeys.rzpSec ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shiprocket Card */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#fff7ed', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>Shiprocket</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Shipping and delivery configuration</p>
            </div>
          </div>
          
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Shiprocket API Key</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '10px', color: '#d97706' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg></div>
                <input type={showKeys.shipKey ? "text" : "password"} name="shiprocketKey" value={formData.shiprocketKey} onChange={handleChange} placeholder="Enter Shiprocket API Key" style={{ width: '100%', padding: '10px 40px 10px 40px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
                <button type="button" onClick={() => toggleKey('shipKey')} style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                  {showKeys.shipKey ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Shiprocket API Secret</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '10px', color: '#d97706' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
                <input type={showKeys.shipSec ? "text" : "password"} name="shiprocketSecret" value={formData.shiprocketSecret} onChange={handleChange} placeholder="Enter Shiprocket API Secret" style={{ width: '100%', padding: '10px 40px 10px 40px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
                <button type="button" onClick={() => toggleKey('shipSec')} style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                  {showKeys.shipSec ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice Card & Button */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
            <div style={{ width: '40px', height: '40px', background: '#ecfdf5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>Security Notice</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>API secret keys should never be exposed in frontend code. Store securely.</p>
            </div>
          </div>

          <button type="submit" style={{ background: '#d96b27', color: '#fff', padding: '16px 32px', height: '100%', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap' }}>
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':   return <PageDashboard setActivePage={setActivePage} />;
      case 'menu':        return <PageMenu />;
      case 'post':        return <PagePost />;
      case 'sliders':     return <PageSliders />;
      case 'all-products':return <PageAllProducts />;
      case 'categories':  return <PageCategories />;
      case 'colors':      return <PageColors />;
      case 'sizes':       return <PageSizes />;
      case 'description': return <PageDescription />;
      case 'orders':      return <PageOrders />;
      case 'reviews':     return <PageReviews />;
      case 'users':       return <PageUsers />;
      case 'settings':    return <PageSettings />;
      default: return (
        <div className="admin__page-panel">
          <div className="admin__panel-header"><div><h2 className="admin__panel-title">{PAGE_TITLES[activePage] || activePage}</h2><p className="admin__panel-sub">Coming soon…</p></div></div>
          <div className="admin__coming-soon">🚧 This section is under construction</div>
        </div>
      );
    }
  };

  return (
    <div className="admin">
      {/* ── SIDEBAR ── */}
      <aside className="admin__sidebar">
        <div className="admin__sidebar-brand">
          <div className="admin__sidebar-logo">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#d96b27"/>
              <path d="M8 28L20 10L32 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 22H27" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Admin</span>
          </div>
        </div>

        <nav className="admin__nav">
          {NAV.map(item => (
            <div key={item.id}>
              <button
                id={`admin-nav-${item.id}`}
                className={`admin__nav-item ${activePage === item.id || (item.children && item.children.some(c => c.id === activePage)) ? 'active' : ''}`}
                onClick={() => {
                  if (item.children) {
                    setProductOpen(o => !o);
                    if (!productOpen) goTo(item.children[0].id);
                  } else {
                    goTo(item.id);
                  }
                }}
              >
                <span className="admin__nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.children && (
                  <span className="admin__nav-arrow">{productOpen ? '▾' : '▸'}</span>
                )}
              </button>

              {/* Sub-menu (Product children) */}
              {item.children && productOpen && (
                <div className="admin__sub-nav">
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      id={`admin-nav-${child.id}`}
                      className={`admin__sub-nav-item ${activePage === child.id ? 'active' : ''}`}
                      onClick={() => goTo(child.id)}
                    >
                      <span className="admin__nav-icon">{child.icon}</span>
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <button className="admin__logout-btn" onClick={handleLogout} id="admin-logout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="admin__main">
        <header className="admin__topbar">
          <div className="admin__topbar-left">
            <h1 className="admin__page-title">{PAGE_TITLES[activePage] || activePage}</h1>
            <p className="admin__page-sub">Admin Panel</p>
          </div>
          <div className="admin__topbar-right">
            <div className="admin__topbar-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="admin__topbar-avatar">A</div>
          </div>
        </header>

        <div className="admin__content">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
