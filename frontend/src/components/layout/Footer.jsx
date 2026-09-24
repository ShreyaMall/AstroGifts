import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import {
  FacebookIcon, TwitterIcon, InstagramIcon, WhatsappIcon, YoutubeIcon, LogoIcon,
  GooglePlayBadge, AppStoreBadge
} from '../../assets/icons/Icons';

const usefulLinks = [
  { name: 'About Us', path: '/' },
  { name: 'Blog Journal', path: '/blog' },
  { name: 'My Orders', path: '/my-orders' },
  { name: 'Account Profile', path: '/profile' },
];

import { categoriesApi } from '../../services/api';
import AstroGiftsSVG from '../common/AstroGiftsSVG';

/* ── Real SVG Payment Card Icons ── */
const VisaIcon = () => (
  <svg width="45" height="28" viewBox="0 0 45 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="45" height="28" rx="4" fill="#1434CB"/>
    <path d="M20 20L22.5 8H26.5L24 20H20ZM31.8 13C31.6 12 30.4 11.3 29.3 10.8C28.2 10.2 27.8 9.9 27.8 9.4C27.8 8.6 28.8 8.3 29.7 8.3C31.3 8.3 32.2 8.7 32.9 9.1L33.4 5.4C32.7 5 31.5 4.7 30 4.7C26.3 4.7 23.6 6.7 23.6 9.6C23.6 11.8 25.6 13 27 13.7C28.4 14.4 28.9 14.8 28.9 15.5C28.9 16.5 27.8 17 26.8 17C25 17 24 16.6 23.1 16.2L22.6 19.9C23.5 20.3 24.8 20.7 26.2 20.7C30.2 20.7 32.9 18.7 32.9 15.7C33 14.1 31.9 13 31.8 13ZM39 20H42.8L39.5 8C39.3 7.2 38.7 6.8 38 6.8H31.5L31.4 7.4L34.7 16H30.9L39 20ZM13.2 20H9.5L7.3 10.6C7.1 9.8 6.4 9.4 5.7 9.3H1.5L1.2 8H8.2C9.3 8 10.3 8.7 10.6 9.8L12.6 19.6L13.2 20Z" fill="white"/>
  </svg>
);

const MastercardIcon = () => (
  <svg width="45" height="28" viewBox="0 0 45 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="45" height="28" rx="4" fill="#141414"/>
    <circle cx="17" cy="14" r="8" fill="#EB001B"/>
    <circle cx="28" cy="14" r="8" fill="#F79E1B"/>
    <path d="M22.5 8C20 10.5 20 17.5 22.5 20C25 17.5 25 10.5 22.5 8Z" fill="#FF5F00"/>
  </svg>
);

const PayPalIcon = () => (
  <svg width="45" height="28" viewBox="0 0 45 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="45" height="28" rx="4" fill="#003087"/>
    <path d="M21.5 18H19L21 6H26.5C29 6 30.5 7.5 30 10C29.5 12.5 28 14 26 14H23.5L21.5 18Z" fill="#0079C1"/>
    <path d="M25 19H22.5L24.5 7H30C32.5 7 34 8.5 33.5 11C33 13.5 31.5 15 29.5 15H27L25 19Z" fill="#00457C"/>
    <text x="10" y="18" fill="#0079C1" fontStyle="italic" fontWeight="900" fontFamily="Arial, sans-serif" fontSize="13">Pay</text>
    <text x="26" y="18" fill="#00457C" fontStyle="italic" fontWeight="900" fontFamily="Arial, sans-serif" fontSize="13">Pal</text>
  </svg>
);

const AmexIcon = () => (
  <svg width="45" height="28" viewBox="0 0 45 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="45" height="28" rx="4" fill="#016FD0"/>
    <text x="22.5" y="18" fill="#FFF" fontWeight="900" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle" letterSpacing="0.2">AMEX</text>
  </svg>
);

const DiscoverIcon = () => (
  <svg width="45" height="28" viewBox="0 0 45 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="45" height="28" rx="4" fill="#F4F4F4" stroke="#D1D5DB" strokeWidth="0.5"/>
    <text x="22.5" y="17.5" fill="#FF6000" fontWeight="900" fontFamily="Arial, sans-serif" fontSize="8" textAnchor="middle">DISCOVER</text>
    <circle cx="34" cy="14.5" r="3.5" fill="#FF6000"/>
  </svg>
);

