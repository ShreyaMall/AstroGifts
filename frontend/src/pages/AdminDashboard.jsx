
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_PRODUCTS } from '../data/categoryData';


/* ══════════════════════════════════════════════════
   MOCK DATA (Graceful fallback)
══════════════════════════════════════════════════ */
const STATS = [
  { label: 'Total Revenue',  value: '₹0', delta: '0%', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>, color: '#d96b27' },
  { label: 'Total Orders',   value: '0',   delta: '0%',  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>, color: '#2563eb' },
  { label: 'Total Products', value: '0',     delta: '0%',  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, color: '#16a34a' },
  { label: 'Total Users',    value: '0',   delta: '0%', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, color: '#7c3aed' },
];

const MOCK_ORDERS = [
  { id: '#ORD-1001', customer: 'Alice Johnson',  product: 'King-size Wooden Bed',   amount: '₹2,890', status: 'Delivered', date: 'Jul 28, 2026' },
  { id: '#ORD-1002', customer: 'Bob Smith',       product: 'Sectional Fabric Sofa',  amount: '₹3,620', status: 'Processing',date: 'Jul 29, 2026' },
  { id: '#ORD-1003', customer: 'Carol Williams',  product: 'Upholstered Chair',      amount: '₹468',   status: 'Shipped',   date: 'Jul 29, 2026' },
  { id: '#ORD-1004', customer: 'David Lee',       product: 'Terracotta Vase',        amount: '₹182',   status: 'Delivered', date: 'Jul 27, 2026' },
  { id: '#ORD-1005', customer: 'Eva Martinez',    product: 'Oak Coffee Table',       amount: '₹1,240', status: 'Pending',   date: 'Jul 30, 2026' },
];

const MOCK_MENU = [
  { id: 1, name: 'Chairs',    link: '/chairs',    order: 1, status: 'Active' },
  { id: 2, name: 'Tables',    link: '/tables',    order: 2, status: 'Active' },
  { id: 3, name: 'Sofas',     link: '/sofas',     order: 3, status: 'Active' },
  { id: 4, name: 'Armchairs', link: '/armchairs', order: 4, status: 'Active' },
  { id: 5, name: 'Beds',      link: '/beds',      order: 5, status: 'Active' },
  { id: 6, name: 'Storage',   link: '/storage',   order: 6, status: 'Inactive' },
  { id: 7, name: 'Lighting',  link: '/lighting',  order: 7, status: 'Active' },
  { id: 8, name: 'Decor',     link: '/decor',     order: 8, status: 'Inactive' },
];

const MOCK_POSTS = [
  { id: 1, title: '10 Tips for a Minimalist Living Room', category: 'Interior Design', status: 'Published', date: 'Jul 25, 2026' },
  { id: 2, title: 'How to Choose the Perfect Sofa',       category: 'Buying Guide',    status: 'Published', date: 'Jul 22, 2026' },
  { id: 3, title: 'Summer Collection 2026 Launch',        category: 'News',            status: 'Draft',     date: 'Jul 30, 2026' },
  { id: 4, title: 'Wood Types: Oak vs Walnut vs Pine',    category: 'Materials',       status: 'Published', date: 'Jul 18, 2026' },
  { id: 5, title: 'Bedroom Makeover on a Budget',         category: 'Interior Design', status: 'Draft',     date: 'Jul 29, 2026' },
];

const MOCK_SLIDERS = [
  { id: 1, title: 'Upholstered chair', subtitle: 'by Esther Howard', cta: 'Shop Now', price: '₹468',  bg: 'wd-furniture-slider-111.jpg.webp', status: 'Active' },
  { id: 2, title: 'Sectional fabric sofa', subtitle: 'by Ramón Esteve', cta: 'Shop Now', price: '₹3620', bg: 'wd-furniture-slider-112.jpg.webp', status: 'Active' },
  { id: 3, title: 'Terracotta vase', subtitle: 'by Courtney Henry', cta: 'Shop Now', price: '₹182',  bg: 'wd-furniture-slider-113.jpg.webp', status: 'Active' },
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Chairs',    slug: 'chairs',    count: 48, status: 'Active' },
  { id: 2, name: 'Tables',    slug: 'tables',    count: 32, status: 'Active' },
  { id: 3, name: 'Sofas',     slug: 'sofas',     count: 27, status: 'Active' },
  { id: 4, name: 'Armchairs', slug: 'armchairs', count: 19, status: 'Active' },
  { id: 5, name: 'Beds',      slug: 'beds',      count: 41, status: 'Active' },
  { id: 6, name: 'Storage',   slug: 'storage',   count: 23, status: 'Inactive' },
  { id: 7, name: 'Lighting',  slug: 'lighting',  count: 56, status: 'Active' },
  { id: 8, name: 'Decor',     slug: 'decor',     count: 88, status: 'Active' },
];

