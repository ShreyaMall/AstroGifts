import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './CategoryPage.css';
import { productsApi } from '../services/api';
import ProductCard from '../components/shop/ProductCard';
import CategoryFilters from '../components/shop/CategoryFilters';

import img_gifts_banner from '../assets/gifts.jpg';
import img_toys_banner from '../assets/toys_collection_banner.jpg';
import img_astrology_banner from '../assets/astro.jpg';
import img_flowers_banner from '../assets/flowers.jpg';
import img_gift_box from '../assets/gift image.jpg';
import img_astro_item from '../assets/astri image.jpg';
import img_crystal from '../assets/Rose_Quartz.webp';

const HERO_CONFIG = {
  gifts: { label: 'Gifts', img: img_gifts_banner, bg: 'linear-gradient(135deg,#7c3a1d 0%,#a04f29 50%,#2c1510 100%)' },
  toys: { label: 'Toys', img: img_toys_banner, bg: 'linear-gradient(135deg,#2e7d32 0%,#4caf50 100%)' },
  astrology: { label: 'Astrology', img: img_astrology_banner, bg: 'linear-gradient(135deg,#4a148c 0%,#7b1fa2 100%)' },
  flowers: { label: 'Flowers', img: img_flowers_banner, bg: 'linear-gradient(135deg,#ad1457 0%,#f06292 100%)' },
  decor: { label: 'Decor', img: img_gift_box, bg: 'linear-gradient(135deg,#7c3a1d 0%,#b85d32 100%)' },
  'diwali-gifts': { label: 'Diwali Gifts', img: img_gifts_banner, bg: 'linear-gradient(135deg,#7c3a1d 0%,#d4af37 100%)' },
  'birthday-gifts': { label: 'Birthday Gifts', img: img_gift_box, bg: 'linear-gradient(135deg,#880e4f 0%,#ec407a 100%)' },
  'anniversary-gifts': { label: 'Anniversary Gifts', img: img_gifts_banner, bg: 'linear-gradient(135deg,#7c3a1d 0%,#c2185b 100%)' },
  'soft-toys': { label: 'Soft Toys', img: img_toys_banner, bg: 'linear-gradient(135deg,#e65100 0%,#ff9800 100%)' },
  'baby-toys': { label: 'Baby Toys', img: img_toys_banner, bg: 'linear-gradient(135deg,#0277bd 0%,#29b6f6 100%)' },
  'board-games': { label: 'Board Games', img: img_toys_banner, bg: 'linear-gradient(135deg,#2e7d32 0%,#66bb6a 100%)' },
  'rings': { label: 'Rings', img: img_astro_item, bg: 'linear-gradient(135deg,#4a148c 0%,#8e2de2 100%)' },
  'pendants': { label: 'Pendants', img: img_astrology_banner, bg: 'linear-gradient(135deg,#4a148c 0%,#ab47bc 100%)' },
  'bracelets': { label: 'Bracelets', img: img_crystal, bg: 'linear-gradient(135deg,#311b92 0%,#673ab7 100%)' },
  'gemstones-crystals': { label: 'Gemstones & Crystals', img: img_crystal, bg: 'linear-gradient(135deg,#1a237e 0%,#3f51b5 100%)' },
  'astrogifts': { label: 'All Products', img: img_gifts_banner, bg: 'linear-gradient(135deg,#7c3a1d 0%,#4a2511 100%)' },
};

