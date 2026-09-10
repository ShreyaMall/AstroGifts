import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import {
  LogoIcon, SearchIcon, WishlistIcon, UserIcon, CartIcon,
  ChairIcon, TableIcon, SofaIcon, ArmchairIcon, BedIcon, StorageIcon,
  TextilesIcon, LightingIcon, ToysIcon, DecorIcon
} from '../../assets/icons/Icons';

const categories = [
  { name: 'Chairs',    icon: <ChairIcon /> },
  { name: 'Tables',    icon: <TableIcon /> },
  { name: 'Sofas',     icon: <SofaIcon /> },
  { name: 'Armchairs', icon: <ArmchairIcon /> }, 
  { name: 'Beds',      icon: <BedIcon /> },
  { name: 'Storage',   icon: <StorageIcon /> },
  { name: 'Textiles',  icon: <TextilesIcon /> },
  { name: 'Lighting',  icon: <LightingIcon /> },
  { name: 'Toys',      icon: <ToysIcon /> },
  { name: 'Decor',     icon: <DecorIcon /> },
];

export default function Header({ onAccountClick }) {
  const { cartCount, cartTotal, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { authRole, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled]           = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [menuOpen, setMenuOpen]           = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/category/wooden-furniture?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const accountPath = authRole === 'admin' ? '/admin/dashboard' : (authRole === 'user' ? '/profile' : '/login');

  const handleAccountClick = (e) => {
    if (onAccountClick) {
      e.preventDefault();
      onAccountClick();
    }
  };

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>

      {/* ── MAIN ROW (logo / search / actions) ── */}
      <div className="header__main">
        <div className="header__container">

          {/* Logo */}
          <Link to="/" className="header__logo" id="logo-link">
            <LogoIcon />
            <span className="header__logo-text">
              Homewood Decor<span className="header__logo-dot">.</span>
            </span>
          </Link>

          {/* Search bar */}
          <div className={`header__search${searchFocused ? ' header__search--focused' : ''}`}>
            <span className="header__search-prefix">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search for products (Press Enter)"
              className="header__search-input"
              id="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          {/* Action icons */}
          <div className="header__actions">

            {/* Wishlist */}
            <button
              className="header__icon-btn"
              id="wishlist-btn"
              title="Wishlist"
              onClick={openWishlist}
            >
              <WishlistIcon />
              <span className="header__icon-badge">{wishlistCount}</span>
            </button>

            {/* Account */}
            <Link
              to={accountPath}
              className="header__account-btn"
              id="account-btn"
              onClick={handleAccountClick}
            >
              <UserIcon />
              <span>{user?.name ? user.name.split(' ')[0] : 'Login / Register'}</span>
            </Link>

            {/* Cart pill */}
            <button
              className="header__cart-btn"
              id="cart-btn"
              onClick={openCart}
              title="View Cart"
            >
              <span className="header__cart-icon-wrap">
                <CartIcon />
                {cartCount > 0 && (
                  <span className="header__cart-badge">{cartCount}</span>
                )}
              </span>
              <span className="header__cart-amount">₹{cartTotal.toFixed(2)}</span>
            </button>

            {/* Hamburger (mobile) */}
            <button
              className="header__hamburger"
              onClick={() => setMenuOpen(o => !o)}
              id="mobile-menu-btn"
              aria-label="Toggle navigation"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </div>

      {/* ── CATEGORY NAV ── */}
      <nav className={`header__nav${menuOpen ? ' header__nav--open' : ''}`} aria-label="Product categories">
        <div className="header__nav-container">

          {/* Category list */}
          <ul className="header__nav-list">
            {categories.map(cat => {
              const catSlug = cat.name.toLowerCase();
              const isActive = location.pathname === `/category/${catSlug}`;
              return (
                <li key={cat.name} className="header__nav-item">
                  <Link
                    to={`/category/${catSlug}`}
                    id={`nav-${catSlug}`}
                    className={`header__nav-link${isActive ? ' header__nav-link--active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="header__nav-icon">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}