const MOCK_SKUS = [
  { id: 1, name: 'Upholstered Chair',      sku: 'WM-CHR-001', stock: 24, warehouse: 'Delhi' },
  { id: 2, name: 'King-size Wooden Bed',   sku: 'WM-BED-002', stock: 8,  warehouse: 'Mumbai' },
  { id: 3, name: 'Sectional Fabric Sofa',  sku: 'WM-SOF-003', stock: 12, warehouse: 'Delhi' },
  { id: 4, name: 'Oak Coffee Table',       sku: 'WM-TBL-004', stock: 31, warehouse: 'Bangalore' },
  { id: 5, name: 'Terracotta Vase',        sku: 'WM-DCR-005', stock: 67, warehouse: 'Delhi' },
  { id: 6, name: 'Rattan Armchair',        sku: 'WM-ARM-006', stock: 5,  warehouse: 'Mumbai' },
];

const MOCK_ALL_PRODUCTS = Object.values(CATEGORY_PRODUCTS).flat().map((p, i) => ({
  id: p.id || i + 1,
  name: p.name,
  category: p.category || 'Uncategorized',
  price: `₹${Number(p.price).toLocaleString()}`,
  stock: p.stock_quantity || Math.floor(Math.random() * 50) + 5,
  status: 'Active'
}));

const MOCK_PRICES = [
  { id: 1, name: 'Upholstered Chair',     original: '₹580',   sale: '₹468',   discount: '19%', currency: 'INR' },
  { id: 2, name: 'King-size Wooden Bed',  original: '₹3,200', sale: '₹2,890', discount: '10%', currency: 'INR' },
  { id: 3, name: 'Sectional Fabric Sofa', original: '₹4,100', sale: '₹3,620', discount: '12%', currency: 'INR' },
  { id: 4, name: 'Oak Coffee Table',      original: '₹1,450', sale: '₹1,240', discount: '14%', currency: 'INR' },
  { id: 5, name: 'Terracotta Vase',       original: '₹220',   sale: '₹182',   discount: '17%', currency: 'INR' },
  { id: 6, name: 'Rattan Armchair',       original: '₹1,000', sale: '₹875',   discount: '13%', currency: 'INR' },
];

