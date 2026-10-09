import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { WhatsappIcon } from '../../assets/icons/Icons';
import './WhatsAppFloat.css';

export default function WhatsAppFloat() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('+911234567890');
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
        const res = await fetch(`${baseUrl}/settings/whatsapp`);
        const data = await res.json();
        if (data && data.whatsapp_number) {
          setWhatsappNumber(data.whatsapp_number);
        }
      } catch (err) {
        console.warn('Could not fetch whatsapp number', err);
      }
    };
    fetchSettings();

    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="floating-actions-container">
      {showScrollTop && (
        <button
          className="scroll-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      )}

      <a
        href={`https://wa.me/${cleanNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        aria-label="Chat on WhatsApp"
      >
        <WhatsappIcon />
      </a>
    </div>
  );
}