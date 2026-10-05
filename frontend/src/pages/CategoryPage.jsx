import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import './CategoryPage.css';
import { productsApi, categoriesApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/shop/ProductCard';

import img_gifts_banner from '../assets/gifts.jpg';
import img_toys_banner from '../assets/toys_collection_banner.jpg';
import img_astrology_banner from '../assets/astro.jpg';
import img_flowers_banner from '../assets/flowers.jpg';
import img_gift_box from '../assets/gift image.jpg';
import img_astro_item from '../assets/astri image.jpg';
import img_crystal from '../assets/Rose_Quartz.webp';

/* ──────────────────────────────────────────────
   Hero banner config per category
   ────────────────────────────────────────────── */
const HERO_CONFIG = {
  // Main categories
  gifts:       { label: 'Gifts',               img: img_gifts_banner,     bg: 'linear-gradient(135deg,#7c3a1d 0%,#a04f29 50%,#2c1510 100%)' },
  toys:        { label: 'Toys',                img: img_toys_banner,      bg: 'linear-gradient(135deg,#2e7d32 0%,#4caf50 100%)' },
  astrology:   { label: 'Astrology',           img: img_astrology_banner, bg: 'linear-gradient(135deg,#4a148c 0%,#7b1fa2 100%)' },
  flowers:     { label: 'Flowers',             img: img_flowers_banner,   bg: 'linear-gradient(135deg,#ad1457 0%,#f06292 100%)' },
  decor:       { label: 'Decor',               img: img_gift_box,         bg: 'linear-gradient(135deg,#7c3a1d 0%,#b85d32 100%)' },
  // Gift subcategories
  'diwali-gifts':      { label: 'Diwali Gifts',      img: img_gifts_banner,   bg: 'linear-gradient(135deg,#7c3a1d 0%,#d4af37 100%)' },
  'birthday-gifts':    { label: 'Birthday Gifts',    img: img_gift_box,       bg: 'linear-gradient(135deg,#880e4f 0%,#ec407a 100%)' },
  'anniversary-gifts': { label: 'Anniversary Gifts', img: img_gifts_banner,   bg: 'linear-gradient(135deg,#7c3a1d 0%,#c2185b 100%)' },
  // Toy subcategories
  'soft-toys':   { label: 'Soft Toys',   img: img_toys_banner, bg: 'linear-gradient(135deg,#e65100 0%,#ff9800 100%)' },
  'baby-toys':   { label: 'Baby Toys',   img: img_toys_banner, bg: 'linear-gradient(135deg,#0277bd 0%,#29b6f6 100%)' },
  'board-games': { label: 'Board Games', img: img_toys_banner, bg: 'linear-gradient(135deg,#2e7d32 0%,#66bb6a 100%)' },
  // Astrology subcategories
  'rings':              { label: 'Rings',                img: img_astro_item,       bg: 'linear-gradient(135deg,#4a148c 0%,#8e2de2 100%)' },
  'pendants':           { label: 'Pendants',             img: img_astrology_banner, bg: 'linear-gradient(135deg,#4a148c 0%,#ab47bc 100%)' },
  'bracelets':          { label: 'Bracelets',            img: img_crystal,          bg: 'linear-gradient(135deg,#311b92 0%,#673ab7 100%)' },
  'gemstones-crystals': { label: 'Gemstones & Crystals', img: img_crystal,          bg: 'linear-gradient(135deg,#1a237e 0%,#3f51b5 100%)' },
  // Legacy fallback
  'astrogifts': { label: 'All Products', img: img_gifts_banner, bg: 'linear-gradient(135deg,#7c3a1d 0%,#4a2511 100%)' },
};

const DEFAULT_CATEGORIES_TREE = [
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
  },
  {
    name: 'Flowers',
    slug: 'flowers',
    subcategories: []
  },
  {
    name: 'Decor',
    slug: 'decor',
    subcategories: []
  }
];

/* ══════════════════════════════════════════════════
   MAIN CATEGORY PAGE
   ══════════════════════════════════════════════════ */
