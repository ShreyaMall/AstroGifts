import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Heart, Package, MapPin, LogOut } from 'lucide-react';

export default function ProfileSidebar({ activeTab }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const NAV = [
    { label: 'User Info', icon: <User size={18} />, to: '/profile',   id: 'profile' },
    { label: 'Wishlist',  icon: <Heart size={18} />, to: '/wishlist',  id: 'wishlist' },
    { label: 'Orders',    icon: <Package size={18} />, to: '/my-orders', id: 'orders' },
    { label: 'Address',   icon: <MapPin size={18} />, to: '/address',   id: 'address' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="profile-sidebar">
      <style>{`
        .profile-sidebar-desktop-header { padding: 24px 20px 16px; font-weight: 700; font-size: 15px; color: #111; border-bottom: 1px solid #f0f0f0; }
        .profile-nav-menu { display: block; padding: 10px 0; }
        
        .profile-nav-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 20px; 
          text-decoration: none; font-size: 14px; color: #444; font-weight: 400;
          border-left: 3px solid transparent; width: 100%; text-align: left; 
          background: transparent; border-top: none; border-right: none; border-bottom: none; cursor: pointer;
        }
        
        .profile-nav-item.active {
          font-weight: 600; color: #d96b27; background: #fff7f0; border-left-color: #d96b27;
        }

        .profile-logout-btn {
          color: #e53e3e;
        }
        
        @media (max-width: 768px) {
          .profile-sidebar { padding: 0 !important; overflow: hidden; margin-bottom: 20px; }
          .profile-sidebar-desktop-header { display: none; }
          .profile-nav-menu { 
             display: flex; flex-wrap: nowrap; overflow-x: auto; padding: 0; 
             -webkit-overflow-scrolling: touch; scrollbar-width: none; 
             justify-content: center;
          }
          .profile-nav-menu::-webkit-scrollbar { display: none; }
          
          .profile-nav-item {
             padding: 12px 16px; width: auto; flex-shrink: 0; white-space: nowrap;
             border-left: none !important; border-bottom: 3px solid transparent;
             border-top: none; border-right: none;
          }
          .profile-nav-item.active {
             border-bottom-color: #d96b27;
          }
        }
      `}</style>
      
      {/* Desktop Header */}
      <div className="profile-sidebar-desktop-header">
        User Profile
      </div>

      <nav className="profile-nav-menu">
        {NAV.map(item => (
          <Link 
            key={item.label} 
            to={item.to} 
            className={`profile-nav-item ${item.id === activeTab ? 'active' : ''}`}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>{item.label}
          </Link>
        ))}
        <button 
          onClick={handleLogout} 
          className="profile-nav-item profile-logout-btn"
        >
          <span style={{ display: 'flex', alignItems: 'center' }}><LogOut size={18} /></span>Logout
        </button>
      </nav>
    </aside>
  );
}
