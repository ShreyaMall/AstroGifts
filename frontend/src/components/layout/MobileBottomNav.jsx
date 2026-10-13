import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import './MobileBottomNav.css';

export default function MobileBottomNav({ onAccountClick }) {
  const location = useLocation();
  const { cartCount, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { authRole, isAuthenticated, isAdmin, openAuth } = useAuth();

  if (
    location.pathname.startsWith('/admin') ||
    location.pathname === '/checkout' ||
    location.pathname.startsWith('/order-complete')
  ) {
    return null;
  }

  const handleAccountClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      if (onAccountClick) {
        onAccountClick();
      } else {
        openAuth({ redirectTo: '/profile' });
      }
    }
  };

  const accountPath = isAuthenticated ? '/profile' : '/login';

  return (
    <nav className="mobile-bottom-nav">
      <Link to="/products" className="mobile-bottom-nav__item">
        <div className="mobile-bottom-nav__icon">
          <Store size={22} strokeWidth={1.5} />
        </div>
        <span className="mobile-bottom-nav__label">Shop</span>
      </Link>
      
      <button className="mobile-bottom-nav__item" onClick={openWishlist}>
        <div className="mobile-bottom-nav__icon">
          <Heart size={22} strokeWidth={1.5} />
          {wishlistCount > 0 && <span className="mobile-bottom-nav__badge">{wishlistCount}</span>}
        </div>
        <span className="mobile-bottom-nav__label">Wishlist</span>
      </button>

      <button className="mobile-bottom-nav__item" onClick={openCart}>
        <div className="mobile-bottom-nav__icon">
          <ShoppingCart size={22} strokeWidth={1.5} />
          {cartCount > 0 && <span className="mobile-bottom-nav__badge">{cartCount}</span>}
        </div>
        <span className="mobile-bottom-nav__label">Cart</span>
      </button>

      <Link to={accountPath} className="mobile-bottom-nav__item" onClick={handleAccountClick}>
        <div className="mobile-bottom-nav__icon">
          <User size={22} strokeWidth={1.5} />
        </div>
        <span className="mobile-bottom-nav__label">My account</span>
      </Link>
    </nav>
  );
}
