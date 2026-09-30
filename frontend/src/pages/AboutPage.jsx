import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { reviewsApi } from '../services/api';
import './AboutPage.css';

import giftsImage from '../assets/gifts.jpg';
import astroImage from '../assets/astro.jpg';
import toysImage from '../assets/toys_collection_banner.jpg';

export default function AboutPage() {
  const [statsData, setStatsData] = useState({
    customers: '50,000+',
    quality: '100%',
    rating: '4.9 ★'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Dynamic rating & metrics from API
    reviewsApi.getAll()
      .then(res => {
        if (res && res.data && res.data.length > 0) {
          const totalRating = res.data.reduce((acc, curr) => acc + Number(curr.rating || 5), 0);
          const avg = (totalRating / res.data.length).toFixed(1);
          setStatsData(prev => ({ ...prev, rating: `${avg} ★` }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="about-page">
      <Header />

      {/* ── HERO BANNER ── */}
      <section className="about-hero">
        <div className="about-hero__container">
          <div className="about-hero__badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3a1d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            OUR STORY & VISION
          </div>
          <h1 className="about-hero__title">
            Crafting Moments of Joy & <span className="about-hero__highlight">Celestial Harmony</span>
          </h1>
          <p className="about-hero__subtitle">
            Welcome to <strong>AstroGifts</strong> — your premier online sanctuary for handcrafted gifts, 
            interactive wooden toys, authentic gemstones, and spiritual home decor.
          </p>
        </div>
      </section>

      {/* ── ABOUT INTRO GRID ── */}
      <section className="about-section about-container">
        <div className="about-grid">
          <div className="about-grid__text">
            <span className="about-tag">WHO WE ARE</span>
            <h2 className="about-heading">Connecting Hearts Through Thoughtful Gifting</h2>
            <p className="about-desc">
              Founded with a passion for bringing heartfelt smiles and positive energy into homes, 
              <strong> AstroGifts</strong> combines the art of luxury gifting with ancient astrological wisdom.
            </p>
            <p className="about-desc">
              Whether you are celebrating a birthday, anniversary, or Diwali, seeking sacred birthstones 
              for personal growth, or finding non-toxic toys for your little ones, every product in our 
              catalog is hand-curated with love, care, and highest quality standards.
            </p>

            <div className="about-stats-row">
              <div className="about-stat">
                <span className="about-stat__num">{statsData.customers}</span>
                <span className="about-stat__lbl">Happy Customers</span>
              </div>
              <div className="about-stat">
                <span className="about-stat__num">{statsData.quality}</span>
                <span className="about-stat__lbl">Authentic & Certified</span>
              </div>
              <div className="about-stat">
                <span className="about-stat__num">{statsData.rating}</span>
                <span className="about-stat__lbl">Customer Rating</span>
              </div>
            </div>
          </div>

          <div className="about-grid__image-wrap">
            <img src={giftsImage} alt="AstroGifts Hampers" className="about-grid__img" />
            <div className="about-grid__glass-card">
              <span className="about-glass-title" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3a1d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <polyline points="20 12 20 22 4 22 4 12"/>
                  <rect x="2" y="7" width="20" height="5"/>
                  <line x1="12" y1="22" x2="12" y2="7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
                Premium Packaging
              </span>
              <span className="about-glass-sub">Custom handwritten notes & luxury hampers</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR PILLARS / CATEGORIES SECTION ── */}
      <section className="about-pillars-section">
        <div className="about-container">
          <div className="about-center-header">
            <span className="about-tag">WHAT WE OFFER</span>
            <h2 className="about-heading">Our Core Collection Pillars</h2>
            <p className="about-subtitle">Explore the carefully crafted categories that make AstroGifts special.</p>
          </div>

          <div className="about-pillars-grid">
            {/* Pillar 1 */}
            <div className="about-pillar-card">
              <div className="about-pillar-card__icon-wrap">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3a1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12"/>
                  <rect x="2" y="7" width="20" height="5"/>
                  <line x1="12" y1="22" x2="12" y2="7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
              </div>
              <h3 className="about-pillar-card__title">Luxury Gift Hampers</h3>
              <p className="about-pillar-card__desc">
                From birthday gift boxes to anniversary keepsakes and festive hampers, designed to make every occasion unforgettable.
              </p>
              <Link to="/category/gifts" className="about-pillar-link">Shop Gifts →</Link>
            </div>

            {/* Pillar 2 */}
            <div className="about-pillar-card">
              <div className="about-pillar-card__icon-wrap">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3a1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="3" />
                  <path d="M6 12h4m-2-2v4" />
                  <circle cx="17" cy="10" r="1" fill="#7c3a1d" />
                  <circle cx="15" cy="13" r="1" fill="#7c3a1d" />
                </svg>
              </div>
              <h3 className="about-pillar-card__title">Safe & Fun Toys</h3>
              <p className="about-pillar-card__desc">
                Eco-friendly wooden toys, plush teddy bears, and cognitive board games crafted for growing young minds.
              </p>
              <Link to="/category/toys" className="about-pillar-link">Shop Toys →</Link>
            </div>

            {/* Pillar 3 */}
            <div className="about-pillar-card">
              <div className="about-pillar-card__icon-wrap">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3a1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 22 8.5 17 22 7 22 2 8.5 12 2" />
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="2" y1="8.5" x2="22" y2="8.5" />
                </svg>
              </div>
              <h3 className="about-pillar-card__title">Astrology & Gemstones</h3>
              <p className="about-pillar-card__desc">
                Certified healing crystals, Rose Quartz, Amethyst, and birthstone rings crafted to bring positive cosmic alignment.
              </p>
              <Link to="/category/astrology" className="about-pillar-link">Shop Astrology →</Link>
            </div>

            {/* Pillar 4 */}
            <div className="about-pillar-card">
              <div className="about-pillar-card__icon-wrap">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3a1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3 className="about-pillar-card__title">Spiritual Home Decor</h3>
              <p className="about-pillar-card__desc">
                Handcrafted idols, brass diyas, aromatic candles, and fresh floral decor for a harmonious living sanctuary.
              </p>
              <Link to="/category/decor" className="about-pillar-link">Shop Decor →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="about-why-section about-container">
        <div className="about-center-header">
          <span className="about-tag">WHY CHOOSE US</span>
          <h2 className="about-heading">The AstroGifts Promise</h2>
        </div>

        <div className="about-features-grid">
          <div className="about-feature-item">
            <div className="about-feature-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3a1d" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h4>100% Quality Guaranteed</h4>
            <p>Every product passes thorough quality testing and energy verification before dispatch.</p>
          </div>

          <div className="about-feature-item">
            <div className="about-feature-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3a1d" strokeWidth="2.5">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <h4>Pan-India Express Shipping</h4>
            <p>Swift, safe, and reliable doorstep delivery with real-time tracking across India.</p>
          </div>

          <div className="about-feature-item">
            <div className="about-feature-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3a1d" strokeWidth="2.5">
                <polyline points="20 12 20 22 4 22 4 12"/>
                <rect x="2" y="7" width="20" height="5"/>
                <line x1="12" y1="22" x2="12" y2="7"/>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
            </div>
            <h4>Luxury Gift Presentation</h4>
            <p>Custom gift wraps, ribbons, and personalized greeting cards included with every gift.</p>
          </div>

          <div className="about-feature-item">
            <div className="about-feature-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3a1d" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h4>24/7 Dedicated Support</h4>
            <p>Our customer happiness team is always ready to assist you via WhatsApp & email.</p>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="about-cta">
        <div className="about-container about-cta__inner">
          <div className="about-cta__badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d96b27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <polyline points="20 12 20 22 4 22 4 12"/>
              <rect x="2" y="7" width="20" height="5"/>
              <line x1="12" y1="22" x2="12" y2="7"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
            START SHOPPING WITH ASTROGIFTS
          </div>
          <h2 className="about-cta__title">Ready to Find the Perfect Gift?</h2>
          <p className="about-cta__desc">
            Explore thousands of curated hampers, safe toys, certified gemstones, and home accents today.
          </p>
          <div className="about-cta__buttons">
            <Link to="/category/gifts" className="about-btn about-btn--primary">Shop Collections</Link>
            <Link to="/contact-us" className="about-btn about-btn--secondary">Contact Support</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