export default function CategoryPage({ categorySlug }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const rawSlug = (categorySlug || slug || 'gifts').toLowerCase();
  const activeSlug = rawSlug.replace(/_/g, '-');

  const hero     = HERO_CONFIG[activeSlug] || HERO_CONFIG.gifts;
  const [allProds, setAllProds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesTree, setCategoriesTree] = useState(DEFAULT_CATEGORIES_TREE);
  const [expandedCategories, setExpandedCategories] = useState(['Toys']);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);

    // 1. Fetch all products so multi-category & cross-category combinations work instantly
    productsApi.getAll({ per_page: 1000 })
      .then(res => {
         if (res && res.data) {
             setAllProds(res.data);
         }
      })
      .catch(err => {
         console.error("Failed to load products for category page", err);
         setAllProds([]);
      })
      .finally(() => {
         setLoading(false);
      });

    // 2. Fetch dynamic categories from backend API
    categoriesApi.getAll().then(res => {
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setCategoriesTree(res.data);
      }
    }).catch(console.error);

    // 3. Configure initial accordion expansion and selected category checkboxes based on URL slug
    if (activeSlug === 'all' || activeSlug === 'shop' || activeSlug === 'astrogifts') {
      setSelectedCategories([]);
      setExpandedCategories(['Toys', 'Gifts']);
    } else {
      // Find whether activeSlug is a parent category or a subcategory
      let foundParent = DEFAULT_CATEGORIES_TREE.find(cat => 
        cat.slug.toLowerCase() === activeSlug || cat.name.toLowerCase() === activeSlug
      );
      let foundSub = null;

      if (!foundParent) {
        for (const cat of DEFAULT_CATEGORIES_TREE) {
          const sub = cat.subcategories?.find(s => s.slug.toLowerCase() === activeSlug || s.name.toLowerCase() === activeSlug);
          if (sub) {
            foundParent = cat;
            foundSub = sub;
            break;
          }
        }
      }

      if (foundParent) {
        setExpandedCategories([foundParent.name]);
        setSelectedCategories([]);
      } else {
        const words = activeSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1));
        const formatted = words.join(' ');
        setExpandedCategories([formatted]);
        setSelectedCategories([]);
      }
    }
  }, [activeSlug]);

  /* Filter state */
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const [priceMax, setPriceMax]           = useState(null);
  const [priceMin, setPriceMin]           = useState(null);
  const [tempPriceMax, setTempPriceMax]   = useState(null);
  const [tempPriceMin, setTempPriceMin]   = useState(null);
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

  const toggleExpandCategory = (catName) => {
    setExpandedCategories(prev => 
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  const toggleParentCategory = (parentCat) => {
    setCurrentPage(1);
    const pName = parentCat.name;
    const isChecked = selectedCategories.includes(pName) || selectedCategories.includes(parentCat.slug);

    if (isChecked) {
      // Remove parent and any of its subcategories
      const subNames = (parentCat.subcategories || []).map(s => s.name);
      setSelectedCategories(prev => prev.filter(c => c !== pName && c !== parentCat.slug && !subNames.includes(c)));
    } else {
      // Add parent and expand accordion
      setSelectedCategories(prev => [...prev, pName]);
      setExpandedCategories(prev => prev.includes(pName) ? prev : [...prev, pName]);
    }
  };

  const toggleSubCategory = (sub, parentCat) => {
    setCurrentPage(1);
    const subName = sub.name;
    const isChecked = selectedCategories.includes(subName) || selectedCategories.includes(sub.slug);

    if (isChecked) {
      setSelectedCategories(prev => prev.filter(c => c !== subName && c !== sub.slug));
    } else {
      setSelectedCategories(prev => [...prev, subName]);
    }
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
  const [selectedRingSizes, setSelectedRingSizes] = useState([]);
  const [selectedPlatings, setSelectedPlatings]   = useState([]);

  /* Myntra-style Default Options & Dynamic Fallbacks */
  const DEFAULT_RING_SIZES = [
    'Size 10',
    'Size 12',
    'Size 14',
    'Size 16',
    'Size 18',
    'Size 20',
    'Adjustable'
  ];

  const DEFAULT_PLATING_OPTIONS = [
    { name: 'Gold Plated', color: '#d4af37' },
    { name: 'Silver Plated', color: '#c0c0c0' },
    { name: 'Brass / Panchdhatu', color: '#b87333', border: '#8b5a2b' },
    { name: 'Rose Gold', color: '#b76e79' }
  ];
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
    'Diwali Gifts',
    'Birthday Gifts',
    'Anniversary Gifts',
    'Luxury Gift Hampers',
    'Custom Photo Frames',
    'Flowers & Bouquets',
    'Chocolate Hampers',
    'Festive Gifts'
  ];

  const DEFAULT_DIWALI_CATEGORIES = [
    'Diyas & Lamps',
    'Candles & Candle Sets',
    'Decorative Lights',
    'Diwali Gift Hampers',
    'Laxmi Ganesh Idols',
    'Sweets & Dry Fruits',
    'Toran & Door Decor',
    'Puja Thali & Brass Sets'
  ];

  const DEFAULT_ANNIVERSARY_CATEGORIES = [
    'Watches',
    'Hamper Gifts',
    'Perfumes'
  ];

  const DEFAULT_BIRTHDAY_CATEGORIES = [
    'Accessory Gift Set',
    'Home Gift Sets',
    'Rakhi Gift Set',
    'Watch Gift Set',
    'Baby Apparel Gift Set',
    'Makeup Gift Set',
    'Skin Care Gift Set',
    'Fragrance Gift Set',
  ];
  const DEFAULT_GIFT_BRANDS = [
    'AstroGifts',
    'AstroToys',
    'AstroSacred',
    'AstroFlora',
    'AstroDecor'
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

  const DEFAULT_FLOWERS_CATEGORIES = [
    'Bouquets',
    'Roses',
    'Orchids',
    'Flower Baskets',
    'Exotic Flowers'
  ];

  const DEFAULT_DECOR_CATEGORIES = [
    'Wall Frames',
    'Decorative Lamps',
    'Table Idols',
    'Vases & Planters',
    'Clocks'
  ];

  const isToysCategory        = activeSlug.includes('toy') || activeSlug.includes('game');
  const isAstroCategory       = activeSlug.includes('astro') || activeSlug.includes('ring') || activeSlug.includes('gem') || activeSlug.includes('pendant') || activeSlug.includes('crystal') || activeSlug.includes('bracelet');
  const isBirthdayCategory    = activeSlug === 'birthday-gifts';
  const isDiwaliCategory      = activeSlug === 'diwali-gifts';
  const isAnniversaryCategory = activeSlug === 'anniversary-gifts';
  const isShopAllPage         = activeSlug === 'all' || activeSlug === 'shop' || activeSlug === 'astrogifts';
  const isFlatCategoryPage    = !isShopAllPage;

  /* Derived filter options */
  const categoriesList = useMemo(() => {
    let defaultList = DEFAULT_GIFT_CATEGORIES;
    if (isBirthdayCategory) defaultList = DEFAULT_BIRTHDAY_CATEGORIES;
    else if (isDiwaliCategory) defaultList = DEFAULT_DIWALI_CATEGORIES;
    else if (isAnniversaryCategory) defaultList = DEFAULT_ANNIVERSARY_CATEGORIES;
    else if (isToysCategory) defaultList = DEFAULT_TOYS_CATEGORIES;
    else if (isAstroCategory) defaultList = DEFAULT_ASTROLOGY_CATEGORIES;
    else if (activeSlug === 'flowers') defaultList = DEFAULT_FLOWERS_CATEGORIES;
    else if (activeSlug === 'decor') defaultList = DEFAULT_DECOR_CATEGORIES;
    else if (activeSlug === 'gifts') defaultList = DEFAULT_GIFT_CATEGORIES;

    if (!catQuery) return defaultList;
    return defaultList.filter(c => c.toLowerCase().includes(catQuery.toLowerCase()));
  }, [isBirthdayCategory, isDiwaliCategory, isAnniversaryCategory, isToysCategory, isAstroCategory, activeSlug, catQuery]);

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

  /* Counts (Calculated dynamically from real products in database) */
  const getCategoryCount = (catName) => {
    const scLower = catName.toLowerCase().trim();
    const scSlug = scLower.replace(/[^a-z0-9]+/g, '-');
  
      const matched = allProds.filter(p => {
        // Enforce route match for counts too!
        if (activeSlug && activeSlug !== 'all' && activeSlug !== 'shop' && activeSlug !== 'astrogifts') {
          let matchesRoute = checkProductMatchesCategory(p, activeSlug);
          if (!matchesRoute) return false;
        }

        const pSlug = (p.category_slug || '').toLowerCase().trim();
      const pName = (p.category_name || p.category || '').toLowerCase().trim();
      const pTitle = (p.name || '').toLowerCase().trim();
      const pDesc = (p.description || '').toLowerCase().trim();

      // Page-level strict exclusion guards
      if (activeSlug === 'anniversary-gifts') {
        if (pSlug.includes('toy') || pName.includes('toy') || pTitle.includes('toy') || pTitle.includes('train') || pTitle.includes('puzzle') || pTitle.includes('doll') || pTitle.includes('game') ||
            pSlug.includes('astro') || pSlug.includes('crystal') || pSlug.includes('gem') || pTitle.includes('crystal') || pTitle.includes('quartz') || pTitle.includes('amethyst') || pTitle.includes('rudraksha') || pTitle.includes('yantra') ||
            pTitle.includes('birthday') || pTitle.includes('bday') || pTitle.includes('baby') || pTitle.includes('diwali') || pTitle.includes('diya')) {
          return false;
        }
      } else if (activeSlug === 'birthday-gifts') {
        if (pTitle.includes('diwali') || pTitle.includes('diya') || pTitle.includes('pooja') || pTitle.includes('puja') || 
            pSlug.includes('crystal') || pSlug.includes('gem') || pTitle.includes('quartz') || pTitle.includes('amethyst') ||
            pTitle.includes('anniversary') || pTitle.includes('couple frame')) {
          return false;
        }
      } else if (activeSlug === 'diwali-gifts') {
        if (pTitle.includes('birthday') || pTitle.includes('bday') || pTitle.includes('anniversary') || pTitle.includes('baby') ||
            pSlug.includes('toy') || pTitle.includes('toy') || pTitle.includes('train') || pTitle.includes('puzzle')) {
          return false;
        }
      } else if (isToysCategory) {
        if (pSlug.includes('astro') || pSlug.includes('crystal') || pSlug.includes('gem') || pTitle.includes('crystal') || pTitle.includes('quartz') || pTitle.includes('amethyst') || pTitle.includes('diwali') || pTitle.includes('diya') || pTitle.includes('hamper')) {
          return false;
        }
      } else if (isAstroCategory) {
        if (pSlug.includes('toy') || pTitle.includes('toy') || pTitle.includes('train') || pTitle.includes('balloon') || pTitle.includes('hamper') || pTitle.includes('diwali')) {
          return false;
        }
      }

      if (pSlug === scSlug || pSlug === scLower || pName === scLower || pName === scSlug) return true;

      if (scLower.includes('ring')) return pTitle.includes('ring') || pSlug.includes('ring') || pName.includes('ring');
      if (scLower.includes('pendant')) return pTitle.includes('pendant') || pTitle.includes('locket') || pSlug.includes('pendant') || pName.includes('pendant');
      if (scLower.includes('bracelet')) return pTitle.includes('bracelet') || pTitle.includes('kada') || pSlug.includes('bracelet') || pName.includes('bracelet');
      if (scLower.includes('gemstone') || scLower.includes('crystal')) return pTitle.includes('gemstone') || pTitle.includes('crystal') || pTitle.includes('quartz') || pTitle.includes('amethyst') || pTitle.includes('ruby') || pTitle.includes('sapphire') || pSlug.includes('crystal') || pSlug.includes('gem');
      if (scLower.includes('yantra') || scLower.includes('idol')) return pTitle.includes('yantra') || pTitle.includes('idol') || pTitle.includes('statue');
      if (scLower.includes('rudraksha')) return pTitle.includes('rudraksha') || pSlug.includes('rudraksha');

      if (scLower === 'watches' || scLower.includes('watch')) {
        return pTitle.includes('watch') || pSlug.includes('watch');
      }
      if (scLower === 'hamper gifts' || scLower.includes('hamper')) {
        return pTitle.includes('hamper') || pSlug.includes('hamper') || pName.includes('hamper') || pTitle.includes('gift box') || pDesc.includes('hamper');
      }
      if (scLower === 'perfumes' || scLower.includes('perfume') || scLower.includes('fragrance')) {
        return pTitle.includes('perfume') || pTitle.includes('fragrance') || pTitle.includes('scent') || pSlug.includes('fragrance');
      }
      if (scLower.includes('candle')) return pTitle.includes('candle') || pDesc.includes('candle') || pSlug.includes('candle');
        if (scLower.includes('diya') || scLower.includes('lamp')) return pTitle.includes('diya') || pTitle.includes('lamp') || pTitle.includes('votive') || pTitle.includes('luminary');
        if (scLower.includes('light')) return pTitle.includes('light') || pTitle.includes('lantern') || pTitle.includes('led');
      if (scLower.includes('photo frame') || scLower.includes('frame')) return pTitle.includes('frame');
      if (scLower.includes('sweet') || scLower.includes('dry fruit')) return pTitle.includes('sweet') || pTitle.includes('dry fruit');
      if (scLower.includes('skin')) return pTitle.includes('skin') || pTitle.includes('lotion');
      if (scLower.includes('makeup')) return pTitle.includes('makeup') || pTitle.includes('lipstick');
      if (scLower.includes('apparel')) return pTitle.includes('apparel') || pTitle.includes('cloth');

      const parentItem = categoriesTree.find(c => c.name.toLowerCase() === scLower || c.slug.toLowerCase() === scSlug);
      if (parentItem) {
        if (pSlug === parentItem.slug.toLowerCase() || pName === parentItem.name.toLowerCase()) return true;
        if (parentItem.subcategories && parentItem.subcategories.some(sub => {
          const subSlug = (sub.slug || '').toLowerCase();
          const subName = (sub.name || '').toLowerCase();
          return pSlug === subSlug || pName === subName || pSlug === subSlug.replace(/[^a-z0-9]+/g, '-');
        })) {
          return true;
        }
      }
      return false;
    });

    return matched.length;
  };

  const getBrandCount = bName => {
    return allProds.filter(p => p.brand && p.brand.toLowerCase() === bName.toLowerCase()).length;
  };

  const getColorCount = cName => {
    return allProds.filter(p => p.color && p.color.toLowerCase() === cName.toLowerCase()).length;
  };

  const checkRingSizeMatch = (p, sizeName) => {
    const sLower = sizeName.toLowerCase().replace(/size\s*/i, '').trim();
    const pTitle = (p.name || '').toLowerCase();
    const pDesc = (p.description || '').toLowerCase();
    const pSize = String(p.ring_sizes || p.size || p.sizes || p.raw?.size || p.raw?.ring_sizes || '').toLowerCase();
    const fullText = `${pTitle} ${pDesc} ${pSize}`;
    return fullText.includes(sLower) || (sLower.includes('adjust') && (fullText.includes('adjust') || fullText.includes('free size') || fullText.includes('one size')));
  };

  const getRingSizeCount = sizeName => {
    return allProds.filter(p => checkRingSizeMatch(p, sizeName)).length;
  };

  const checkPlatingMatch = (p, platName) => {
    const plClean = platName.toLowerCase().trim();
    const pTitle = (p.name || '').toLowerCase();
    const pDesc = (p.description || '').toLowerCase();
    const pPlating = String(p.plating || p.metal_finish || p.material || p.color || p.raw?.plating || p.raw?.metal_finish || '').toLowerCase();
    const pColors = Array.isArray(p.colors) ? p.colors.join(' ').toLowerCase() : '';
    const fullText = `${pTitle} ${pDesc} ${pPlating} ${pColors}`;

    if (plClean.includes('silver')) {
      return fullText.includes('silver') || fullText.includes('chandi') || fullText.includes('#c0c0c0');
    }
    if (plClean.includes('gold') && !plClean.includes('rose')) {
      return fullText.includes('gold') || fullText.includes('golden') || fullText.includes('sona') || fullText.includes('#d4af37');
    }
    if (plClean.includes('rose')) {
      return fullText.includes('rose gold') || fullText.includes('rosegold') || fullText.includes('rose-gold') || fullText.includes('#b76e79');
    }
    if (plClean.includes('brass') || plClean.includes('panchdhatu')) {
      return fullText.includes('brass') || fullText.includes('panchdhatu') || fullText.includes('panch') || fullText.includes('copper') || fullText.includes('bronze') || fullText.includes('#b87333');
    }

    const baseWord = plClean.split(/[\s/]+/)[0];
    return fullText.includes(baseWord);
  };

  const getPlatingCount = platName => {
    return allProds.filter(p => checkPlatingMatch(p, platName)).length;
  };

  /* Helper function to check if a product matches a target category name/slug */
  const checkProductMatchesCategory = (p, target) => {
    if (!p || !target) return false;
    const targetLower = target.toLowerCase().trim();
    const targetSlug = targetLower.replace(/_/g, '-').replace(/[^a-z0-9-]+/g, '');

    const pSlug  = (p.category_slug || '').toLowerCase().trim();
    const pName  = (p.category_name || p.category || '').toLowerCase().trim();
    const pTitle = (p.name || '').toLowerCase().trim();
    const pDesc  = (p.description || '').toLowerCase().trim();

    // 1. Direct slug or name match
    if (pSlug === targetSlug || pSlug === targetLower || pName === targetLower || pName === targetSlug) {
      return true;
    }

    // 2. Parent-child hierarchy matching (e.g. 'gifts' matches 'diwali-gifts', 'birthday-gifts', 'anniversary-gifts')
    if (targetSlug === 'gifts' || targetLower === 'gifts') {
      return pSlug === 'gifts' || pSlug === 'diwali-gifts' || pSlug === 'birthday-gifts' || pSlug === 'anniversary-gifts' ||
             pName.includes('gift') || pTitle.includes('gift') || pTitle.includes('hamper') || pTitle.includes('luminary') || pTitle.includes('votive') || pTitle.includes('casket') || pTitle.includes('balloon') || pTitle.includes('smartots');
    }

    if (targetSlug === 'toys' || targetLower === 'toys') {
      return pSlug === 'toys' || pSlug === 'soft-toys' || pSlug === 'baby-toys' || pSlug === 'board-games' ||
             pName.includes('toy') || pTitle.includes('toy') || pTitle.includes('game') || pTitle.includes('bunny') || pTitle.includes('chess');
    }

    if (targetSlug === 'astrology' || targetLower === 'astrology') {
      return pSlug === 'astrology' || pSlug === 'rings' || pSlug === 'pendants' || pSlug === 'bracelets' || pSlug === 'gemstones-crystals' ||
             pName.includes('astro') || pTitle.includes('ring') || pTitle.includes('pendant') || pTitle.includes('pendent') || pTitle.includes('bracelet') || pTitle.includes('crystal') || pTitle.includes('gemstone') || pTitle.includes('stone') || pTitle.includes('pyrite') || pTitle.includes('quartz');
    }

    // Subcategory specific matching rules
    if (targetSlug === 'diwali-gifts' || targetLower === 'diwali gifts') {
        return pSlug === 'diwali-gifts' || pName.includes('diwali') || pTitle.includes('diwali') || pTitle.includes('diya') || pTitle.includes('light') || pTitle.includes('candle') || pTitle.includes('lamp') || pTitle.includes('luminary') || pTitle.includes('votive') || pTitle.includes('utsav') || pTitle.includes('rangoli') || pTitle.includes('brass') || pDesc.includes('diwali');
      }

      // Diwali Subcategories Exact Matching
      if (targetLower.includes('diyas') || targetLower.includes('lamps')) {
        return pTitle.includes('diya') || pTitle.includes('lamp') || pTitle.includes('votive') || pTitle.includes('luminary') || pSlug.includes('diya') || pSlug.includes('lamp');
      }
      if (targetLower.includes('candle')) {
        return pTitle.includes('candle') || pDesc.includes('candle') || pSlug.includes('candle');
      }
      if (targetLower.includes('light')) {
        return pTitle.includes('light') || pTitle.includes('lantern') || pTitle.includes('led') || pTitle.includes('string');
      }
      if (targetLower.includes('hamper')) {
        return pTitle.includes('hamper') || pTitle.includes('gift box') || pTitle.includes('casket') || pDesc.includes('hamper');
      }
      if (targetLower.includes('idol') || targetLower.includes('laxmi') || targetLower.includes('ganesh')) {
        return pTitle.includes('idol') || pTitle.includes('statue') || pTitle.includes('murti') || pTitle.includes('laxmi') || pTitle.includes('ganesh');
      }
      if (targetLower.includes('sweet') || targetLower.includes('dry fruit')) {
        return pTitle.includes('sweet') || pTitle.includes('dry fruit') || pTitle.includes('chocolate') || pTitle.includes('mithai');
      }
      if (targetLower.includes('toran') || targetLower.includes('door')) {
        return pTitle.includes('toran') || pTitle.includes('bandhanwar') || pTitle.includes('hanging');
      }
      if (targetLower.includes('puja thali') || targetLower.includes('brass')) {
        return pTitle.includes('thali') || pTitle.includes('brass') || pTitle.includes('puja') || pTitle.includes('pooja');
      }

    if (targetSlug === 'birthday-gifts' || targetLower === 'birthday gifts') {
      return pSlug === 'birthday-gifts' || pName.includes('birthday') || pTitle.includes('birthday') || pTitle.includes('bday') || pTitle.includes('balloon');
    }

    if (targetSlug === 'anniversary-gifts' || targetLower === 'anniversary gifts') {
      return pSlug === 'anniversary-gifts' || pName.includes('anniversary') || pTitle.includes('anniversary') || pTitle.includes('casket') || pTitle.includes('signature hamper') || pDesc.includes('anniversary');
    }

    if (targetSlug === 'soft-toys' || targetLower === 'soft toys') {
      return pSlug === 'soft-toys' || pName.includes('soft') || pTitle.includes('soft') || pTitle.includes('bunny') || pTitle.includes('teddy') || pTitle.includes('plush') || pTitle.includes('doll');
    }

    if (targetSlug === 'baby-toys' || targetLower === 'baby toys') {
      return pSlug === 'baby-toys' || pName.includes('baby') || pTitle.includes('baby') || pTitle.includes('rattle') || pTitle.includes('smartots') || pTitle.includes('elephan');
    }

    if (targetSlug === 'board-games' || targetLower === 'board games') {
      return pSlug === 'board-games' || pName.includes('board') || pTitle.includes('board') || pTitle.includes('chess') || pTitle.includes('game') || pTitle.includes('puzzle');
    }

    if (targetSlug === 'rings' || targetLower === 'rings') {
      return pSlug === 'rings' || pName.includes('ring') || pTitle.includes('ring');
    }

    if (targetSlug === 'pendants' || targetLower === 'pendants') {
      return pSlug === 'pendants' || pName.includes('pendant') || pTitle.includes('pendant') || pTitle.includes('pendent') || pTitle.includes('locket');
    }

    if (targetSlug === 'bracelets' || targetLower === 'bracelets') {
      return pSlug === 'bracelets' || pName.includes('bracelet') || pTitle.includes('bracelet') || pTitle.includes('band') || pTitle.includes('kada');
    }

    if (targetSlug === 'gemstones-crystals' || targetLower === 'gemstones & crystals' || targetLower === 'gemstones crystals') {
      return pSlug === 'gemstones-crystals' || pName.includes('gem') || pName.includes('crystal') || pTitle.includes('gemstone') || pTitle.includes('crystal') || pTitle.includes('quartz') || pTitle.includes('pyrite') || pTitle.includes('stone');
    }

    if (targetSlug === 'flowers' || targetLower === 'flowers') {
      return pSlug === 'flowers' || pName.includes('flower') || pTitle.includes('rose') || pTitle.includes('flower') || pTitle.includes('bouquet');
    }

    if (targetSlug === 'decor' || targetLower === 'decor') {
      return pSlug === 'decor' || pName.includes('decor') || pTitle.includes('decor') || pTitle.includes('frame') || pTitle.includes('lamp') || pTitle.includes('luminary');
    }

    // Generic keyword fallback
    const cleanTarget = targetLower.replace(/[^a-z0-9]+/g, ' ').trim();
    const words = cleanTarget.split(' ').filter(w => w.length > 2 && !['gift', 'gifts', 'toy', 'toys', 'and', 'for', 'set'].includes(w));
    if (words.length > 0) {
      return words.some(w => pSlug.includes(w) || pName.includes(w) || pTitle.includes(w) || pDesc.includes(w));
    }

    return false;
  };

  /* Filtered list */
  const filtered = useMemo(() => {
    let list = allProds.filter(p => {
      // 1. Search Query filter
      if (searchQuery) {
        const matchName = (p.name || '').toLowerCase().includes(searchQuery);
        const matchCat  = (p.category && p.category.toLowerCase().includes(searchQuery)) || 
                          (p.category_name && p.category_name.toLowerCase().includes(searchQuery));
        if (!matchName && !matchCat) return false;
      }

      // 2. Gender filter
      if (selectedGender) {
        const pGender = (p.gender || p.target_gender || p.name || p.description || '').toLowerCase();
        if (pGender && !pGender.includes(selectedGender.toLowerCase())) return false;
      }

      // 3. Price Range filter
      if (p.price < appliedPriceMin) return false;
      if (p.price > appliedPriceMax) return false;

      // 4. Route Match Filter (Always enforce intersection)
        if (activeSlug && activeSlug !== 'all' && activeSlug !== 'shop' && activeSlug !== 'astrogifts') {
          let matchesRoute = checkProductMatchesCategory(p, activeSlug); if (!matchesRoute) return false;
        }

        // 5. Sidebar Checkbox Category Filter
        if (selectedCategories.length > 0) {
          const matchesAnySelected = selectedCategories.some(sc => checkProductMatchesCategory(p, sc));
          if (!matchesAnySelected) return false;
        }

      // 5. Brands, Colors, Sizes, Platings, Discounts, Stock
      if (selectedBrands.length > 0 && !selectedBrands.some(sb => (p.brand || '').toLowerCase() === sb.toLowerCase())) return false;
      if (selectedColors.length > 0 && !selectedColors.some(sc => (p.color || '').toLowerCase() === sc.toLowerCase())) return false;

      if (selectedRingSizes.length > 0) {
        const matchesSize = selectedRingSizes.some(rs => checkRingSizeMatch(p, rs));
        if (!matchesSize) return false;
      }

      if (selectedPlatings.length > 0) {
        const matchesPlating = selectedPlatings.some(pl => checkPlatingMatch(p, pl));
        if (!matchesPlating) return false;
      }

      if (minDiscount !== null) {
        const disc = p.discount_percentage || (p.old_price && p.old_price > p.price ? Math.round(((p.old_price - p.price) / p.old_price) * 100) : 0);
        if (disc < minDiscount) return false;
      }

      if (onSale && !p.old_price) return false;
      if (inStock && p.stock <= 0) return false;

      return true;
    });

    if (sortBy === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     list = [...list].sort((a, b) => (b.rating || 5) - (a.rating || 5));
    return list;
  }, [allProds, appliedPriceMin, appliedPriceMax, selectedCategories, activeSlug, selectedBrands, selectedColors, selectedRingSizes, selectedPlatings, minDiscount, onSale, inStock, sortBy, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (validCurrentPage - 1) * perPage;
  const displayedProds = filtered.slice(startIdx, startIdx + perPage);

  const toggle = (arr, setArr, val) => {
    setCurrentPage(1);
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const isFilterActive = selectedGender !== null || selectedCategories.length > 0 || selectedBrands.length > 0 || selectedColors.length > 0 || selectedRingSizes.length > 0 || selectedPlatings.length > 0 || minDiscount !== null || priceMin !== null || priceMax !== null || onSale || inStock;

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
    setSelectedRingSizes([]);
    setSelectedPlatings([]);
    setMinDiscount(null);
    setOnSale(false);
    setInStock(false);
    setOnBackorder(false);
    setCurrentPage(1);
  };

  const genderOptions = useMemo(() => {
    return ['For Couples', 'For Kids', 'For Family', 'For Friends', 'Festive Special'];
  }, []);

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

            {/* 1. CATEGORIES ACCORDION TREE */}
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

              {isFlatCategoryPage ? (
                <ul className="myntra-checklist">
                  {categoriesList.map(catName => {
                    const isChecked = selectedCategories.includes(catName);
                    const count = getCategoryCount(catName);
                    return (
                      <li key={catName}>
                        <label className="myntra-check-label">
                          <input
                            type="checkbox"
                            className="myntra-check"
                            checked={isChecked}
                            onChange={() => toggle(selectedCategories, setSelectedCategories, catName)}
                          />
                          <span className="myntra-check-text">
                            {catName}
                            <span className="myntra-check-count">({count})</span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="myntra-category-tree">
                  {categoriesTree.map(parentCat => {
                    const isParentExpanded = expandedCategories.includes(parentCat.name) || expandedCategories.includes(parentCat.slug);
                    const isParentChecked = selectedCategories.includes(parentCat.name) || selectedCategories.includes(parentCat.slug);
                    
                    const subcats = parentCat.subcategories || [];
                    const visibleSubcategories = catQuery
                      ? subcats.filter(s => s.name.toLowerCase().includes(catQuery.toLowerCase()))
                      : subcats;

                    const parentMatchesQuery = !catQuery || 
                      parentCat.name.toLowerCase().includes(catQuery.toLowerCase()) || 
                      visibleSubcategories.length > 0;

                    if (!parentMatchesQuery) return null;

                    const parentCount = getCategoryCount(parentCat.name);

                    return (
                      <div key={parentCat.name} className="myntra-cat-group">
                        <div className="myntra-cat-parent-row">
                          <label 
                            className="myntra-check-label myntra-cat-parent-title"
                            style={{ cursor: 'pointer', flex: 1, margin: 0 }}
                          >
                            <input 
                              type="checkbox" 
                              className="myntra-check" 
                              checked={isParentChecked} 
                              onChange={() => toggleParentCategory(parentCat)} 
                            />
                            <span className="myntra-check-text font-bold">
                              {parentCat.name}
                              {parentCount > 0 && (
                                <span className="myntra-check-count">({parentCount})</span>
                              )}
                            </span>
                          </label>

                          {subcats.length > 0 && (
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
                          )}
                        </div>

                        {isParentExpanded && visibleSubcategories.length > 0 && (
                          <ul className="myntra-subcategories-list">
                            {visibleSubcategories.map(sub => {
                              const isSubChecked = selectedCategories.includes(sub.name) || selectedCategories.includes(sub.slug);
                              const subCount = getCategoryCount(sub.name);

                              return (
                                <li key={sub.name}>
                                  <label className="myntra-check-label myntra-subcheck-label">
                                    <input
                                      type="checkbox"
                                      className="myntra-check"
                                      checked={isSubChecked}
                                      onChange={() => toggleSubCategory(sub, parentCat)}
                                    />
                                    <span className="myntra-check-text">
                                      {sub.name}
                                      {subCount > 0 && (
                                        <span className="myntra-check-count">({subCount})</span>
                                      )}
                                    </span>
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RING SIZE (Shown when viewing astrology or ring categories or with ring items) */}
            {(isAstroCategory || activeSlug === 'all' || activeSlug === 'shop') && (
              <div className="myntra-widget">
                <h4 className="myntra-widget__title">RING SIZE</h4>
                <ul className="myntra-checklist">
                  {DEFAULT_RING_SIZES.map(size => {
                    const cnt = getRingSizeCount(size);
                    return (
                      <li key={size}>
                        <label className="myntra-check-label">
                          <input 
                            type="checkbox" 
                            className="myntra-check" 
                            checked={selectedRingSizes.includes(size)} 
                            onChange={() => toggle(selectedRingSizes, setSelectedRingSizes, size)} 
                          />
                          <span className="myntra-check-text">
                            {size}
                            {cnt > 0 && <span className="myntra-check-count"> ({cnt})</span>}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* PLATING / METAL FINISH */}
            {(isAstroCategory || activeSlug === 'all' || activeSlug === 'shop') && (
              <div className="myntra-widget">
                <h4 className="myntra-widget__title">PLATING / METAL FINISH</h4>
                <ul className="myntra-checklist">
                  {DEFAULT_PLATING_OPTIONS.map(p => {
                    const cnt = getPlatingCount(p.name);
                    return (
                      <li key={p.name}>
                        <label className="myntra-check-label">
                          <input 
                            type="checkbox" 
                            className="myntra-check" 
                            checked={selectedPlatings.includes(p.name)} 
                            onChange={() => toggle(selectedPlatings, setSelectedPlatings, p.name)} 
                          />
                          <span 
                            className="myntra-swatch-circle" 
                            style={{ background: p.color, border: p.border ? `1px solid ${p.border}` : '1px solid rgba(0,0,0,0.12)' }} 
                          />
                          <span className="myntra-check-text">
                            {p.name}
                            {cnt > 0 && <span className="myntra-check-count"> ({cnt})</span>}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

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
            {loading ? (
              <div className="cp-loading" style={{ textAlign: "center", padding: "50px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #333", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "15px" }}></div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                <p>Loading products...</p>
              </div>
            ) : displayedProds.length > 0 ? (
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











