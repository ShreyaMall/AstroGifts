import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import './CategoryPage.css';
import { productsApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';


import img_chairs_banner from '../assets/chairs_banner.png';
import img_tables_banner from '../assets/table 1.jpg';
import img_sofas_banner from '../assets/sofa.jpg';
import img_armchairs_banner from '../assets/armchair.jpg';
import img_beds_banner from '../assets/beds.png';
import img_storage_banner from '../assets/storage.jpg';
import img_textiles_banner from '../assets/textile1.webp';
import img_lighting_banner from '../assets/light1.jpg';
import img_toys_banner from '../assets/toy1.jpg';
import img_decor_banner from '../assets/decor1.jpg';

/* ──────────────────────────────────────────────
   Hero images per category (bg colour fallback)
   ────────────────────────────────────────────── */
const HERO_CONFIG = {
  chairs:    { label: 'Chairs',    img: img_chairs_banner, bg: '#787055' },
  tables:    { label: 'Tables',    img: img_tables_banner, bg: 'linear-gradient(135deg,#8d7a60 0%,#c8b89a 100%)' },
  sofas:     { label: 'Sofas',     img: img_sofas_banner, bg: 'linear-gradient(135deg,#5a6e60 0%,#9ab5a0 100%)' },
  armchairs: { label: 'Armchairs', img: img_armchairs_banner, bg: 'linear-gradient(135deg,#6b6255 0%,#b0a090 100%)' },
  beds:      { label: 'Beds',      img: img_beds_banner, bg: 'linear-gradient(135deg,#7a6e80 0%,#c0b0c8 100%)' },
  storage:   { label: 'Storage',   img: img_storage_banner, bg: 'linear-gradient(135deg,#5c6870 0%,#8ca0aa 100%)' },
  textiles:  { label: 'Textiles',  img: img_textiles_banner, bg: 'linear-gradient(135deg,#70605a 0%,#b8a8a0 100%)' },
  lighting:  { label: 'Lighting',  img: img_lighting_banner, bg: 'linear-gradient(135deg,#706050 0%,#c0a880 100%)' },
  toys:      { label: 'Toys',      img: img_toys_banner, bg: 'linear-gradient(135deg,#587060 0%,#90b0a0 100%)' },
  decor:     { label: 'Decor',     img: img_decor_banner, bg: 'linear-gradient(135deg,#705868 0%,#b898a8 100%)' },
  'wooden-furniture': { label: 'Wooden furniture', img: img_chairs_banner, bg: 'linear-gradient(135deg,#787055 0%,#c8b89a 100%)' },
};

/* ── Wishlist heart icon ── */
const HeartIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? '#e07b39' : 'none'} stroke={filled ? '#e07b39' : 'currentColor'} strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);


/* ══════════════════════════════════════════════════
   PRODUCT CARD — Same simple hover as WeeklyBestsellers
   ══════════════════════════════════════════════════ */
