import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSlider.css';
import { useCart } from '../../context/CartContext';

import sliderBg1 from '../../assets/wd-furniture-slider-111.jpg.webp';
import sliderBg2 from '../../assets/wd-furniture-slider-112.jpg.webp';
import sliderBg3 from '../../assets/wd-furniture-slider-113.jpg.webp';

/* =====================================================
   SLIDE DATA - Exact 3 slides matching user screenshots
   ===================================================== */
const slides = [
  {
    id: 1,
    bgImg: sliderBg1,
    badgeText: 'Discover more products',
    badgeUnderline: 'chair',
    title: 'Upholstered chair',
    designer: 'Esther Howard',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    price: '₹468',
    cta: 'Shop Now',
    badgeIcon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="1.8">
        <path d="M7 11V6a3 3 0 0 1 6 0v5" />
        <rect x="5" y="11" width="14" height="6" rx="2" />
        <path d="M7 17v4M17 17v4" />
      </svg>
    ),
  },
  {
    id: 2,
    bgImg: sliderBg2,
    badgeText: 'Discover more products',
    badgeUnderline: 'sofas',
    title: 'Sectional fabric sofa',
    designer: 'Ramón Esteve',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    price: '₹3620',
    cta: 'Shop Now',
    badgeIcon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="1.8">
        <path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
        <rect x="2" y="11" width="20" height="6" rx="2" />
        <path d="M5 17v3M19 17v3" />
      </svg>
    ),
  },
  {
    id: 3,
    bgImg: sliderBg3,
    badgeText: 'Discover more products',
    badgeUnderline: 'decor',
    title: 'Terracotta vase',
    designer: 'Courtney Henry',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
    price: '₹182',
    cta: 'Shop Now',
    badgeIcon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="1.8">
        <path d="M10 2h4l1 5h-6l1-5z" />
        <path d="M9 7c-2 0-4 3-4 7 0 5 3 8 7 8s7-3 7-8c0-4-2-7-4-7" />
      </svg>
    ),
  },
];

export default function HeroSlider() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [current, setCurrent] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const transitionTimeoutRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const goTo = useCallback((nextIdx) => {
    if (nextIdx === current) return;
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    setPrevSlide(current);
    setCurrent(nextIdx);
    setIsTransitioning(true);

    transitionTimeoutRef.current = setTimeout(() => {
      setPrevSlide(null);
      setIsTransitioning(false);
    }, 750);
  }, [current]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      next();
    } else if (distance < -50) {
      prev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

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
          if (idx === current && isTransitioning) {
            slideClass += ' hero__slide--entering-rtl';
          } else if (idx === prevSlide && isTransitioning) {
            slideClass += ' hero__slide--exiting-rtl';
          } else if (idx === current) {
            slideClass += ' hero__slide--active';
          }

          return (
            <div
              key={slide.id}
              className={slideClass}
              style={{
                backgroundImage: `url(${slide.bgImg})`,
              }}
            >
              <div className="hero__container">
                {/* ====== LEFT PANEL: Content matching exact screenshot ====== */}
                <div className="hero__left">
                  {/* Badge */}
                  <div className="hero__badge">
                    <span className="hero__badge-icon-wrap">
                      {slide.badgeIcon}
                    </span>
                    <div className="hero__badge-text-wrap">
                      <span className="hero__badge-title">{slide.badgeText}</span>
                      <span className="hero__badge-category">
                        in the{' '}
                        <u className="hero__badge-u">{slide.badgeUnderline}</u>
                        {' '}category
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="hero__title">{slide.title}</h1>

                  {/* Designer Row: by Designer Name */}
                  <div className="hero__designer-row">
                    <span className="hero__by">by</span>
                    <span className="hero__designer-name">{slide.designer}</span>
                  </div>

                  {/* Action Row: Shop Now Button + Price */}
                  <div className="hero__actions">
                    <button
                      className="hero__cta"
                      id={`slide-cta-${slide.id}`}
                      onClick={() => navigate('/category/wooden-furniture')}
                    >
                      {slide.cta}
                    </button>
                    <span className="hero__price">{slide.price}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ====== PREV / NEXT ARROWS ====== */}
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

      {/* ====== DOTS PAGINATION ====== */}
      <div className="hero__dots-wrap">
        <div className="hero__dots">
          {slides.map((s, i) => (
            <button
              key={s.id}
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
