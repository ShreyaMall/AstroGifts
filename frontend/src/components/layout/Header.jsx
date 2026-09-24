import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import {
  LogoIcon, SearchIcon, WishlistIcon, UserIcon, CartIcon,
  GiftIcon, ToysIcon, AstrologyIcon,
  DiwaliIcon, BirthdayIcon, HeartIcon,
  SoftToyIcon, BabyIcon, BoardGameIcon,
  RingIcon, PendantIcon, BraceletIcon, GemstoneIcon,
  HomeIcon
} from '../../assets/icons/Icons';

import { categoriesApi } from '../../services/api';
import AstroGiftsSVG from '../common/AstroGiftsSVG';

const ICONS_MAP = {
  // Main categories
  'Gifts':       <GiftIcon />,
  'Toys':        <ToysIcon />,
  'Astrology':   <AstrologyIcon />,
  // Gifts subcategories
  'Diwali Gifts':      <DiwaliIcon />,
  'Birthday Gifts':    <BirthdayIcon />,
  'Anniversary Gifts': <HeartIcon />,
  // Toys subcategories
  'Soft Toys':   <SoftToyIcon />,
  'Baby Toys':   <BabyIcon />,
  'Board Games': <BoardGameIcon />,
  // Astrology subcategories
  'Rings':                <RingIcon />,
  'Pendants':             <PendantIcon />,
  'Bracelets':            <BraceletIcon />,
  'Gemstones & Crystals': <GemstoneIcon />,
};

const DEFAULT_CATEGORIES = [
  {
    id: 1,
    name: 'Gifts',
    slug: 'gifts',
    subcategories: [
      { id: 101, name: 'Diwali Gifts', slug: 'diwali-gifts' },
      { id: 102, name: 'Birthday Gifts', slug: 'birthday-gifts' },
      { id: 103, name: 'Anniversary Gifts', slug: 'anniversary-gifts' },
    ]
  },
  {
    id: 2,
    name: 'Toys',
    slug: 'toys',
    subcategories: [
      { id: 201, name: 'Soft Toys', slug: 'soft-toys' },
      { id: 202, name: 'Baby Toys', slug: 'baby-toys' },
      { id: 203, name: 'Board Games', slug: 'board-games' },
    ]
  },
  {
    id: 3,
    name: 'Astrology',
    slug: 'astrology',
    subcategories: [
      { id: 301, name: 'Rings', slug: 'rings' },
      { id: 302, name: 'Pendants', slug: 'pendants' },
      { id: 303, name: 'Bracelets', slug: 'bracelets' },
      { id: 304, name: 'Gemstones & Crystals', slug: 'gemstones-crystals' },
    ]
  }
];