const MaestroIcon = () => (
  <svg width="45" height="28" viewBox="0 0 45 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="45" height="28" rx="4" fill="#1A1A1A"/>
    <circle cx="17" cy="14" r="8" fill="#EB001B"/>
    <circle cx="28" cy="14" r="8" fill="#0099DF" opacity="0.9"/>
    <path d="M22.5 8C20 10.5 20 17.5 22.5 20C25 17.5 25 10.5 22.5 8Z" fill="#7673C0"/>
  </svg>
);

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Gifts', slug: 'gifts' },
  { id: 2, name: 'Toys', slug: 'toys' },
  { id: 3, name: 'Astrology', slug: 'astrology' },
  { id: 4, name: 'Flowers', slug: 'flowers' },
  { id: 5, name: 'Decor', slug: 'decor' },
];

export default function Footer() {
  const [dynamicCategories, setDynamicCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    categoriesApi.getAll().then(res => {
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setDynamicCategories(res.data);
      }
    }).catch(console.error);
  }, []);

  return (
    <footer className="footer" id="footer">
      <div className="footer__main">
        <div className="footer__container">

          {/* ── TOP ROW: Logo & Subscribe ── */}
          <div className="footer__top-row">
            {/* Logo */}
            <Link to="/" className="footer__logo" id="footer-logo">
              <AstroGiftsSVG height={64} mode="dark" />
            </Link>

            {/* Subscribe Us Social Block */}
            <div className="footer__social-block">
              <span className="footer__social-label">Subscribe us:</span>
              <div className="footer__social-links">
                <a href="#!" className="footer__social-btn" aria-label="Facebook" id="social-fb">
                  <FacebookIcon />
                </a>
                <a href="#!" className="footer__social-btn" aria-label="Instagram" id="social-ig">
                  <InstagramIcon />
                </a>
                <a href="#!" className="footer__social-btn" aria-label="X" id="social-x">
                  <TwitterIcon />
                </a>
                <a href="#!" className="footer__social-btn" aria-label="WhatsApp" id="social-wa">
                  <WhatsappIcon />
                </a>
                <a href="#!" className="footer__social-btn" aria-label="YouTube" id="social-yt">
                  <YoutubeIcon />
                </a>
              </div>
            </div>
          </div>

          {/* ── MIDDLE COLUMNS ROW ── */}
          <div className="footer__cols-row">

            {/* Col 1: Useful links */}
            <div className="footer__col">
              <h4 className="footer__col-title">Useful links</h4>
              <ul className="footer__list">
                {usefulLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="footer__link">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 2: Categories */}
            <div className="footer__col">
              <h4 className="footer__col-title">Categories</h4>
              <ul className="footer__list footer__list--2cols">
                {dynamicCategories.map((cat) => (
                  <li key={cat.id || cat.name}>
                    <Link to={`/category/${cat.slug || cat.name.toLowerCase()}`} className="footer__link">{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Download App on Mobile */}
            <div className="footer__col footer__col--app">
              <h4 className="footer__col-title">Download App on Mobile:</h4>
              <p className="footer__app-subtitle">15% discount on your first purchase</p>
              <div className="footer__app-badges-row">
                <a href="#!" className="footer__app-badge" id="google-play-btn" aria-label="Get it on Google Play">
                  <GooglePlayBadge />
                </a>
                <a href="#!" className="footer__app-badge" id="app-store-btn" aria-label="Download on App Store">
                  <AppStoreBadge />
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="footer__bottom-bar">
        <div className="footer__container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
          <p className="footer__copyright">
            <strong>ASTROGIFTS</strong> © 2026 CREATED BY <strong>XTEMOS STUDIO</strong>. PREMIUM E-COMMERCE SOLUTIONS.
          </p>
          <div className="footer__payments" aria-label="Supported payment methods">
            <VisaIcon />
            <MastercardIcon />
            <PayPalIcon />
            <AmexIcon />
            <DiscoverIcon />
            <MaestroIcon />
          </div>
        </div>
      </div>
    </footer>
  );
}
