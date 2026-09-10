import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import {
  FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon, LogoIcon,
  GooglePlayBadge, AppStoreBadge
} from '../../assets/icons/Icons';

const usefulLinks = [
  { name: 'About Us', path: '/' },
  { name: 'Blog Journal', path: '/blog' },
  { name: 'My Orders', path: '/my-orders' },
  { name: 'Account Profile', path: '/profile' },
  { name: 'Admin Portal', path: '/admin/login' },
];

const categories1 = [
  { name: 'Chairs', slug: 'chairs' },
  { name: 'Tables', slug: 'tables' },
  { name: 'Sofas', slug: 'sofas' },
  { name: 'Armchairs', slug: 'armchairs' },
  { name: 'Beds', slug: 'beds' }
];

const categories2 = [
  { name: 'Storage', slug: 'storage' },
  { name: 'Textiles', slug: 'textiles' },
  { name: 'Lighting', slug: 'lighting' },
  { name: 'Toys', slug: 'toys' },
  { name: 'Decor', slug: 'decor' }
];

/* ── Real SVG Payment Card Icons ── */
const VisaIcon = () => (
  <svg width="46" height="28" viewBox="0 0 46 28" xmlns="http://www.w3.org/2000/svg">
    <rect width="46" height="28" rx="4" fill="#1A1F71"/>
    <text x="5" y="20" fill="#FFFFFF" fontSize="13" fontFamily="Arial, sans-serif" fontWeight="900" letterSpacing="0.8">VISA</text>
  </svg>
);

const MastercardIcon = () => (
  <svg width="40" height="28" viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="28" rx="4" fill="#1A1A1A"/>
    <circle cx="15" cy="14" r="9" fill="#EB001B"/>
    <circle cx="25" cy="14" r="9" fill="#F79E1B"/>
    <path d="M20 6.6a9 9 0 0 1 0 14.8A9 9 0 0 1 20 6.6z" fill="#FF5F00"/>
  </svg>
);

const PayPalIcon = () => (
  <svg width="42" height="28" viewBox="0 0 42 28" xmlns="http://www.w3.org/2000/svg">
    <rect width="42" height="28" rx="4" fill="#003087"/>
    <text x="5" y="19" fill="#0079C1" fontSize="12" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic">Pay</text>
    <text x="23" y="19" fill="#00457C" fontSize="12" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic">Pal</text>
  </svg>
);

const AmexIcon = () => (
  <svg width="40" height="28" viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="28" rx="4" fill="#0077A6"/>
    <text x="4" y="18" fill="#FFFFFF" fontSize="9" fontFamily="Arial, sans-serif" fontWeight="900" letterSpacing="0.5">AMEX</text>
  </svg>
);

const DiscoverIcon = () => (
  <svg width="46" height="28" viewBox="0 0 46 28" xmlns="http://www.w3.org/2000/svg">
    <rect width="46" height="28" rx="4" fill="#F4F4F4" stroke="#D1D5DB" strokeWidth="0.5"/>
    <text x="4" y="18" fill="#FF6000" fontSize="8.5" fontFamily="Arial, sans-serif" fontWeight="900">DISCOVER</text>
  </svg>
);

const MaestroIcon = () => (
  <svg width="40" height="28" viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="28" rx="4" fill="#1A1A1A"/>
    <circle cx="14.5" cy="14" r="9" fill="#EB001B"/>
    <circle cx="25.5" cy="14" r="9" fill="#0099DF" opacity="0.9"/>
    <path d="M20 6.6a9 9 0 0 1 0 14.8A9 9 0 0 1 20 6.6z" fill="#7673C0"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__main">
        <div className="footer__container">

          {/* ── TOP ROW: Logo & Subscribe ── */}
          <div className="footer__top-row">
            {/* Logo */}
            <Link to="/" className="footer__logo" id="footer-logo">
              <LogoIcon />
              <span className="footer__logo-text">
                Homewood Decor<span className="footer__logo-dot">.</span>
              </span>
            </Link>

            {/* Subscribe Us Social Block */}
            <div className="footer__social-block">
              <span className="footer__social-label">Subscribe us:</span>
              <div className="footer__social-links">
                <a href="#!" className="footer__social-btn footer__social-btn--facebook" aria-label="Facebook" id="social-fb">
                  <FacebookIcon />
                </a>
                <a href="#!" className="footer__social-btn footer__social-btn--twitter" aria-label="X" id="social-x">
                  <TwitterIcon />
                </a>
                <a href="#!" className="footer__social-btn footer__social-btn--instagram" aria-label="Instagram" id="social-ig">
                  <InstagramIcon />
                </a>
                <a href="#!" className="footer__social-btn footer__social-btn--youtube" aria-label="YouTube" id="social-yt">
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

            {/* Col 2: Categories (Part 1) */}
            <div className="footer__col">
              <h4 className="footer__col-title">Categories</h4>
              <ul className="footer__list">
                {categories1.map((cat) => (
                  <li key={cat.name}>
                    <Link to={`/category/${cat.slug}`} className="footer__link">{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Categories (Part 2) */}
            <div className="footer__col footer__col--aligned">
              <ul className="footer__list">
                {categories2.map((cat) => (
                  <li key={cat.name}>
                    <Link to={`/category/${cat.slug}`} className="footer__link">{cat.name}</Link>
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
      <div className="footer__bottom">
        <div className="footer__container footer__bottom-inner">
          <p className="footer__copyright">
            <strong>HOMEWOOD DECOR</strong> © 2026 CREATED BY <strong>XTEMOS STUDIO</strong>. PREMIUM E-COMMERCE SOLUTIONS.
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
