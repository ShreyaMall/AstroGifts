import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HeroSlider.css';
import { useCart } from '../../context/CartContext';
import { slidersApi } from '../../services/api';

import sliderBg1 from '../../assets/hero slider1.png';
import sliderBg2 from '../../assets/hero slider 3.png';
import sliderBg3 from '../../assets/hero slider 4.png';

/* =====================================================
   STATIC FALLBACK DATA (jab API nahi chal rahi)
   ===================================================== */
const FALLBACK_SLIDES = [
  {
    id: 1,
    bgImg: sliderBg1,
    badge_text: 'Discover Premium Gifts',
    badge_category: 'gifts',
    title: 'Exclusive Gift Sets & Hampers',
    designer: 'AstroGifts Studio',
    avatar: 'https://i.pravatar.cc/150?u=astrogifts1',
    price: '₹499',
    cta_text: 'Shop Gifts',
    link: '/category/gifts',
  },
  {
    id: 2,
    bgImg: sliderBg2,
    badge_text: 'Explore Fun Toys',
    badge_category: 'toys',
    title: 'Interactive Toys & Educational Games',
    designer: 'AstroGifts Kids',
    avatar: 'https://i.pravatar.cc/150?u=astrogifts2',
    price: '₹299',
    cta_text: 'Shop Toys',
    link: '/category/toys',
  },
  {
    id: 3,
    bgImg: sliderBg3,
    badge_text: 'Sacred Astrology',
    badge_category: 'astrology',
    title: 'Natural Gemstones & Healing Crystals',
    designer: 'AstroGifts Astro',
    avatar: 'https://i.pravatar.cc/150?u=astrogifts3',
    price: '₹799',
    cta_text: 'Shop Astrology',
    link: '/category/astrology',
  },
];

function getSlideTargetLink(slide) {
  if (slide?.link) {
    if (slide.link.startsWith('/category/')) return slide.link;
    if (slide.link === '/shop' || slide.link === '/wooden-furniture') return '/category/gifts';
    const clean = slide.link.replace(/^\//, '').toLowerCase();
    if (['gifts', 'toys', 'astrology', 'diwali-gifts', 'birthday-gifts', 'anniversary-gifts', 'soft-toys', 'baby-toys', 'board-games', 'rings', 'pendants', 'bracelets', 'gemstones-crystals'].includes(clean)) {
      return `/category/${clean}`;
    }
  }
  return '/category/gifts';
}

const ASSET_MAP = {
  'hero slider1.png': sliderBg1,
  '/hero slider1.png': sliderBg1,
  'hero slider 3.png': sliderBg2,
  '/hero slider 3.png': sliderBg2,
  'hero slider 4.png': sliderBg3,
  '/hero slider 4.png': sliderBg3,
  'wd-furniture-slider-111.jpg.webp': sliderBg1,
  '/wd-furniture-slider-111.jpg.webp': sliderBg1,
  'wd-furniture-slider-112.jpg.webp': sliderBg2,
  '/wd-furniture-slider-112.jpg.webp': sliderBg2,
  'wd-furniture-slider-113.jpg.webp': sliderBg3,
  '/wd-furniture-slider-113.jpg.webp': sliderBg3,
};

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://127.0.0.1:8000';

/** Backend / frontend image URL resolve karta hai */
function resolveImage(slide) {
  if (slide.bgImg) return slide.bgImg;
  const imgPath = slide.image || '';
  if (!imgPath) return sliderBg1;

  // Local assets match
  const filename = imgPath.split('/').pop();
  if (ASSET_MAP[imgPath] || ASSET_MAP[filename]) {
    return ASSET_MAP[imgPath] || ASSET_MAP[filename];
  }
  if (filename.includes('slider-111') || filename.includes('111')) return sliderBg1;
  if (filename.includes('slider-112') || filename.includes('112')) return sliderBg2;
  if (filename.includes('slider-113') || filename.includes('113')) return sliderBg3;

  // External URL
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
    return imgPath;
  }

  // Uploaded via Laravel storage
  if (imgPath.startsWith('/storage/') || imgPath.startsWith('storage/')) {
    return `${API_BASE}/${imgPath.replace(/^\//, '')}`;
  }

  // Public asset
  return `/${imgPath.replace(/^\//, '')}`;
}

const formatSlidePrice = (p) => {
  if (!p) return '';
  let str = String(p).trim().replace(/\$/g, '₹');
  if (!str.startsWith('₹')) {
    str = '₹' + str;
  }
  return str;
};