export default function Header({ onAccountClick }) {
  const { cartCount, cartTotal, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { authRole, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled]           = useState(false);
  const [hidden, setHidden]               = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [menuOpen, setMenuOpen]           = useState(false);
  const [mobileMenuTab, setMobileMenuTab] = useState('CATEGORIES');
  const [mobileExpandedCat, setMobileExpandedCat] = useState('gifts');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    categoriesApi.getAll().then(res => {
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setDynamicCategories(res.data);
      }
    }).catch(console.error);
  }, []);

  const accountDropdownRef = useRef(null);
  const leaveTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    setAccountDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setAccountDropdownOpen(false);
    }, 150);
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 30);
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const accountPath = authRole === 'admin' ? '/admin/dashboard' : ((authRole === 'user' || authRole === 'customer') ? '/profile' : '/login');

  const handleAccountClick = (e) => {
    if (onAccountClick) {
      e.preventDefault();
      onAccountClick();
    }
  };

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}${hidden ? ' header--hidden' : ''}`}>

      {/* ── MAIN ROW (logo / search / actions) ── */}
      <div className="header__main">
        <div className="header__container">

          {/* Mobile Hamburger Menu (visible only on mobile) */}
          <button 
            className="header__mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="header__logo" id="logo-link">
            <AstroGiftsSVG height={58} mode="light" />
          </Link>

          {/* Search bar (hidden on mobile) */}
          <div className={`header__search${searchFocused ? ' header__search--focused' : ''} desktop-only`}>
            <span className="header__search-prefix" onClick={handleSearchClick} style={{cursor: 'pointer'}}>
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
            {searchQuery && (
              <button 
                className="header__search-clear" 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          {/* Top Menu (Desktop only, next to search) */}
          <div className="header__top-menu desktop-only">
            <Link to="/" className="header__top-link">Home</Link>
            <Link to="/blog" className="header__top-link">Blog</Link>
            <Link to="#!" className="header__top-link">About Us</Link>
            <Link to="/contact-us" className="header__top-link">Contact Us</Link>
          </div>

          {/* Action icons */}
          <div className="header__actions">

            {/* Wishlist (hidden on mobile, handled by bottom nav) */}
            <button
              className="header__icon-btn desktop-only"
              id="wishlist-btn"
              title="Wishlist"
              onClick={openWishlist}
            >
              <WishlistIcon />
              <span className="header__icon-badge">{wishlistCount}</span>
            </button>

            {/* Account (hidden on mobile, handled by bottom nav) */}
            {!authRole ? (
              <Link
                to="/login"
                className="header__account-btn desktop-only"
                id="account-btn"
                onClick={handleAccountClick}
              >
                <UserIcon />
                <span>Login / Register</span>
              </Link>
            ) : (
              <div
                ref={accountDropdownRef}
                className="header__account-wrapper desktop-only"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ position: 'relative' }}
              >
                <button
                  className="header__account-btn"
                  id="account-btn"
                  onClick={() => setAccountDropdownOpen(prev => !prev)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <UserIcon />
                  <span>{user?.name ? user.name.split(' ')[0] : (authRole === 'admin' ? 'Admin' : 'Account')}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '2px', transition: 'transform 0.2s', transform: accountDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {accountDropdownOpen && (
                  <div
                    className="header__account-dropdown"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      paddingTop: '6px',
                      zIndex: 1000,
                    }}
                  >
                    <div
                      style={{
                        background: '#fff',
                        borderRadius: '10px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
                        border: '1px solid #e2e8f0',
                        minWidth: '220px',
                        overflow: 'hidden'
                      }}
                    >
                    {/* User profile brief */}
                    <div style={{ padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: '600', fontSize: '13.5px', color: '#0f172a' }}>
                        {user?.name || (authRole === 'admin' ? 'Administrator' : 'Customer')}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', wordBreak: 'break-all' }}>
                        {user?.email || (authRole === 'admin' ? 'admin@astrogifts.com' : '')}
                      </div>
                      <span style={{
                        display: 'inline-block',
                        marginTop: '6px',
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: authRole === 'admin' ? '#fef3c7' : '#e0f2fe',
                        color: authRole === 'admin' ? '#b45309' : '#0369a1'
                      }}>
                        {authRole === 'admin' ? 'Admin Role' : 'Customer'}
                      </span>
                    </div>

                    {/* Navigation links */}
                    <div style={{ padding: '6px 0' }}>
                      {authRole === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setAccountDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 16px',
                            fontSize: '13px',
                            color: '#334155',
                            textDecoration: 'none',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/my-orders"
                        onClick={() => setAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '13px',
                          color: '#334155',
                          textDecoration: 'none',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                        My Orders
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '13px',
                          color: '#334155',
                          textDecoration: 'none',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        My Profile
                      </Link>
                    </div>

                    {/* Divider & Logout */}
                    <div style={{ borderTop: '1px solid #e2e8f0', padding: '6px 0' }}>
                      <button
                        onClick={async () => {
                          setAccountDropdownOpen(false);
                          await logout();
                          navigate('/');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '13px',
                          color: '#dc2626',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: '600'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Logout
                      </button>
                    </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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
              <span className="header__cart-amount desktop-only">₹{cartTotal.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU BACKDROP ── */}
      {menuOpen && (
        <div className="header__mobile-backdrop" onClick={() => setMenuOpen(false)}></div>
      )}

      {/* ── CATEGORY NAV (Mobile Drawer & Desktop Nav) ── */}
      <nav className={`header__nav${menuOpen ? ' header__nav--open' : ''}`} aria-label="Product categories">
        
        {/* Mobile-only Header for Drawer */}
        <div className="header__nav-mobile-header">
          <div className="header__nav-mobile-search">
            <input 
              type="text" 
              placeholder="Search for products" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
            />
            <button onClick={() => {
              if (searchQuery.trim()) {
                navigate(`/category/gifts?search=${encodeURIComponent(searchQuery.trim())}`);
                setMenuOpen(false);
              }
            }}>
              <SearchIcon />
            </button>
          </div>
          <div className="header__nav-mobile-tabs">
            <button 
              className={`header__nav-mobile-tab ${mobileMenuTab === 'CATEGORIES' ? 'active' : ''}`}
              onClick={() => setMobileMenuTab('CATEGORIES')}
            >
              CATEGORIES
            </button>
            <button 
              className={`header__nav-mobile-tab ${mobileMenuTab === 'MENU' ? 'active' : ''}`}
              onClick={() => setMobileMenuTab('MENU')}
            >
              MENU
            </button>
          </div>
        </div>

          <div className="header__nav-container">
          {/* Category list (Desktop always, Mobile if tab is CATEGORIES) */}
          <ul className={`header__nav-list ${mobileMenuTab === 'MENU' ? 'mobile-hidden' : ''}`}>
            {dynamicCategories.map(cat => {
              const catSlug = cat.slug || cat.name.toLowerCase();
              const isActive = location.pathname.startsWith(`/category/${catSlug}`);
              const hasSubs = cat.subcategories && cat.subcategories.length > 0;
              const isExpanded = mobileExpandedCat === catSlug;

              return (
                <li key={cat.id || cat.name} className={`header__nav-item${hasSubs ? ' header__nav-item--has-dropdown' : ''}${isExpanded ? ' header__nav-item--expanded' : ''}`}>
                  <div className="header__nav-link-wrap" style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                    <Link
                      to={`/category/${catSlug}`}
                      id={`nav-${catSlug}`}
                      className={`header__nav-link${isActive ? ' header__nav-link--active' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="header__nav-icon">{ICONS_MAP[cat.name] || <HomeIcon />}</span>
                      <span>{cat.name}</span>
                    </Link>
                    {hasSubs && (
                      <button
                        type="button"
                        className="header__nav-chevron-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setMobileExpandedCat(prev => prev === catSlug ? null : catSlug);
                        }}
                        style={{ background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', color: '#5c3826', display: 'flex', alignItems: 'center' }}
                        aria-label="Toggle category"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Dropdown submenu */}
                  {hasSubs && (
                    <ul className="header__dropdown">
                      {cat.subcategories.map(sub => {
                        const subSlug = sub.slug || sub.name.toLowerCase();
                        return (
                          <li key={sub.id || sub.name} className="header__dropdown-item">
                            <Link
                              to={`/category/${subSlug}`}
                              className="header__dropdown-link"
                              onClick={() => setMenuOpen(false)}
                            >
                              <span className="header__dropdown-icon">{ICONS_MAP[sub.name] || <HomeIcon />}</span>
                              <span>{sub.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Regular Menu list (Mobile only, shown if tab is MENU) */}
          <ul className={`header__nav-list header__nav-list--menu ${mobileMenuTab === 'CATEGORIES' ? 'mobile-hidden' : ''} mobile-only`}>
            <li className="header__nav-item">
              <Link to="/" className="header__nav-link" onClick={() => setMenuOpen(false)}>
                <span>Home</span>
              </Link>
            </li>
            <li className="header__nav-item">
              <Link to="/blog" className="header__nav-link" onClick={() => setMenuOpen(false)}>
                <span>Blog</span>
              </Link>
            </li>
            <li className="header__nav-item">
              <Link to="#!" className="header__nav-link" onClick={() => setMenuOpen(false)}>
                <span>About Us</span>
              </Link>
            </li>
            <li className="header__nav-item">
              <Link to="/contact-us" className="header__nav-link" onClick={() => setMenuOpen(false)}>
                <span>Contact Us</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