const MOCK_DESCRIPTIONS = [
  { id: 1, name: 'Upholstered Chair',     short: 'Elegant upholstered chair with premium fabric.', full: 'Crafted with high-density foam cushioning and premium woven fabric. Features solid oak legs and ergonomic backrest for all-day comfort.' },
  { id: 2, name: 'King-size Wooden Bed',  short: 'Solid oak king-size bed with storage.',           full: 'Built from sustainably sourced solid oak. Features under-bed storage drawers, slatted base, and a padded headboard for ultimate luxury.' },
  { id: 3, name: 'Sectional Fabric Sofa', short: 'L-shaped sectional sofa in premium fabric.',      full: 'Modular L-shaped sofa with deep seat cushions. Covered in stain-resistant performance fabric. Includes 5 accent pillows. Seats 6 comfortably.' },
  { id: 4, name: 'Oak Coffee Table',      short: 'Minimalist oak coffee table.',                    full: 'Clean-lined coffee table in solid white oak. Features a lower shelf for storage and a smooth lacquered top surface. Perfect for modern interiors.' },
  { id: 5, name: 'Terracotta Vase',       short: 'Hand-crafted terracotta decorative vase.',        full: 'Each vase is hand-thrown by artisans in Rajasthan. Features a matte terracotta finish with subtle textural variations — no two pieces are identical.' },
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
function PageDashboard() {
  const [stats, setStats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

    // Merge API orders with LocalStorage orders (fallback)
    try {
      const saved = localStorage.getItem('woodmart_user_orders');
      if (saved) {
        const localOrders = JSON.parse(saved);
        // Combine them, avoiding duplicates by order_number
        const allOrders = [...localOrders, ...apiOrders];
        const unique = [];
        const seen = new Set();
        for (const o of allOrders) {
          const id = o.order_number || o.id;
          if (!seen.has(id)) {
            seen.add(id);
            unique.push(o);
          }
        }
        apiOrders = unique;
      }
    } catch(e) {}

    // Apply stats or fallback
    if (apiStats.length > 0) {
      setStats(STATS.map(stat => {
        const backendStat = apiStats.find(a => a.label === stat.label);
        return backendStat ? { ...stat, value: backendStat.value, delta: backendStat.delta } : stat;
      }));
    } else {
      setStats(STATS);
    }

    if (apiOrders.length > 0) {
      const mappedOrders = apiOrders.map(o => ({
        id: o.order_number || `#ORD-${o.id}`,
        numericId: o.id,
        customer: o.customer_name || 'Guest',
        email: o.email || '',
        phone: o.phone || '',
        payment: o.payment_method || '',
        product: o.items && o.items.length > 0 ? ((o.items[0].product_name || o.items[0].name || 'Product') + (o.items.length > 1 ? ` +${o.items.length - 1} more` : '')) : 'Furniture Item',
        amount: '₹' + Number(o.total || 0).toLocaleString(),
        status: o.status || 'Processing',
        date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
      }));
      setOrders(mappedOrders);
    } else {
      setOrders(MOCK_ORDERS);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusUpdate = async (orderId, numericId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (numericId) {
      try {
        await adminApi.updateOrderStatus(numericId, newStatus);
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
        <div className="admin__section-header">
          <h2 className="admin__section-title">Recent Orders</h2>
          <button className="admin__view-all" onClick={fetchDashboardData}>
            {loading ? 'Refreshing…' : 'Refresh Data ⟳'}
          </button>
        </div>
        <OrdersTable data={orders} onStatusChange={handleStatusUpdate} />
      </div>
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
  const [posts, setPosts]     = useState(MOCK_POSTS);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ title: '', category: '', status: 'Draft' });

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
          <h2 className="admin__panel-title">Posts</h2>
          <p className="admin__panel-sub">Manage blog posts and announcements</p>
        </div>
        <button className="admin__add-btn" onClick={() => setShowAdd(s => !s)} id="add-post-btn">+ Add Post</button>
      </div>

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
            {posts.map(p => (
              <tr key={p.id}>
                <td><span className="admin__order-id">{p.id}</span></td>
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
    </div>
  );
}

/* ── SLIDERS ── */
function PageSliders() {
  const [slides, setSlides] = useState(MOCK_SLIDERS);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', price: '', bg: '' });

  const toggleStatus = (id) =>
    setSlides(prev => prev.map(s => s.id === id
      ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' }
      : s
    ));

  const deleteSlide = (id) => setSlides(prev => prev.filter(s => s.id !== id));

  const addSlide = () => {
    if (!form.title) return;
    setSlides(prev => [...prev, { id: Date.now(), title: form.title, subtitle: form.subtitle, cta: 'Shop Now', price: form.price, bg: form.bg || 'placeholder.jpg', status: 'Active' }]);
    setShowAdd(false);
    setForm({ title: '', subtitle: '', price: '', bg: '' });
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">Hero Sliders</h2>
          <p className="admin__panel-sub">Manage homepage hero slider slides</p>
        </div>
        <button className="admin__add-btn" onClick={() => setShowAdd(!showAdd)} id="add-slide-btn">+ Add Slide</button>
      </div>

      {showAdd && (
        <div className="admin__inline-form">
          <input className="admin__form-input" placeholder="Slide Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <input className="admin__form-input" placeholder="Subtitle" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
          <input className="admin__form-input admin__form-input--sm" placeholder="Price" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
          <input className="admin__form-input admin__form-input--sm" placeholder="Image Name" value={form.bg} onChange={e => setForm(f => ({ ...f, bg: e.target.value }))} />
          <button className="admin__form-save" onClick={addSlide}>Save</button>
          <button className="admin__form-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      )}

      <div className="admin__slider-cards">
        {slides.map(slide => (
          <div className="admin__slider-card" key={slide.id}>
            <div className="admin__slider-card__preview">
              <div className="admin__slider-card__num">Slide {slide.id}</div>
            </div>
            <div className="admin__slider-card__body">
              <h3 className="admin__slider-card__title">{slide.title}</h3>
              <p className="admin__slider-card__sub">{slide.subtitle}</p>
              <div className="admin__slider-card__meta">
                <span className="admin__slider-meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px', verticalAlign: 'middle'}}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> {slide.price}</span>
                <span className="admin__slider-meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px', verticalAlign: 'middle'}}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg> {slide.cta}</span>
                <span className="admin__slider-meta-item admin__code admin__code--sm"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px', verticalAlign: 'middle'}}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> {slide.bg}</span>
              </div>
            </div>
            <div className="admin__slider-card__actions">
              <button className="admin__action-btn admin__action-btn--edit" onClick={() => toggleStatus(slide.id)} title="Toggle status"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><path d="M17 3l4 4-4 4"/><path d="M3 7h18"/><path d="M7 21l-4-4 4-4"/><path d="M21 17H3"/></svg> Toggle</button>
              <button className="admin__action-btn admin__action-btn--delete" onClick={() => deleteSlide(slide.id)} title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── PRODUCT: CATEGORIES ── */
function PageCategories() {
  const [cats, setCats]       = useState(MOCK_CATEGORIES);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ name: '', slug: '' });

  const deleteCat = (id) => setCats(prev => prev.filter(c => c.id !== id));
  const toggleCat = (id) =>
    setCats(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c));

  const addCat = () => {
    if (!form.name) return;
    setCats(prev => [...prev, { id: Date.now(), name: form.name, slug: form.slug || form.name.toLowerCase(), count: 0, status: 'Active' }]);
    setForm({ name: '', slug: '' });
    setShowAdd(false);
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">Product Categories</h2>
          <p className="admin__panel-sub">Organize your products into categories</p>
        </div>
        <button className="admin__add-btn" onClick={() => setShowAdd(s => !s)}>+ Add Category</button>
      </div>

      {showAdd && (
        <div className="admin__inline-form">
          <input className="admin__form-input" placeholder="Category Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="admin__form-input" placeholder="Slug (auto-generated)" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
          <button className="admin__form-save" onClick={addCat}>Save</button>
          <button className="admin__form-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      )}

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead><tr><th>#</th><th>Category Name</th><th>Slug</th><th>Products</th><th>Actions</th></tr></thead>
          <tbody>
            {cats.map(c => (
              <tr key={c.id}>
                <td><span className="admin__order-id">{c.id}</span></td>
                <td><strong>{c.name}</strong></td>
                <td><code className="admin__code">{c.slug}</code></td>
                <td><span className="admin__count-badge">{c.count}</span></td>
                <td>
                  <div className="admin__actions-cell">
                    <button className="admin__action-btn admin__action-btn--toggle" onClick={() => toggleCat(c.id)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3l4 4-4 4"/><path d="M3 7h18"/><path d="M7 21l-4-4 4-4"/><path d="M21 17H3"/></svg></button>
                    <button className="admin__action-btn admin__action-btn--delete" onClick={() => deleteCat(c.id)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
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
            {skus.map(s => (
              <tr key={s.id}>
                <td><span className="admin__order-id">{s.id}</span></td>
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
                    <button className="admin__action-btn admin__action-btn--edit">✏️ Edit</button>
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
            {prices.map(p => (
              <tr key={p.id}>
                <td><span className="admin__order-id">{p.id}</span></td>
                <td><strong>{p.name}</strong></td>
                <td><span className="admin__price-original">{p.original}</span></td>
                <td><span className="admin__price-sale">{p.sale}</span></td>
                <td><span className="admin__discount-badge">{p.discount} OFF</span></td>
                <td>{p.currency}</td>
                <td>
                  <div className="admin__actions-cell">
                    <button className="admin__action-btn admin__action-btn--edit">✏️ Edit</button>
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
  const [descs, setDescs]   = useState(MOCK_DESCRIPTIONS);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');

  const startEdit = (item) => { setEditing(item.id); setEditVal(item.full); };
  const saveEdit  = (id)   => { setDescs(prev => prev.map(d => d.id === id ? { ...d, full: editVal } : d)); setEditing(null); };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">Product Descriptions</h2>
          <p className="admin__panel-sub">Manage product content and descriptions</p>
        </div>
      </div>
      <div className="admin__desc-list">
        {descs.map(d => (
          <div className="admin__desc-card" key={d.id}>
            <div className="admin__desc-card__header">
              <h3 className="admin__desc-card__name">{d.name}</h3>
              {editing !== d.id
                ? <button className="admin__action-btn admin__action-btn--edit" onClick={() => startEdit(d)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button>
                : <button className="admin__form-save" onClick={() => saveEdit(d.id)}>Save</button>
              }
            </div>
            <p className="admin__desc-card__short"><strong>Short:</strong> {d.short}</p>
            {editing === d.id ? (
              <textarea
                className="admin__desc-textarea"
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                rows={4}
              />
            ) : (
              <p className="admin__desc-card__full">{d.full}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── PRODUCT: ALL PRODUCTS ── */
function PageAllProducts() {
  const [products, setProducts] = useState(MOCK_ALL_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Chairs', price: '', stock: '' });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await adminApi.getProducts();
        if (res.data && res.data.length > 0) {
           setProducts(res.data.map(p => ({
             id: p.id,
             name: p.name,
             category: p.category ? p.category.name : 'Uncategorized',
             price: `₹${Number(p.price).toLocaleString()}`,
             stock: p.stock_quantity || (p.in_stock ? 'In Stock' : 'Out of Stock')
           })));
        }
      } catch (err) {
        console.error('Failed to fetch real products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    if (!form.name || !form.price) return;
    
    // Optimistic UI update
    const newProduct = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      price: `₹${Number(form.price).toLocaleString()}`,
      stock: form.stock || 10
    };
    setProducts([newProduct, ...products]);
    setShowAdd(false);
    setForm({ name: '', category: 'Chairs', price: '', stock: '' });

    // Attempt to save to backend
    try {
      await adminApi.createProduct({
        name: form.name,
        category_id: 1, // Using 1 as a generic category ID for now
        price: form.price,
        stock_quantity: form.stock || 10,
        is_active: 1
      });
    } catch (e) {
      console.error('Failed to create product on backend', e);
    }
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">All Products</h2>
          <p className="admin__panel-sub">Manage all items across categories</p>
        </div>
        <button className="admin__add-btn" onClick={() => setShowAdd(!showAdd)}>+ Add Product</button>
      </div>

      {showAdd && (
        <div className="admin__inline-form">
          <input className="admin__form-input" placeholder="Product Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <select className="admin__form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option>Chairs</option>
            <option>Tables</option>
            <option>Sofas</option>
            <option>Armchairs</option>
            <option>Beds</option>
            <option>Storage</option>
            <option>Textiles</option>
            <option>Lighting</option>
            <option>Toys</option>
            <option>Decor</option>
          </select>
          <input className="admin__form-input admin__form-input--sm" placeholder="Price" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
          <input className="admin__form-input admin__form-input--sm" placeholder="Stock" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
          <button className="admin__form-save" onClick={handleAddProduct}>Save</button>
          <button className="admin__form-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      )}

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead><tr><th>#</th><th>Product Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</td></tr>
            ) : products.map(p => (
              <tr key={p.id}>
                <td><span className="admin__order-id">{p.id}</span></td>
                <td><strong>{p.name}</strong></td>
                <td>{p.category}</td>
                <td><span className="admin__price-sale">{p.price}</span></td>
                <td>{p.stock}</td>
                <td>
                  <div className="admin__actions-cell">
                    <button className="admin__action-btn admin__action-btn--edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button>
                    <button className="admin__action-btn admin__action-btn--delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
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

/* ── SHARED: Orders Table ── */
function OrdersTable({ data, onStatusChange }) {
  return (
    <div className="admin__table-wrap">
      <table className="admin__table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Details</th>
            <th>Product Info</th>
            <th>Total & Payment</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map(o => (
            <tr key={o.id}>
              <td><span className="admin__order-id">{o.id}</span></td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="admin__customer-avatar">{o.customer ? o.customer.charAt(0).toUpperCase() : 'U'}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <strong style={{ color: '#111', fontSize: '14px' }}>{o.customer}</strong>
                    {o.email && <span style={{ fontSize: '12px', color: '#666' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '2px', verticalAlign: 'middle'}}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> {o.email}</span>}
                    {o.phone && <span style={{ fontSize: '12px', color: '#666' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '2px', verticalAlign: 'middle'}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> {o.phone}</span>}
                  </div>
                </div>
              </td>
              <td className="admin__product-cell">{o.product}</td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '14px', color: '#ea580c' }}>{o.amount}</strong>
                  {o.payment && <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{o.payment}</span>}
                </div>
              </td>

              <td className="admin__date-cell">{o.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SIDEBAR NAV CONFIG
══════════════════════════════════════════════════ */
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: 'menu',      label: 'Menu',      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg> },
  { id: 'post',      label: 'Post',      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
  { id: 'sliders',   label: 'Sliders',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  {
    id: 'product', label: 'Product', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    children: [
      { id: 'all-products',label: 'All Products',icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
      { id: 'categories',  label: 'Categories',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
      { id: 'sku',         label: 'SKU',          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> },
      { id: 'price',       label: 'Price',        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
      { id: 'description', label: 'Description',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    ],
  },
  { id: 'orders',    label: 'Orders',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
  { id: 'users',     label: 'Users',     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: 'settings',  label: 'Settings',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard',   menu: 'Menu',       post: 'Post',
  sliders: 'Sliders',       categories: 'Product › Categories',
  'all-products': 'Product › All Products',
  sku: 'Product › SKU',     price: 'Product › Price',
  description: 'Product › Description',
  orders: 'Orders',         users: 'Users',      settings: 'Settings',
};
/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function AdminDashboard({ onLogout }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage]       = useState('dashboard');
  const [productOpen, setProductOpen]     = useState(false);

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
    if (['categories','sku','price','description'].includes(id)) setProductOpen(true);
  };

function PageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getOrders();
        if (res && res.data && res.data.length > 0) {
          const mappedOrders = res.data.map(o => ({
            id: o.order_number || `#ORD-${o.id}`,
            numericId: o.id,
            customer: o.customer_name || 'Guest',
            email: o.email || '',
            phone: o.phone || '',
            payment: o.payment_method || '',
            product: o.items && o.items.length > 0 ? (o.items[0].product_name + (o.items.length > 1 ? ` +${o.items.length - 1} more` : '')) : 'Furniture Item',
            amount: '₹' + Number(o.total || 0).toLocaleString(),
            status: o.status || 'Processing',
            date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
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
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (numericId) {
      try { await adminApi.updateOrderStatus(numericId, newStatus); } catch (e) {}
    }
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">All Orders</h2>
          <p className="admin__panel-sub">Full order history</p>
        </div>
        <button className="admin__view-all" onClick={() => window.location.reload()}>
          {loading ? 'Refreshing…' : 'Refresh Data ⟳'}
        </button>
      </div>
      <OrdersTable data={orders} onStatusChange={handleStatusUpdate} />
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
            {users.map(u => (
              <tr key={u.id}>
                <td><span className="admin__order-id">#{u.id}</span></td>
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
  const [formData, setFormData] = useState({
    razorpayKeyId: 'rzp_test_TWLMva2WMHr864',
    razorpaySecret: 'C4wy66QaYjPwBkTMGSPWfRKP'
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  return (
    <div className="admin__page-panel">
      <div className="admin__panel-header">
        <div>
          <h2 className="admin__panel-title">Razorpay Payment Settings</h2>
          <p className="admin__panel-sub">Online payments (Checkout) enable karne ke liye Razorpay credentials enter karein.</p>
        </div>
      </div>
      
      <div className="admin__form-wrap" style={{ maxWidth: '600px', marginTop: '20px' }}>
        <form onSubmit={handleSave}>
          <div className="admin__form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <label style={{ width: '200px', fontWeight: 'bold' }}>Razorpay Key ID</label>
            <input 
              type="text" 
              name="razorpayKeyId"
              value={formData.razorpayKeyId}
              onChange={handleChange}
              className="admin__form-input" 
              style={{ flex: 1 }}
            />
          </div>
          <div className="admin__form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
            <label style={{ width: '200px', fontWeight: 'bold' }}>Razorpay Key Secret</label>
            <input 
              type="text" 
              name="razorpaySecret"
              value={formData.razorpaySecret}
              onChange={handleChange}
              className="admin__form-input" 
              style={{ flex: 1 }}
            />
          </div>
          <button type="submit" className="admin__action-btn" style={{ background: '#4169E1', color: '#fff', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':   return <PageDashboard />;
      case 'menu':        return <PageMenu />;
      case 'post':        return <PagePost />;
      case 'sliders':     return <PageSliders />;
      case 'all-products':return <PageAllProducts />;
      case 'categories':  return <PageCategories />;
      case 'sku':         return <PageSKU />;
      case 'price':       return <PagePrice />;
      case 'description': return <PageDescription />;
      case 'orders':      return <PageOrders />;
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