const ProductCard = ({ product, viewMode = 'grid-3' }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : null);
  const navigate = useNavigate();

  const wishlisted = isInWishlist(product.id);
  const isList = viewMode === 'list';

  /* Badge colour */
  let badgeClass = '';
  if (product.badge === 'NEW')  badgeClass = 'cp-card__badge cp-card__badge--new';
  else if (product.badge === 'HOT') badgeClass = 'cp-card__badge cp-card__badge--hot';
  else if (product.badge)       badgeClass = 'cp-card__badge cp-card__badge--sale';

  const handleCardClick = () => {
    const slug = product.slug || String(product.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    navigate(`/product/${slug}`);
  };

  return (
    <div
      className={`cp-card${isList ? ' cp-card--list' : ''}${hovered ? ' cp-card--hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* ── IMAGE AREA ── */}
      <div className="cp-card__img-wrap">
      
        {/* Badge */}
        {product.badge && <span className={badgeClass}>{product.badge}</span>}

        {/* Wishlist heart — top right */}
        <button
          className={`cp-card__wish${wishlisted ? ' cp-card__wish--active' : ''}`}
          onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
          aria-label="Add to wishlist"
        >
          <HeartIcon filled={wishlisted} />
        </button>

        {/* Product image */}
        <Link to={`/product/${product.slug || String(product.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="cp-card__img-link">
          <img src={product.image} alt={product.name} className="cp-card__img" loading="lazy" />
        </Link>

        {/* Floating Add to Cart hover overlay for grid views */}
        {!isList && (
          <div className="cp-card__hover-actions">
            <button
              className="cp-card__add-cart-btn"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
            >
              Add to cart
            </button>
          </div>
        )}
      </div>

      {/* ── CARD CONTENT ── */}
      <div className="cp-card__content">
        {/* Title row: name left, rating right */}
        <div className="cp-card__title-row">
          <Link to={`/product/${product.slug || String(product.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="cp-card__name-link">
            <h3 className="cp-card__name">{product.name}</h3>
          </Link>
          {product.rating && (
            <span className="cp-card__rating">
              {product.rating.toFixed(1)}&nbsp;
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5a623" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </span>
          )}
        </div>

        {/* Category */}
        <span className="cp-card__cat">{product.category}</span>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="cp-card__colors">
            {product.colors.map((color, idx) => (
              <span 
                key={idx} 
                className={`cp-card__dot ${selectedColor === color ? 'cp-card__dot--active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                title={color}
              />
            ))}
          </div>
        )}

        {/* Meta tags in list view */}
        {isList && (
          <div className="cp-card__meta-tags">
            {product.brand && <span className="cp-card__meta-tag">Brand: <strong>{product.brand}</strong></span>}
            {product.material && <span className="cp-card__meta-tag">Material: <strong>{product.material}</strong></span>}
            <span className="cp-card__meta-tag cp-card__meta-tag--stock">● In Stock</span>
          </div>
        )}

        {/* Price for grid view */}
        {!isList && (
          <div className="cp-card__price-row">
            {product.oldPrice && (
              <span className="cp-card__old-price">₹{product.oldPrice.toFixed(2)}</span>
            )}
            <span className="cp-card__price">₹{product.price.toFixed(2)}</span>
          </div>
        )}


      </div>

      {/* Right actions column for list view */}
      {isList && (
        <div className="cp-card__list-right">
          <div className="cp-card__price-row">
            {product.oldPrice && (
              <span className="cp-card__old-price">₹{product.oldPrice.toFixed(2)}</span>
            )}
            <span className="cp-card__price">₹{product.price.toFixed(2)}</span>
          </div>
          <button
            className="cp-card__list-cart-btn"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
          >
            Add to cart
          </button>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════
   MAIN CATEGORY PAGE
   ══════════════════════════════════════════════════ */
export default function CategoryPage({ categorySlug }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const activeSlug = (categorySlug || slug || 'chairs').toLowerCase();

  const hero     = HERO_CONFIG[activeSlug] || HERO_CONFIG.chairs;
  const [allProds, setAllProds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);

    const fetchParams = activeSlug === 'wooden-furniture' ? { per_page: 1000 } : { category: activeSlug, per_page: 1000 };
    productsApi.getAll(fetchParams)
      .then(res => {
         if (res && res.data) {
             setAllProds(res.data);
         }
      })
      .catch(err => {
         console.error("Failed to load category products", err);
         setAllProds([]);
      })
      .finally(() => {
         setLoading(false);
      });
  }, [activeSlug]);

  /* Filter state */
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const [priceMax, setPriceMax]           = useState(null);
  const [selectedBrands, setSelectedBrands]     = useState([]);
  const [selectedColors, setSelectedColors]     = useState([]);
  const [selectedMats, setSelectedMats]         = useState([]);
  const [onSale, setOnSale]               = useState(false);
  const [inStock, setInStock]             = useState(false);
  const [sortBy, setSortBy]               = useState('rating');
  const [perPage, setPerPage]             = useState(6);
  const [currentPage, setCurrentPage]     = useState(1);
  const [viewMode, setViewMode]           = useState('grid-3');

  /* Derived filter options */
  const brands    = useMemo(() => [...new Set(allProds.map(p => p.brand).filter(Boolean))].sort(), [allProds]);
  const colors    = useMemo(() => [...new Set(allProds.map(p => p.color).filter(Boolean))].sort(), [allProds]);
  const materials = useMemo(() => [...new Set(allProds.map(p => p.material).filter(Boolean))].sort(), [allProds]);
  const maxPrice  = useMemo(() => Math.ceil(Math.max(...allProds.map(p => p.price), 1000) / 100) * 100, [allProds]);
  const minPrice  = useMemo(() => Math.floor(Math.min(...allProds.map(p => p.price), 0) / 10) * 10, [allProds]);
  const sliderMax = priceMax ?? maxPrice;

  const countFor = (arr, key) => val => arr.filter(p => p[key] === val).length;
  const brandCount = countFor(allProds, 'brand');
  const colorCount = countFor(allProds, 'color');
  const matCount   = countFor(allProds, 'material');

  /* Filtered list */
  const filtered = useMemo(() => {
    let list = allProds.filter(p => {
      if (searchQuery) {
        const matchName = p.name.toLowerCase().includes(searchQuery);
        const matchCat = p.category && p.category.toLowerCase().includes(searchQuery);
        if (!matchName && !matchCat) return false;
      }
      if (p.price > sliderMax) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (selectedColors.length && !selectedColors.includes(p.color)) return false;
      if (selectedMats.length   && !selectedMats.includes(p.material)) return false;
      if (onSale  && !p.oldPrice) return false;
      return true;
    });
    if (sortBy === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [allProds, sliderMax, selectedBrands, selectedColors, selectedMats, onSale, sortBy, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (validCurrentPage - 1) * perPage;
  const displayedProds = filtered.slice(startIdx, startIdx + perPage);

  const toggle = (arr, setArr, val) => {
    setCurrentPage(1);
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const clearFilters = () => {
    setPriceMax(maxPrice);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedMats([]);
    setOnSale(false);
    setInStock(false);
    setCurrentPage(1);
  };

  /* Hero style */
  const heroStyle = hero.img
    ? { backgroundImage: `url(${hero.img})`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }
    : { background: hero.bg };

  /* Colour swatch lookup */
  const COLOR_MAP = {
    'American Silver': '#c0c0c8', 'Bone': '#e8e0d4', 'Dark Gray': '#555',
    'Gray': '#888', 'Green': '#4a6741', 'Jet': '#1c1c1c',
  };

  return (
    <div className="cp-page">
      {/* HEADER */}
      <Header />
      
      {/* HERO BANNER */}
      <div className="cp-hero" style={heroStyle}>
        <div className="cp-hero__inner">
          <h1 className="cp-hero__title">
            <button className="cp-hero__back-btn" onClick={() => navigate('/')}>←</button>
            {hero.label}
          </h1>
        </div>
      </div>

      {/* ── PAGE BODY ── */}
      <div className="cp-body">
        <div className="cp-body__inner">

          {/* ════ SIDEBAR ════ */}
          <aside className="cp-sidebar">

            {/* Price */}
            <div className="cp-widget">
              <h4 className="cp-widget__title">Price</h4>
              <input
                type="range" min={minPrice} max={maxPrice} step={10}
                value={sliderMax}
                onChange={e => setPriceMax(+e.target.value)}
                className="cp-range"
              />
              <div className="cp-price-row">
                <span className="cp-price-label">Price: ₹{minPrice} — ₹{sliderMax}</span>
                <button className="cp-filter-btn" onClick={() => {}}>Filter</button>
              </div>
            </div>



            {/* Color */}
            {colors.length > 0 && (
              <div className="cp-widget">
                <h4 className="cp-widget__title">Color</h4>
                <div className="cp-search-wrap">
                  <input type="text" placeholder="Find a Color" className="cp-search" />
                </div>
                <ul className="cp-checklist">
                  {colors.map(c => (
                    <li key={c}>
                      <label className="cp-check-label">
                        <input type="checkbox" className="cp-check" checked={selectedColors.includes(c)} onChange={() => toggle(selectedColors, setSelectedColors, c)} />
                        <span className="cp-swatch" style={{ background: COLOR_MAP[c] || '#ccc' }} />
                        <span className="cp-check-text">{c}</span>
                        <span className="cp-check-count">{colorCount(c)}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Materials */}
            {materials.length > 0 && (
              <div className="cp-widget">
                <h4 className="cp-widget__title">Materials</h4>
                <ul className="cp-checklist">
                  {materials.map(m => (
                    <li key={m}>
                      <label className="cp-check-label">
                        <input type="checkbox" className="cp-check" checked={selectedMats.includes(m)} onChange={() => toggle(selectedMats, setSelectedMats, m)} />
                        <span className="cp-check-text">{m}</span>
                        <span className="cp-check-count">{matCount(m)}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product Status */}
            <div className="cp-widget">
              <h4 className="cp-widget__title">Product Status</h4>
              <ul className="cp-checklist">
                <li>
                  <label className="cp-check-label">
                    <input type="checkbox" className="cp-check" checked={onSale} onChange={e => setOnSale(e.target.checked)} />
                    <span className="cp-check-text">On sale</span>
                  </label>
                </li>
                <li>
                  <label className="cp-check-label">
                    <input type="checkbox" className="cp-check" checked={inStock} onChange={e => setInStock(e.target.checked)} />
                    <span className="cp-check-text">In stock</span>
                  </label>
                </li>
                <li>
                  <label className="cp-check-label">
                    <input type="checkbox" className="cp-check" />
                    <span className="cp-check-text">On backorder</span>
                  </label>
                </li>
              </ul>
            </div>
          </aside>

          {/* ════ MAIN AREA ════ */}
          <main className="cp-main">

            {/* ── TOOLBAR ── */}
            <div className="cp-toolbar">
              <span className="cp-toolbar__count">
                Showing {filtered.length === 0 ? 0 : startIdx + 1}–{Math.min(startIdx + perPage, filtered.length)} of {filtered.length} results
              </span>
              <div className="cp-toolbar__right">
                <span className="cp-toolbar__show">Show :</span>
                {[2, 4, 6, 12].map(n => (
                  <button
                    key={n}
                    className={`cp-toolbar__n${perPage === n ? ' active' : ''}`}
                    onClick={() => {
                      setPerPage(n);
                      setCurrentPage(1);
                    }}
                  >{n}</button>
                ))}
                <div className="cp-toolbar__views">
                  <button
                    className={`cp-view-btn${viewMode === 'list' ? ' active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                    aria-label="List View"
                  >
                    ☰
                  </button>
                  <button
                    className={`cp-view-btn${viewMode === 'grid-3' ? ' active' : ''}`}
                    onClick={() => setViewMode('grid-3')}
                    title="Grid (3 columns)"
                    aria-label="Grid 3 columns"
                  >
                    ⊞
                  </button>
                  <button
                    className={`cp-view-btn${viewMode === 'grid-2' ? ' active' : ''}`}
                    onClick={() => setViewMode('grid-2')}
                    title="Grid (2 columns)"
                    aria-label="Grid 2 columns"
                  >
                    ⊟
                  </button>
                </div>
                <select
                  className="cp-sort-select"
                  value={sortBy}
                  onChange={e => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="rating">Sort by average rating</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </div>
            </div>

            {/* ── GRID ── */}
            {displayedProds.length > 0 ? (
              <div className={`cp-grid cp-grid--${viewMode}`}>
                {displayedProds.map(p => (
                  <ProductCard key={p.id} product={p} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="cp-empty">
                <p>No products match your current filters.</p>
                <button className="cp-empty__btn" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}

            {/* ── PAGINATION ── */}
            {totalPages > 1 && (
              <div className="cp-pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`cp-page-btn${validCurrentPage === p ? ' cp-page-btn--active' : ''}`}
                    onClick={() => {
                      setCurrentPage(p);
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                  >
                    {p}
                  </button>
                ))}
                {validCurrentPage < totalPages && (
                  <button
                    className="cp-page-btn"
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                  >
                    ›
                  </button>
                )}
              </div>
            )}

            {/* ── SEO TEXT ── */}
            <div className="cp-seo">
              <h2 className="cp-seo__h">Online store with a wide selection of furniture and decor</h2>
              <p className="cp-seo__p">
                Furniture is an invariable attribute of any room. It is they who give it the right atmosphere,
                making the space cozy and comfortable, creating favorable conditions for productive work or
                helping to relax after a hard day. More and more often, customers want to place an order in
                an online store, where you can sit down at the computer in your free time, arrange the
                furniture in the photo and calmly buy the furniture you like.
              </p>
              <h2 className="cp-seo__h">Furniture production is a modern form of art</h2>
              <p className="cp-seo__p">
                Furniture manufacturers are full of amazing offers: we often come across both standard
                mass-produced furniture and unique creations from professional craftsmen, which will be
                appreciated by true connoisseurs of beauty. We have selected for you the best models from
                modern craftsmen who managed to ingeniously combine elegance, comfort and practicality.
              </p>
              <button className="cp-seo__more">Read more</button>
            </div>
          </main>

        </div>
      </div>

      </div>
  );
}
