import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProfileSidebar from '../components/layout/ProfileSidebar';

import { User, Heart, Package, MapPin, LogOut } from 'lucide-react';

const NAV = [
  { label: 'User Info', icon: <User size={18} />, to: '/profile' },
  { label: 'Wishlist',  icon: <Heart size={18} />, to: '/wishlist', active: true },
  { label: 'Orders',    icon: <Package size={18} />, to: '/my-orders' },
  { label: 'Address',   icon: <MapPin size={18} />, to: '/address' },
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
      <style>{`
        .profile-layout-container {
          max-width: 1120px; margin: 0 auto; padding: 40px 20px 80px; display: flex; gap: 28px; align-items: flex-start;
        }
        .profile-sidebar { width: 200px; flex-shrink: 0; background: #fff; border-radius: 12px; box-shadow: 0 1px 8px rgba(0,0,0,0.07); padding: 0; position: sticky; top: 100px; }
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
          <ProfileSidebar activeTab="wishlist" />

          {/* ── Main Content ── */}
          <div className="profile-main" style={{ flex: 1 }}>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px', color: '#111' }}>My Wishlist</h1>
              <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>Items you've saved for later</p>
            </div>

            {wishlistItems.length === 0 ? (
              <div style={{ background: '#fff', padding: '60px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <Heart size={44} color="#d1d5db" />
                </div>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>Your wishlist is currently empty.</p>
                <Link to="/shop" style={{ display: 'inline-block', padding: '10px 24px', background: '#d96b27', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
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
