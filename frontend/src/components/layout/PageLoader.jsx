import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './PageLoader.css';

export default function PageLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Scroll page to top on route change
    window.scrollTo(0, 0);

    setLoading(true);
    setFadingOut(false);

    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 320);

    const endTimer = setTimeout(() => {
      setLoading(false);
      setFadingOut(false);
    }, 450);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [location.pathname, location.search]);

  if (!loading) return null;

  return (
    <div className={`wm-global-page-loader ${fadingOut ? 'wm-loader--fade-out' : ''}`}>
      <div className="wm-top-progress-bar"></div>
      <div className="wm-loader-card">
        <div className="wm-loader-icon-wrap">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#7c3a1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12v10H4V12"/>
            <path d="M22 7H2v5h20V7z"/>
            <path d="M12 22V7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
          </svg>
          <div className="wm-loader-spinner-ring"></div>
        </div>
        <div className="wm-loader-brand">
          Astro<span className="wm-brand-highlight">Gifts</span>
        </div>
        <div className="wm-loader-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
}
