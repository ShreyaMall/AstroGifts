import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import React, { useState, useEffect } from 'react';

import HeroSlider from '../components/home/HeroSlider';
import OurCategories from '../components/home/OurCategories';
import WeeklyBestsellers from '../components/home/WeeklyBestsellers';
import ProductCollections from '../components/home/ProductCollections';
import LatestArticles from '../components/home/LatestArticles';

import { WhatsappIcon } from '../assets/icons/Icons';

export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('+911234567890');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
        const res = await fetch(`${baseUrl}/settings/whatsapp`);
        const data = await res.json();
        if (data.whatsapp_number) {
          setWhatsappNumber(data.whatsapp_number);
        }
      } catch (err) {
        console.warn('Could not fetch whatsapp number', err);
      }
    };
    fetchSettings();
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="homepage-view">
      <Header />
      <main>
        <HeroSlider />
        <OurCategories />
        <WeeklyBestsellers />
        <ProductCollections />
        <LatestArticles />
      </main>
      <Footer />

      {/* WhatsApp Floating Button */}
      <a
        href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        aria-label="Chat on WhatsApp"
        style={{
          position: 'fixed',
          bottom: showScrollTop ? '140px' : '80px', /* Shift up if scroll-to-top is visible */
          right: '20px',
          backgroundColor: '#25D366',
          color: '#ffffff',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 999,
          transition: 'bottom 0.3s ease'
        }}
      >
        <WhatsappIcon />
      </a>

      {showScrollTop && (
        <button
          className="scroll-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          style={{
            position: 'fixed',
            bottom: '80px', /* Above bottom nav */
            right: '20px',
            backgroundColor: '#ffffff',
            color: '#1c1c1c',
            border: 'none',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 999
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      )}
    </div>
  );
}