export default function HeroSlider() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const transitionTimeoutRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  /* ── API Se Slides Load ── */
  useEffect(() => {
    slidersApi.getAll()
      .then(res => {
        const apiSlides = res?.data || [];
        if (apiSlides.length > 0) {
          setSlides(apiSlides);
        }
        // agar API se koi slide nahi aai toh fallback rehta hai
      })
      .catch(() => {
        // Silently use fallback — no error shown to user
      })
      .finally(() => setLoading(false));
  }, []);

  const goTo = useCallback((nextIdx) => {
    if (nextIdx === current) return;
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    setPrevSlide(current);
    setCurrent(nextIdx);
    setIsTransitioning(true);
    transitionTimeoutRef.current = setTimeout(() => {
      setPrevSlide(null);
      setIsTransitioning(false);
    }, 750);
  }, [current]);

  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo, slides.length]);
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo, slides.length]);

  useEffect(() => {
    if (isPaused || loading) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isPaused, loading]);

  useEffect(() => {
    return () => { if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current); };
  }, []);

  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchMove  = (e) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd   = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) next();
    else if (distance < -50) prev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (loading) {
    return (
      <section className="hero" id="hero-slider" style={{ background: '#f5f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: '#888' }}>Loading slides…</div>
      </section>
    );
  }

  return (
    <section
      className="hero"
      id="hero-slider"
      aria-label="Hero product slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sliding Stage */}
      <div className="hero__slider-stage">
        {slides.map((slide, idx) => {
          let slideClass = 'hero__slide';
          if (idx === current && isTransitioning)       slideClass += ' hero__slide--entering-rtl';
          else if (idx === prevSlide && isTransitioning) slideClass += ' hero__slide--exiting-rtl';
          else if (idx === current)                      slideClass += ' hero__slide--active';

          const designerName = (slide.designer || slide.subtitle || '').replace(/^by\s+/i, '').trim();
          const badgeCategory = slide.badge_category || (slide.link?.includes('chair') ? 'chairs' : slide.link?.includes('sofa') ? 'sofas' : slide.link?.includes('decor') ? 'decor' : 'furniture');
          const targetLink = getSlideTargetLink(slide);

          return (
            <div
              key={slide._id || slide.id}
              className={slideClass}
              style={{ backgroundImage: `url(${resolveImage(slide)})` }}
            >
              <div className="hero__container">
                {/* ====== LEFT PANEL ====== */}
                <div className="hero__left">

                  {/* Badge */}
                  <Link to={targetLink} className="hero__badge" style={{ textDecoration: 'none' }}>
                    <span className="hero__badge-icon-wrap">
                      {(() => {
                        const cat = (slide.badge_category || badgeCategory || '').toLowerCase();
                        if (cat.includes('toy')) {
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="6" width="20" height="12" rx="3" />
                              <path d="M6 12h4m-2-2v4" />
                              <circle cx="17" cy="10" r="1" fill="#2c2c2c" />
                              <circle cx="15" cy="13" r="1" fill="#2c2c2c" />
                            </svg>
                          );
                        }
                        if (cat.includes('astro') || cat.includes('crystal') || cat.includes('gem')) {
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          );
                        }
                        return (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 12 20 22 4 22 4 12" />
                            <rect x="2" y="7" width="20" height="5" rx="1" />
                            <line x1="12" y1="22" x2="12" y2="7" />
                            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                          </svg>
                        );
                      })()}
                    </span>
                    <div className="hero__badge-text-wrap">
                      <span className="hero__badge-title">{slide.badge_text || 'Discover more products'}</span>
                      <span className="hero__badge-category">
                        in the{' '}
                        <u className="hero__badge-u">{slide.badge_category || badgeCategory}</u>
                        {' '}category
                      </span>
                    </div>
                  </Link>

                  {/* Title */}
                  <Link to={targetLink} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h1 className="hero__title" style={{ cursor: 'pointer' }}>{slide.title}</h1>
                  </Link>

                  {/* Designer Row */}
                  {designerName && (
                    <div className="hero__designer-row">
                      <span className="hero__by">by</span>
                      {slide.avatar && <img className="hero__avatar" src={slide.avatar} alt="Designer" />}
                      <span className="hero__designer-name">{designerName}</span>
                    </div>
                  )}

                  {/* Action Row */}
                  <div className="hero__actions">
                    <Link
                      to="/category/wooden-furniture"
                      className="hero__cta"
                      id={`slide-cta-${slide._id || slide.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/category/wooden-furniture');
                      }}
                    >
                      {slide.cta_text || 'Shop Now'}
                    </Link>
                    {slide.price && (
                      <Link to="/category/wooden-furniture" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <span className="hero__price" style={{ cursor: 'pointer' }}>{formatSlidePrice(slide.price)}</span>
                      </Link>
                    )}
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PREV / NEXT ARROWS */}
      <button className="hero__arrow hero__arrow--prev" onClick={prev} aria-label="Previous slide">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button className="hero__arrow hero__arrow--next" onClick={next} aria-label="Next slide">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {/* DOTS PAGINATION */}
      <div className="hero__dots-wrap">
        <div className="hero__dots">
          {slides.map((s, i) => (
            <button
              key={s._id || s.id}
              className={`hero__dot${i === current ? ' hero__dot--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
