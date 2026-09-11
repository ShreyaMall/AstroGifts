import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const NAV = [
  { label: 'User Info', icon: '👤', to: '/profile' },
  { label: 'Wishlist',  icon: '🤍', to: '/wishlist', active: true },
  { label: 'Orders',    icon: '📦', to: '/my-orders' },
  { label: 'Address',   icon: '📍', to: '/address' },
];

export default function WishlistPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist } = useWishlist();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

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
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px', color: '#111' }}>My Wishlist</h1>
              <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>Items you've saved for later</p>
            </div>

            {wishlistItems.length === 0 ? (
              <div style={{ background: '#fff', padding: '60px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤍</div>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>Your wishlist is currently empty.</p>
                <Link to="/category/chairs" style={{ padding: '10px 24px', background: '#d96b27', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                  Start Browsing
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {wishlistItems.map(item => (
                  <div key={item.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', position: 'relative' }}>
                    <button 
                      onClick={() => removeFromWishlist(item.id)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: '#fff', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#ef4444', fontSize: '14px' }}
                      title="Remove from wishlist"
                    >
                      ✕
                    </button>
                    <Link to={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                      <div style={{ width: '100%', height: '220px', background: '#f5f5f5' }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/220'; }} />
                      </div>
                      <div style={{ padding: '16px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                        <div style={{ fontSize: '14px', color: '#d96b27', fontWeight: '700' }}>₹{Number(item.price).toLocaleString('en-IN')}</div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