export default function CategoryPage({ categorySlug }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawSlug = (categorySlug || slug || 'gifts').toLowerCase();
  const activeSlug = rawSlug.replace(/_/g, '-');
  const hero = HERO_CONFIG[activeSlug] || HERO_CONFIG.gifts;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facets, setFacets] = useState({});
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid-3');

  const abortControllerRef = useRef(null);
  const debounceRef = useRef(null);

  // Always inject the route-level slug as "category" so the backend resolves
  // parent/child relationships correctly. Filters (brand, color, etc.) are
  // additional URL params layered on top.
  const buildQueryParams = () => {
    const params = Object.fromEntries(searchParams.entries());
    if (activeSlug && activeSlug !== 'all' && activeSlug !== 'shop' && activeSlug !== 'astrogifts') {
      // Force the route slug as the base category — never let user-set params override it
      params.category = activeSlug;
    }
    return params;
  };

  const fetchProducts = async (isLoadMore = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!isLoadMore) setLoading(true);

    try {
      const params = buildQueryParams();
      
      const [prodsRes, facetsRes] = await Promise.all([
        productsApi.getAll(params, { signal: abortControllerRef.current.signal }),
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'}/products/facets?${new URLSearchParams(params).toString()}`).then(r => r.json())
      ]);

      if (prodsRes?.status === 'success') {
        if (isLoadMore) {
          setProducts(prev => [...prev, ...prodsRes.data]);
        } else {
          setProducts(prodsRes.data || []);
        }
        setTotalResults(prodsRes.meta?.total || 0);
        setTotalPages(prodsRes.meta?.last_page || 1);
      }
      
      if (facetsRes?.status === 'success') {
        setFacets(facetsRes.facets || {});
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load products', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts();
      if (searchParams.get('page') == '1' || !searchParams.get('page')) {
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchParams, activeSlug]);

  const updateFilters = (newFilters) => {
    const updatedParams = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') updatedParams.delete(k);
      else updatedParams.set(k, String(v));
    });
    // Reset page when filters change (but not when page itself changes)
    if (!('page' in newFilters)) updatedParams.set('page', '1');
    setSearchParams(updatedParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const removeFilter = (key, value) => {
    if (key === 'price') {
      updateFilters({ minPrice: null, maxPrice: null, page: 1 });
      return;
    }
    const current = searchParams.get(key);
    if (!current) return;
    if (current.includes(',')) {
      const arr = current.split(',').filter(v => v !== value);
      updateFilters({ [key]: arr.join(','), page: 1 });
    } else {
      updateFilters({ [key]: null, page: 1 });
    }
  };

  const getActiveChips = () => {
    const chips = [];
    const SKIP = new Set(['page', 'per_page', 'sort', 'search', 'category', 'minPrice', 'maxPrice']);
    searchParams.forEach((value, key) => {
      if (SKIP.has(key)) return;
      value.split(',').forEach(v => {
        chips.push({ key, value: v, label: v });
      });
    });
    const minP = searchParams.get('minPrice');
    const maxP = searchParams.get('maxPrice');
    if (minP || maxP) {
      chips.push({ key: 'price', value: 'price', label: `₹${minP || 0} – ₹${maxP || '…'}` });
    }
    return chips;
  };

  const activeChips = getActiveChips();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '12', 10);

  const heroStyle = hero.img
    ? { backgroundImage: `url(${hero.img})`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }
    : { background: hero.bg };

  return (
    <div className="cp-page">
      <Header />

      {/* MOBILE STICKY HEADER */}
      <div className="cp-mobile-header">
        <button className="cp-mobile-back-btn" onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <h1 className="cp-mobile-title">{hero.label}</h1>
      </div>

      {/* HERO BANNER (Desktop Only) */}
      <div className="cp-hero" style={heroStyle}>
        <div className="cp-hero__inner">
          <h1 className="cp-hero__title">
            <button className="cp-hero__back-btn" onClick={() => navigate('/')}>←</button>
            {hero.label}
          </h1>
        </div>
      </div>

      {/* MOBILE STICKY TOOLBAR */}
      <div className="cp-mobile-sticky-toolbar">
        <button className="cp-mobile-filter-btn" onClick={() => setIsMobileFilterOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filter
          {activeChips.length > 0 && <span className="cp-filter-badge">{activeChips.length}</span>}
        </button>
        <div className="cp-mobile-sort-wrap">
          <select 
            value={searchParams.get('sort') || 'rating'} 
            onChange={e => updateFilters({ sort: e.target.value, page: 1 })}
          >
            <option value="rating">Sort by Rating</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* ACTIVE CHIPS ROW */}
      {activeChips.length > 0 && (
        <div className="cp-active-chips">
          {activeChips.map((chip, idx) => (
            <div key={`${chip.key}-${idx}`} className="cp-chip">
              {chip.label}
              <button onClick={() => removeFilter(chip.key, chip.value)}>✕</button>
            </div>
          ))}
          <button className="cp-chip-clear" onClick={clearFilters}>Clear all</button>
        </div>
      )}

      <div className="cp-body">
        <div className="cp-body__inner">

          <CategoryFilters 
            activeSlug={activeSlug}
            facets={facets}
            searchParams={searchParams}
            updateFilters={updateFilters}
            clearFilters={clearFilters}
            isMobileFilterOpen={isMobileFilterOpen}
            setIsMobileFilterOpen={setIsMobileFilterOpen}
            totalResults={totalResults}
          />

          <main className="cp-main">
            <div className="cp-toolbar cp-desktop-only">
              <div className="cp-toolbar-desktop-inner">
                <span className="cp-toolbar__count">
                  Showing {totalResults === 0 ? 0 : (currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, totalResults)} of {totalResults} results
                </span>
                <div className="cp-toolbar__right">
                  <span className="cp-toolbar__show">Show :</span>
                  {[6, 12, 24, 48].map(n => (
                    <button
                      key={n}
                      className={`cp-toolbar__n${perPage === n ? ' active' : ''}`}
                      onClick={() => updateFilters({ per_page: n, page: 1 })}
                    >{n}</button>
                  ))}
                  <div className="cp-toolbar__views">
                    <button className={`cp-view-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')}>☰</button>
                    <button className={`cp-view-btn${viewMode === 'grid-3' ? ' active' : ''}`} onClick={() => setViewMode('grid-3')}>⊞</button>
                    <button className={`cp-view-btn${viewMode === 'grid-2' ? ' active' : ''}`} onClick={() => setViewMode('grid-2')}>⊟</button>
                  </div>
                  <select
                    className="cp-sort-select"
                    value={searchParams.get('sort') || 'rating'}
                    onChange={e => updateFilters({ sort: e.target.value, page: 1 })}
                  >
                    <option value="rating">Sort by average rating</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                    <option value="newest">Newest first</option>
                  </select>
                </div>
              </div>
            </div>

            {loading && products.length === 0 ? (
              <div className="cp-grid cp-grid--3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="cp-skeleton-card">
                    <div className="cp-skel-img"></div>
                    <div className="cp-skel-text"></div>
                    <div className="cp-skel-text short"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`cp-grid cp-grid--${viewMode}`}>
                  {products.map(p => (
                    <ProductCard key={p.id || p._id} product={p} viewMode={viewMode} />
                  ))}
                </div>
                
                {/* PAGINATION */}
                {totalPages > 1 && (
                  <>
                    <div className="cp-mobile-load-more cp-mobile-only">
                      {currentPage < totalPages ? (
                        <button onClick={() => updateFilters({ page: currentPage + 1 })}>Load More</button>
                      ) : (
                        <span className="end-text">You've reached the end!</span>
                      )}
                    </div>
                    
                    <div className="cp-pagination cp-desktop-only">
                      <button
                        className="cp-page-btn cp-page-btn--nav"
                        disabled={currentPage === 1}
                        onClick={() => updateFilters({ page: Math.max(currentPage - 1, 1) })}
                      >‹</button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => totalPages <= 5 || p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, idx) => p === '...' ? (
                          <span key={`dots-${idx}`} className="cp-page-dots">…</span>
                        ) : (
                          <button
                            key={p}
                            className={`cp-page-btn${currentPage === p ? ' cp-page-btn--active' : ''}`}
                            onClick={() => updateFilters({ page: p })}
                          >{p}</button>
                        ))
                      }

                      <button
                        className="cp-page-btn cp-page-btn--nav"
                        disabled={currentPage === totalPages}
                        onClick={() => updateFilters({ page: Math.min(currentPage + 1, totalPages) })}
                      >›</button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="cp-empty">
                <p>No products match your current filters.</p>
                <button className="cp-empty__btn" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}
            
            {/* ── SEO TEXT ── */}
            <div className="cp-seo">
              <h2 className="cp-seo__h">Online store with a wide selection of gifts, toys & astro decor</h2>
              <p className="cp-seo__p">
                AstroGifts offers curated gift boxes, zodiac crystal gemstone sets, educational toys, and handcrafted spiritual decor.
                Whether you are looking for anniversary gifts, birthday hampers, or positive energy crystals, our collection brings joy and harmony to your loved ones.
              </p>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
