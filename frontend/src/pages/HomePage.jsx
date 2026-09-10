import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import React, { useState, useEffect } from 'react';

import HeroSlider from '../components/home/HeroSlider';
import OurCategories from '../components/home/OurCategories';
import WeeklyBestsellers from '../components/home/WeeklyBestsellers';
import ProductCollections from '../components/home/ProductCollections';
import LatestArticles from '../components/home/LatestArticles';

export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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

      {showScrollTop && (
        <button
          className="scroll-top-btn"
          onClick={scrollToTop}
          id="scroll-top-btn"
          aria-label="Scroll to top"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="19" x2="12" y2="5"/>
            <polyline points="5 12 12 5 19 12"/>
          </svg>
        </button>
      )}
    </div>
  );
}
