import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import './CategoryPage.css';
import { productsApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/shop/ProductCard';

import img_chairs_banner from '../assets/chairs_banner.png';
import img_tables_banner from '../assets/table8.jpg';
import img_sofas_banner from '/sofa.jpg';
import img_armchairs_banner from '../assets/armchair.jpg';
import img_beds_banner from '../assets/beds.png';
import img_storage_banner from '../assets/storage10.jpg';
import img_textiles_banner from '../assets/textile1.webp';
import img_lighting_banner from '/light1.jpg';
import img_toys_banner from '../assets/toy1.jpg';
import img_decor_banner from '../assets/decor1.jpg';

/* ──────────────────────────────────────────────
   Hero banner config per category
   ────────────────────────────────────────────── */
const HERO_CONFIG = {
  // Main categories
  gifts:       { label: 'Gifts',               img: img_chairs_banner, bg: 'linear-gradient(135deg,#c0392b 0%,#e74c3c 50%,#f39c12 100%)' },
  toys:        { label: 'Toys',                img: img_toys_banner,   bg: 'linear-gradient(135deg,#11998e 0%,#38ef7d 100%)' },
  astrology:   { label: 'Astrology',           img: img_decor_banner,  bg: 'linear-gradient(135deg,#4a00e0 0%,#8e2de2 100%)' },
  // Gift subcategories
  'diwali-gifts':      { label: 'Diwali Gifts',      img: img_lighting_banner, bg: 'linear-gradient(135deg,#f7971e 0%,#ffd200 100%)' },
  'birthday-gifts':    { label: 'Birthday Gifts',    img: img_chairs_banner,   bg: 'linear-gradient(135deg,#e96c9b 0%,#f9c6d1 100%)' },
  'anniversary-gifts': { label: 'Anniversary Gifts', img: img_sofas_banner,    bg: 'linear-gradient(135deg,#c0392b 0%,#ff758c 100%)' },
  // Toy subcategories
  'soft-toys':   { label: 'Soft Toys',   img: img_toys_banner,    bg: 'linear-gradient(135deg,#f9d423 0%,#ff4e50 100%)' },
  'baby-toys':   { label: 'Baby Toys',   img: img_chairs_banner,  bg: 'linear-gradient(135deg,#56ccf2 0%,#2f80ed 100%)' },
  'board-games': { label: 'Board Games', img: img_storage_banner, bg: 'linear-gradient(135deg,#11998e 0%,#38ef7d 100%)' },
  // Astrology subcategories
  'rings':              { label: 'Rings',                img: img_decor_banner,    bg: 'linear-gradient(135deg,#4a00e0 0%,#8e2de2 100%)' },
  'pendants':           { label: 'Pendants',             img: img_textiles_banner, bg: 'linear-gradient(135deg,#6a3093 0%,#a044ff 100%)' },
  'bracelets':          { label: 'Bracelets',            img: img_beds_banner,     bg: 'linear-gradient(135deg,#8e0e00 0%,#1f1c18 100%)' },
  'gemstones-crystals': { label: 'Gemstones & Crystals', img: img_armchairs_banner, bg: 'linear-gradient(135deg,#005c97 0%,#363795 100%)' },
  // Legacy fallback
  'wooden-furniture': { label: 'All Products', img: img_chairs_banner, bg: 'linear-gradient(135deg,#787055 0%,#c8b89a 100%)' },
};

const HEADER_CATEGORIES_TREE = [
  {
    name: 'Gifts',
    slug: 'gifts',
    subcategories: [
      { name: 'Diwali Gifts', slug: 'diwali-gifts' },
      { name: 'Birthday Gifts', slug: 'birthday-gifts' },
      { name: 'Anniversary Gifts', slug: 'anniversary-gifts' },
    ]
  },
  {
    name: 'Toys',
    slug: 'toys',
    subcategories: [
      { name: 'Soft Toys', slug: 'soft-toys' },
      { name: 'Baby Toys', slug: 'baby-toys' },
      { name: 'Board Games', slug: 'board-games' },
    ]
  },
  {
    name: 'Astrology',
    slug: 'astrology',
    subcategories: [
      { name: 'Rings', slug: 'rings' },
      { name: 'Pendants', slug: 'pendants' },
      { name: 'Bracelets', slug: 'bracelets' },
      { name: 'Gemstones & Crystals', slug: 'gemstones-crystals' },
    ]
  }
];

/* ══════════════════════════════════════════════════
   MAIN CATEGORY PAGE
   ══════════════════════════════════════════════════ */
export default function CategoryPage({ categorySlug }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const activeSlug = (categorySlug || slug || 'gifts').toLowerCase();

  const hero     = HERO_CONFIG[activeSlug] || HERO_CONFIG.gifts;
  const [allProds, setAllProds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);

    const fetchParams = activeSlug === 'wooden-furniture'
      ? { per_page: 1000 }
      : { category: activeSlug, per_page: 1000 };
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
  const [priceMin, setPriceMin]           = useState(null);
  const [tempPriceMax, setTempPriceMax]   = useState(null);
  const [tempPriceMin, setTempPriceMin]   = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands]         = useState([]);
  const [selectedColors, setSelectedColors]         = useState([]);
  const [selectedMats, setSelectedMats]             = useState([]);
  const [minDiscount, setMinDiscount]               = useState(null);
  const [onSale, setOnSale]               = useState(false);
  const [inStock, setInStock]             = useState(false);
  const [onBackorder, setOnBackorder]     = useState(false);
  const [sortBy, setSortBy]               = useState('rating');
  const [perPage, setPerPage]             = useState(6);
  const [currentPage, setCurrentPage]     = useState(1);
  const [viewMode, setViewMode]           = useState('grid-3');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [mobileFilterSection, setMobileFilterSection] = useState('all');

  const [showCatSearch, setShowCatSearch]     = useState(false);
  const [catQuery, setCatQuery]               = useState('');
  const [showAllCats, setShowAllCats]         = useState(false);
  const [expandedCategories, setExpandedCategories] = useState([]);

  const toggleExpandCategory = (catName) => {
    setExpandedCategories(prev => 
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  const [showBrandSearch, setShowBrandSearch] = useState(false);
  const [brandQuery, setBrandQuery]           = useState('');
  const [showAllBrands, setShowAllBrands]     = useState(false);
  const [showColorSearch, setShowColorSearch] = useState(false);
  const [colorQuery, setColorQuery]           = useState('');
  const [showAllColors, setShowAllColors]     = useState(false);
  const [showAllDiscounts, setShowAllDiscounts] = useState(false);

  const openMobileFilter = (section = 'all') => {
    setMobileFilterSection(section);
    setIsMobileFilterOpen(true);
  };

  const [selectedGender, setSelectedGender]         = useState(null);

  /* Myntra-style Default Options & Dynamic Fallbacks */
  const DEFAULT_TOYS_CATEGORIES = [
    'Activity Toys and Games',
    'Soft Toys and Dolls',
    'Learning and Development Toys',
    'Art and Craft',
    'Toy Vehicles',
    'Action Figures and Toys',
    'Musical Toys',
    'Infant and Pre-School Toys'
  ];
  const DEFAULT_TOYS_BRANDS = [
    'CountryLink', 'Little Mind', 'Sellplus', 'Aditi Toys', 'ADKD', 'OPINA', 'DukieKooky', 'MUREN'
  ];
  const DEFAULT_TOYS_COLORS = [
    { name: 'Blue', color: '#0066cc' },
    { name: 'Multi', color: 'conic-gradient(#e74c3c 0deg 90deg, #f1c40f 90deg 180deg, #2ecc71 180deg 270deg, #3498db 270deg 360deg)' },
    { name: 'Green', color: '#27ae60' },
    { name: 'White', color: '#ffffff', border: '#d0cdc7' },
    { name: 'Pink', color: '#e87a90' },
    { name: 'Yellow', color: '#f4d03f' },
    { name: 'Red', color: '#d93838' }
  ];

  const DEFAULT_GIFT_CATEGORIES = [
    'Accessory Gift Set',
    'Home Gift Sets',
    'Rakhi Gift Set',
    'Watch Gift Set',
    'Baby Apparel Gift Set',
    'Makeup Gift Set',
    'Skin Care Gift Set',
    'Fragrance Gift Set'
  ];
  const DEFAULT_GIFT_BRANDS = [
    'ARTBUG',
    'JOKER & WITCH',
    'INTERNATIONAL GIFT',
    'MUTAQINOTI',
    'LOUIS STITCH',
    'WildHorn',
    'The Tie Hub',
    'Cazzano'
  ];
  const DEFAULT_GIFT_COLORS = [
    { name: 'White', color: '#ffffff', border: '#d0cdc7' },
    { name: 'Black', color: '#1a1a1a' },
    { name: 'Blue', color: '#0066cc' },
    { name: 'Red', color: '#d93838' },
    { name: 'Gold', color: '#d4af37' },
    { name: 'Multi', color: 'conic-gradient(#e74c3c 0deg 90deg, #f1c40f 90deg 180deg, #2ecc71 180deg 270deg, #3498db 270deg 360deg)' },
    { name: 'Brown', color: '#6e3b1c' },
    { name: 'Pink', color: '#e87a90' },
    { name: 'Silver', color: '#c0c0c0' },
    { name: 'Green', color: '#27ae60' },
    { name: 'Navy Blue', color: '#1b2a4a' },
    { name: 'Maroon', color: '#800020' },
    { name: 'Grey', color: '#95a5a6' },
    { name: 'Rose Gold', color: '#b76e79' },
    { name: 'Purple', color: '#800080' },
    { name: 'Yellow', color: '#f4d03f' },
    { name: 'Beige', color: '#f5f5dc', border: '#e0e0e0' },
    { name: 'Orange', color: '#f07d26' },
    { name: 'Transparent', color: '#f0f0f0', border: '#cccccc' }
  ];

  const DEFAULT_ASTROLOGY_CATEGORIES = [
    'Rings',
    'Pendants',
    'Bracelets',
    'Gemstones & Crystals',
    'Yantras & Idols',
    'Rudraksha',
    'Feng Shui & Healing'
  ];

  const isToysCategory = activeSlug.includes('toy');
  const isAstroCategory = activeSlug.includes('astro') || activeSlug.includes('ring') || activeSlug.includes('gem') || activeSlug.includes('pendant') || activeSlug.includes('crystal');
  const isShopAllPage = activeSlug === 'all' || activeSlug === 'shop' || activeSlug === 'wooden-furniture';

  /* Derived filter options */
  const categoriesList = useMemo(() => {
    let defaultList = DEFAULT_GIFT_CATEGORIES;
    if (isToysCategory) defaultList = DEFAULT_TOYS_CATEGORIES;
    else if (isAstroCategory) defaultList = DEFAULT_ASTROLOGY_CATEGORIES;
    const dynamicCats = [...new Set(allProds.map(p => p.category || p.category_name).filter(Boolean))];
    const combined = Array.from(new Set([...defaultList, ...dynamicCats]));
    if (!catQuery) return combined;
    return combined.filter(c => c.toLowerCase().includes(catQuery.toLowerCase()));
  }, [allProds, isToysCategory, isAstroCategory, catQuery]);

  const brandsList = useMemo(() => {
    const defaultList = isToysCategory ? DEFAULT_TOYS_BRANDS : DEFAULT_GIFT_BRANDS;
    const dynamicBrands = [...new Set(allProds.map(p => p.brand).filter(Boolean))];
    const all = Array.from(new Set([...defaultList, ...dynamicBrands]));
    if (!brandQuery) return all;
    return all.filter(b => b.toLowerCase().includes(brandQuery.toLowerCase()));
  }, [allProds, brandQuery, isToysCategory]);

  const colorsList = useMemo(() => {
    const defaultList = isToysCategory ? DEFAULT_TOYS_COLORS : DEFAULT_GIFT_COLORS;
    const dynamicColors = [...new Set(allProds.map(p => p.color).filter(Boolean))];
    const defaultNames = defaultList.map(c => c.name);
    const combinedNames = Array.from(new Set([...defaultNames, ...dynamicColors]));
    const list = combinedNames.map(name => {
      const found = defaultList.find(c => c.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        color: found?.color || name.toLowerCase().replace(/\s+/g, '') || '#ccc',
        border: found?.border
      };
    });
    if (!colorQuery) return list;
    return list.filter(c => c.name.toLowerCase().includes(colorQuery.toLowerCase()));
  }, [allProds, colorQuery, isToysCategory]);

  const maxPrice  = useMemo(() => isToysCategory ? 10000 : Math.ceil(Math.max(...allProds.map(p => p.price), 3000) / 100) * 100, [allProds, isToysCategory]);
  const minPrice  = useMemo(() => 0, []);
  const appliedPriceMax = priceMax ?? maxPrice;
  const appliedPriceMin = priceMin ?? minPrice;
  const sliderMax = tempPriceMax ?? appliedPriceMax;
  const sliderMin = tempPriceMin ?? appliedPriceMin;

  /* Counts */
  const getCategoryCount = catName => {
    const realCount = allProds.filter(p => (p.category && p.category.toLowerCase().includes(catName.toLowerCase())) || (p.category_name && p.category_name.toLowerCase().includes(catName.toLowerCase()))).length;
    if (realCount > 0) return realCount;
    const toysMap = {
      'Activity Toys and Games': 3050,
      'Soft Toys and Dolls': 2579,
      'Learning and Development Toys': 1840,
      'Art and Craft': 832,
      'Toy Vehicles': 577,
      'Action Figures and Toys': 294,
      'Musical Toys': 230,
      'Infant and Pre-School Toys': 180
    };
    if (toysMap[catName]) return toysMap[catName];
    const giftMap = {
      'Accessory Gift Set': 9220,
      'Home Gift Sets': 5316,
      'Rakhi Gift Set': 3160,
      'Watch Gift Set': 2383,
      'Baby Apparel Gift Set': 1714,
      'Makeup Gift Set': 525,
      'Skin Care Gift Set': 493,
      'Fragrance Gift Set': 491
    };
    if (giftMap[catName]) return giftMap[catName];
    return Math.floor((catName.length * 5) % 25) + 1;
  };

  const getBrandCount = bName => {
    const realCount = allProds.filter(p => p.brand && p.brand.toLowerCase() === bName.toLowerCase()).length;
    if (realCount > 0) return realCount;
    const toysBrandMap = {
      CountryLink: 625, 'Little Mind': 406, Sellplus: 282, 'Aditi Toys': 256, ADKD: 238, OPINA: 223, DukieKooky: 219, MUREN: 215
    };
    if (toysBrandMap[bName]) return toysBrandMap[bName];
    const giftBrandMap = {
      'ARTBUG': 2208,
      'JOKER & WITCH': 1429,
      'INTERNATIONAL GIFT': 798,
      'MUTAQINOTI': 787,
      'LOUIS STITCH': 714,
      'WildHorn': 572,
      'The Tie Hub': 556,
      'Cazzano': 495
    };
    if (giftBrandMap[bName]) return giftBrandMap[bName];
    return 1;
  };

  const getColorCount = cName => {
    const realCount = allProds.filter(p => p.color && p.color.toLowerCase() === cName.toLowerCase()).length;
    if (realCount > 0) return realCount;
    const toysColorMap = { Blue: 1464, Multi: 1278, Green: 975, White: 964, Pink: 891, Yellow: 866, Red: 753 };
    if (toysColorMap[cName]) return toysColorMap[cName];
    const giftColorMap = {
      White: 3799, Black: 3185, Blue: 2364, Red: 2326, Gold: 1805, Multi: 1690,
      Brown: 1530, Pink: 1177, Silver: 926, Green: 866, 'Navy Blue': 655,
      Maroon: 587, Grey: 571, 'Rose Gold': 545, Purple: 478, Yellow: 455,
      Beige: 352, Orange: 222, Transparent: 217
    };
    if (giftColorMap[cName]) return giftColorMap[cName];
    return 1;
  };

  /* Filtered list */
  const filtered = useMemo(() => {
    let list = allProds.filter(p => {
      if (searchQuery) {
        const matchName = p.name.toLowerCase().includes(searchQuery);
        const matchCat = (p.category && p.category.toLowerCase().includes(searchQuery)) || (p.category_name && p.category_name.toLowerCase().includes(searchQuery));
        if (!matchName && !matchCat) return false;
      }
      if (selectedGender) {
        const pGender = (p.gender || p.target_gender || p.name || p.description || '').toLowerCase();
        if (pGender && !pGender.includes(selectedGender.toLowerCase())) return false;
      }
      if (p.price < appliedPriceMin) return false;
      if (p.price > appliedPriceMax) return false;
      if (selectedCategories.length > 0) {
        const pCat = (p.category || p.category_name || '').toLowerCase();
        const matches = selectedCategories.some(sc => pCat.includes(sc.toLowerCase()) || sc.toLowerCase().includes(pCat));
        if (!matches) return false;
      }
      if (selectedBrands.length > 0 && !selectedBrands.some(sb => (p.brand || '').toLowerCase() === sb.toLowerCase())) return false;
      if (selectedColors.length > 0 && !selectedColors.some(sc => (p.color || '').toLowerCase() === sc.toLowerCase())) return false;
      if (minDiscount !== null) {
        const disc = p.discount_percentage || (p.old_price && p.old_price > p.price ? Math.round(((p.old_price - p.price) / p.old_price) * 100) : 0);
        if (disc < minDiscount) return false;
      }
      if (onSale  && !p.old_price) return false;
      if (inStock && p.stock <= 0) return false;
      return true;
    });
    if (sortBy === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     list = [...list].sort((a, b) => (b.rating || 5) - (a.rating || 5));
    return list;
  }, [allProds, appliedPriceMin, appliedPriceMax, selectedCategories, selectedBrands, selectedColors, minDiscount, onSale, inStock, sortBy, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (validCurrentPage - 1) * perPage;
  const displayedProds = filtered.slice(startIdx, startIdx + perPage);

  const toggle = (arr, setArr, val) => {
    setCurrentPage(1);
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const isFilterActive = selectedGender !== null || selectedCategories.length > 0 || selectedBrands.length > 0 || selectedColors.length > 0 || minDiscount !== null || priceMin !== null || priceMax !== null || onSale || inStock;

  const clearFilters = () => {
    setSelectedGender(null);
    setPriceMax(null);
    setPriceMin(null);
    setTempPriceMax(null);
    setTempPriceMin(null);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedMats([]);
    setMinDiscount(null);
    setOnSale(false);
    setInStock(false);
    setOnBackorder(false);
    setCurrentPage(1);
  };

  const isAnniversaryCategory = activeSlug.includes('anniversary');
  const genderOptions = useMemo(() => {
    if (isAnniversaryCategory) return ['Men', 'Women'];
    return ['Men', 'Women', 'Boys', 'Girls'];
  }, [isAnniversaryCategory]);

  /* Hero style */
  const heroStyle = hero.img
    ? { backgroundImage: `url(${hero.img})`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }
    : { background: hero.bg };

  return (
    <div className="cp-page">
      {/* HEADER */}
      <Header />
      
      {/* MOBILE STICKY HEADER */}
      <div className="cp-mobile-header">
        <button className="cp-mobile-back-btn" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
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

      {/* ── PAGE BODY ── */}
      <div className="cp-body">
        <div className="cp-body__inner">

          {/* ════ MYNTRA-STYLE SIDEBAR ════ */}
          {isMobileFilterOpen && (
            <div 
              className="cp-mobile-overlay" 
              onClick={() => setIsMobileFilterOpen(false)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999 }}
            />
          )}
          <aside className={`cp-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
            <div className="cp-sidebar-mobile-header">
              <h3>Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>✕</button>
            </div>

            {/* MYNTRA FILTERS HEADER */}
            <div className="myntra-filter-header">
              <span className="myntra-filter-header__title">FILTERS</span>
              {isFilterActive && (
                <button className="myntra-filter-header__clear" onClick={clearFilters}>
                  CLEAR ALL
                </button>
              )}
            </div>

            {/* 0. GENDER / TARGET (Toys & General) */}
            <div className="myntra-widget myntra-widget--gender">
              <ul className="myntra-checklist">
                {genderOptions.map(g => (
                  <li key={g}>
                    <label className="myntra-check-label">
                      <input 
                        type="radio" 
                        name="genderFilter"
                        className="myntra-radio" 
                        checked={selectedGender === g} 
                        onChange={() => setSelectedGender(prev => prev === g ? null : g)} 
                      />
                      <span className="myntra-check-text myntra-check-text--bold">{g}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* 1. CATEGORIES */}
            <div className="myntra-widget">
              <div className="myntra-widget__header">
                <h4 className="myntra-widget__title">CATEGORIES</h4>
                <button 
                  className="myntra-search-toggle" 
                  onClick={() => setShowCatSearch(!showCatSearch)}
                  title="Search Category"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </div>

              {showCatSearch && (
                <div className="myntra-search-box">
                  <input 
                    type="text" 
                    placeholder="Search for Category" 
                    value={catQuery} 
                    onChange={e => setCatQuery(e.target.value)} 
                    className="myntra-search-input"
                  />
                </div>
              )}

              {isShopAllPage ? (
                <div className="myntra-category-tree">
                  {HEADER_CATEGORIES_TREE.map(parentCat => {
                    const isParentExpanded = expandedCategories.includes(parentCat.name);
                    
                    const visibleSubcategories = catQuery
                      ? parentCat.subcategories.filter(s => s.name.toLowerCase().includes(catQuery.toLowerCase()))
                      : parentCat.subcategories;

                    const parentMatchesQuery = !catQuery || parentCat.name.toLowerCase().includes(catQuery.toLowerCase()) || visibleSubcategories.length > 0;
                    if (!parentMatchesQuery) return null;

                    return (
                      <div key={parentCat.name} className="myntra-cat-group">
                        <div 
                          className="myntra-cat-parent-row"
                          onClick={() => toggleExpandCategory(parentCat.name)}
                        >
                          <div className="myntra-cat-parent-title">
                            <span className="myntra-check-text font-bold">{parentCat.name}</span>
                          </div>

                          <button 
                            type="button"
                            className="myntra-cat-arrow-btn" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleExpandCategory(parentCat.name);
                            }}
                            aria-label={`Toggle ${parentCat.name}`}
                          >
                            <svg 
                              className={`myntra-cat-arrow ${isParentExpanded ? 'is-expanded' : ''}`}
                              width="12" 
                              height="12" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2.5"
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                        </div>

                        {isParentExpanded && visibleSubcategories.length > 0 && (
                          <ul className="myntra-subcategories-list">
                            {visibleSubcategories.map(sub => (
                              <li key={sub.name}>
                                <label className="myntra-check-label myntra-subcheck-label">
                                  <input 
                                    type="checkbox" 
                                    className="myntra-check" 
                                    checked={selectedCategories.includes(sub.name)} 
                                    onChange={() => toggle(selectedCategories, setSelectedCategories, sub.name)} 
                                  />
                                  <span className="myntra-check-text">{sub.name}</span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <ul className="myntra-checklist">
                    {(showAllCats || catQuery ? categoriesList : categoriesList.slice(0, 4)).map(c => (
                      <li key={c}>
                        <label className="myntra-check-label">
                          <input 
                            type="checkbox" 
                            className="myntra-check" 
                            checked={selectedCategories.includes(c)} 
                            onChange={() => toggle(selectedCategories, setSelectedCategories, c)} 
                          />
                          <span className="myntra-check-text">{c}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  {categoriesList.length > 4 && !catQuery && (
                    <div 
                      className="myntra-more-link"
                      onClick={() => setShowAllCats(!showAllCats)}
                    >
                      {showAllCats ? '- Show Less' : `+ ${categoriesList.length - 4} More`}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 2. BRAND */}
            <div className="myntra-widget">
              <div className="myntra-widget__header">
                <h4 className="myntra-widget__title">BRAND</h4>
                <button 
                  className="myntra-search-toggle" 
                  onClick={() => setShowBrandSearch(!showBrandSearch)}
                  title="Search Brand"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </div>

              {showBrandSearch && (
                <div className="myntra-search-box">
                  <input 
                    type="text" 
                    placeholder="Search for Brand" 
                    value={brandQuery} 
                    onChange={e => setBrandQuery(e.target.value)} 
                    className="myntra-search-input"
                  />
                </div>
              )}

              <ul className="myntra-checklist">
                {(showAllBrands || brandQuery ? brandsList : brandsList.slice(0, 4)).map(b => (
                  <li key={b}>
                    <label className="myntra-check-label">
                      <input 
                        type="checkbox" 
                        className="myntra-check" 
                        checked={selectedBrands.includes(b)} 
                        onChange={() => toggle(selectedBrands, setSelectedBrands, b)} 
                      />
                      <span className="myntra-check-text">{b}</span>
                    </label>
                  </li>
                ))}
              </ul>
              {brandsList.length > 4 && !brandQuery && (
                <div 
                  className="myntra-more-link"
                  onClick={() => setShowAllBrands(!showAllBrands)}
                >
                  {showAllBrands ? '- Show Less' : `+ ${brandsList.length - 4} More`}
                </div>
              )}
            </div>

            {/* 3. PRICE */}
            <div className="myntra-widget">
              <h4 className="myntra-widget__title">PRICE</h4>
              <div className="myntra-price-wrap">
                <div className="cp-dual-range-wrap">
                  <div className="cp-range-track-bg" />
                  <div
                    className="cp-range-track-fill myntra-range-fill"
                    style={{
                      left:  `${((sliderMin - minPrice) / (maxPrice - minPrice || 1)) * 100}%`,
                      right: `${100 - ((sliderMax - minPrice) / (maxPrice - minPrice || 1)) * 100}%`,
                    }}
                  />
                  <input
                    type="range" min={minPrice} max={maxPrice} step={10}
                    value={sliderMin}
                    onChange={e => {
                      const val = Math.min(+e.target.value, sliderMax - 10);
                      setTempPriceMin(val);
                      setPriceMin(val);
                    }}
                    className="cp-range myntra-range-thumb"
                  />
                  <input
                    type="range" min={minPrice} max={maxPrice} step={10}
                    value={sliderMax}
                    onChange={e => {
                      const val = Math.max(+e.target.value, sliderMin + 10);
                      setTempPriceMax(val);
                      setPriceMax(val);
                    }}
                    className="cp-range myntra-range-thumb"
                  />
                </div>
                <div className="myntra-price-display">
                  ₹{sliderMin} - ₹{sliderMax}+
                </div>
              </div>
            </div>

            {/* 4. COLOR */}
            <div className="myntra-widget">
              <div className="myntra-widget__header">
                <h4 className="myntra-widget__title">COLOR</h4>
                <button 
                  className="myntra-search-toggle" 
                  onClick={() => setShowColorSearch(!showColorSearch)}
                  title="Search Color"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </div>

              {showColorSearch && (
                <div className="myntra-search-box">
                  <input 
                    type="text" 
                    placeholder="Search for Color" 
                    value={colorQuery} 
                    onChange={e => setColorQuery(e.target.value)} 
                    className="myntra-search-input"
                  />
                </div>
              )}

              <ul className="myntra-checklist">
                {(showAllColors || colorQuery ? colorsList : colorsList.slice(0, 4)).map(c => (
                  <li key={c.name}>
                    <label className="myntra-check-label">
                      <input 
                        type="checkbox" 
                        className="myntra-check" 
                        checked={selectedColors.includes(c.name)} 
                        onChange={() => toggle(selectedColors, setSelectedColors, c.name)} 
                      />
                      <span 
                        className="myntra-swatch-circle" 
                        style={{ background: c.color, border: c.border ? `1px solid ${c.border}` : '1px solid rgba(0,0,0,0.12)' }} 
                      />
                      <span className="myntra-check-text">{c.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
              {colorsList.length > 4 && !colorQuery && (
                <div 
                  className="myntra-more-link"
                  onClick={() => setShowAllColors(!showAllColors)}
                >
                  {showAllColors ? '- Show Less' : `+ ${colorsList.length - 4} More`}
                </div>
              )}
            </div>

            {/* 5. DISCOUNT RANGE */}
            <div className="myntra-widget">
              <h4 className="myntra-widget__title">DISCOUNT RANGE</h4>
              {(() => {
                const discountItems = [
                  { label: '10% and above', val: 10 },
                  { label: '20% and above', val: 20 },
                  { label: '30% and above', val: 30 },
                  { label: '40% and above', val: 40 },
                  { label: '50% and above', val: 50 },
                  { label: '60% and above', val: 60 },
                  { label: '70% and above', val: 70 },
                ];
                const visibleDiscounts = showAllDiscounts ? discountItems : discountItems.slice(0, 4);
                return (
                  <>
                    <ul className="myntra-checklist">
                      {visibleDiscounts.map(item => (
                        <li key={item.val}>
                          <label className="myntra-check-label">
                            <input 
                              type="radio" 
                              name="discountRange"
                              className="myntra-radio" 
                              checked={minDiscount === item.val} 
                              onChange={() => {
                                setCurrentPage(1);
                                setMinDiscount(prev => prev === item.val ? null : item.val);
                              }} 
                            />
                            <span className="myntra-check-text">{item.label}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    {discountItems.length > 4 && (
                      <div 
                        className="myntra-more-link"
                        onClick={() => setShowAllDiscounts(!showAllDiscounts)}
                      >
                        {showAllDiscounts ? '- Show Less' : `+ ${discountItems.length - 4} More`}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

          </aside>

          {/* ════ MAIN AREA ════ */}
          <main className="cp-main">

            {/* ── TOOLBAR ── */}
            <div className="cp-toolbar">
              {/* MOBILE PILL TOOLBAR */}
              <div className="cp-mobile-pill-toolbar">
                <button className="cp-pill-btn cp-pill-btn--icon" onClick={() => openMobileFilter('all')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                  <span>Filters</span>
                </button>
                <button className="cp-pill-btn" onClick={() => openMobileFilter('color')}>
                  Color
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <button className="cp-pill-btn" onClick={() => openMobileFilter('material')}>
                  Material
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <button className="cp-pill-btn" onClick={() => openMobileFilter('status')}>
                  Status
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>

              <div className="cp-toolbar-desktop-inner">
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
                {/* Prev button */}
                <button
                  className="cp-page-btn cp-page-btn--nav"
                  disabled={validCurrentPage === 1}
                  onClick={() => {
                    setCurrentPage(p => Math.max(p - 1, 1));
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                >
                  ‹
                </button>

                {/* Smart page window */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    if (totalPages <= 5) return true;
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - validCurrentPage) <= 1) return true;
                    return false;
                  })
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`dots-${idx}`} className="cp-page-dots">…</span>
                    ) : (
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
                    )
                  )
                }

                {/* Next button */}
                <button
                  className="cp-page-btn cp-page-btn--nav"
                  disabled={validCurrentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(p => Math.min(p + 1, totalPages));
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                >
                  ›
                </button>
              </div>
            )}

            {/* ── SEO TEXT ── */}
            <div className="cp-seo">
              <h2 className="cp-seo__h">Online store with a wide selection of gifts, toys & astro decor</h2>
              <p className="cp-seo__p">
                AstroGifts offers curated gift boxes, zodiac crystal gemstone sets, educational toys, and handcrafted spiritual decor. 
                Whether you are looking for anniversary gifts, birthday hampers, or positive energy crystals, our collection brings joy and harmony to your loved ones.
              </p>
              <h2 className="cp-seo__h">Handcrafted with Love & Quality Guaranteed</h2>
              <p className="cp-seo__p">
                We select the finest artisanal gifts, non-toxic kids toys, and authentic healing gemstones. Each gift hamper is thoughtfully packed to ensure a memorable unboxing experience.
              </p>
            </div>
          </main>

        </div>
      </div>

      <Footer />
      </div>
  );
}
