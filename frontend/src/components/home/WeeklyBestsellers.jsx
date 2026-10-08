import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './WeeklyBestsellers.css';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { productsApi, categoriesApi } from '../../services/api';
import { getHexColor } from '../../utils/colorUtils';
import giftItemImg from '../../assets/gift image.jpg';

const getFormattedImageUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return '';
  }
  const t = rawUrl.trim();
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')) {
    return t.replace("http://127.0.0.1:8000", import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "") : "http://127.0.0.1:8000");
  }
  const backendBase = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
    : 'http://127.0.0.1:8000';

  if (t.startsWith('storage/') || t.startsWith('/storage/') || t.startsWith('uploads/') || t.startsWith('/uploads/')) {
    return `${backendBase}/${t.replace(/^\//, '')}`;
  }
  if (t.startsWith('/')) {
    return t.replace("http://127.0.0.1:8000", import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "") : "http://127.0.0.1:8000");
  }
  return `/${t}`;
};

function Stars({ rating }) {
  if (!rating) return null;
  return (
    <span className="wb-stars">
      <span className="wb-stars__val">{rating}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5a623" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </span>
  );
}



function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedColor, setSelectedColor] = useState(null);
  const navigate = useNavigate();

  const wishlisted = isInWishlist(product.id);
  const slug = product.slug || String(product.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const productUrl = `/product/${slug}`;
  const categoryUrl = `/category/${(product.category || 'gifts').toLowerCase()}`;

  const activeColor = selectedColor || product.color || (product.colors && product.colors.length > 0 ? product.colors[0] : null);

  // Dynamic Image resolution for selected color variant
  const cardImage = React.useMemo(() => {
    if (!product) return '';

    // Collect all raw product images
    let allImgs = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      allImgs = product.images.filter(Boolean);
    } else if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      allImgs = product.gallery.filter(Boolean);
    }
    const mainImg = product.image || product.img || product.image_url;
    if (mainImg && !allImgs.includes(mainImg)) {
      allImgs.unshift(mainImg);
    }
    const extraImgs = [product.image_2, product.image_3, product.image_4].filter(Boolean);
    allImgs = Array.from(new Set([...allImgs, ...extraImgs]));

    const targetCol = selectedColor || activeColor;

    if (targetCol) {
      const cLower = String(targetCol).toLowerCase().trim();

      // 1. Check color_images mapping (e.g. product.color_images['Pink'])
      if (product.color_images && typeof product.color_images === 'object') {
        const colKey = Object.keys(product.color_images).find(k => k.toLowerCase() === cLower);
        if (colKey) {
          const val = product.color_images[colKey];
          if (typeof val === 'string' && val.trim()) return getFormattedImageUrl(val.trim());
          if (Array.isArray(val) && val[0]) return getFormattedImageUrl(val[0]);
        }
      }

      // 2. Check color_gallery mapping (e.g. product.color_gallery['Pink'])
      if (product.color_gallery && typeof product.color_gallery === 'object') {
        const colKey = Object.keys(product.color_gallery).find(k => k.toLowerCase() === cLower);
        if (colKey && Array.isArray(product.color_gallery[colKey]) && product.color_gallery[colKey][0]) {
          return getFormattedImageUrl(product.color_gallery[colKey][0]);
        }
      }

      // 3. Search for color name in image URLs
      const matched = allImgs.find(img => typeof img === 'string' && img.toLowerCase().includes(cLower));
      if (matched) {
        return getFormattedImageUrl(matched);
      }

      // 4. Index-ratio mapping if product has multiple colors and multiple images
      if (Array.isArray(product.colors) && product.colors.length > 1 && allImgs.length >= product.colors.length) {
        const cIndex = product.colors.findIndex(c => String(c).toLowerCase().trim() === cLower);
        if (cIndex >= 0) {
          const numPerColor = Math.floor(allImgs.length / product.colors.length);
          if (numPerColor >= 1 && allImgs[cIndex * numPerColor]) {
            return getFormattedImageUrl(allImgs[cIndex * numPerColor]);
          }
        }
      }
    }

    return getFormattedImageUrl(mainImg || (allImgs.length > 0 ? allImgs[0] : null));
  }, [product, selectedColor, activeColor]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(activeColor ? { ...product, color: activeColor } : product);
  };

  return (
    <div className="wb-card">
      <div className="wb-card__img-wrap">
        {product.badge && (
          <span className={`wb-badge ${product.badge.startsWith('-') ? 'wb-badge--sale' : 'wb-badge--new'}`}>
            {product.badge}
          </span>
        )}

        <button
          className={`wb-card__wish ${wishlisted ? 'wb-card__wish--active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleWishlist(product);
          }}
          aria-label="Wishlist"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlisted ? "#eee6e1ff" : "none"} stroke={wishlisted ? "#e07b39" : "currentColor"} strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        <Link to={productUrl}>
          <img
            src={cardImage}
            alt={product.name}
            className="wb-card__img wb-card__img--main"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </Link>

        <div className="wb-card__hover-actions">
          <button
            className="wb-card__add-cart-btn"
            onClick={handleAddToCart}
          >
            Add to cart
          </button>
          <button
            className="wb-card__view-btn"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onQuickView) {
                onQuickView(activeColor ? { ...product, color: activeColor } : product);
              } else {
                navigate(productUrl);
              }
            }}
            title="Quick View"
            aria-label="Quick View"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            className="wb-card__view-btn"
            style={{ marginLeft: '8px' }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              const url = window.location.origin + productUrl;
              if (navigator.share) {
                navigator.share({
                  title: product.name,
                  text: 'Check out this product!',
                  url: url,
                }).catch(err => console.error('Share failed', err));
              } else {
                navigator.clipboard.writeText(url);
                alert('Link copied to clipboard!');
              }
            }}
            title="Share"
            aria-label="Share"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
      </div>

      <div className="wb-card__info">
        <div className="wb-card__title-row">
          <h3 className="wb-card__name">
            <Link to={productUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
              {product.name}
            </Link>
          </h3>
          <Stars rating={product.rating} />
        </div>

        <Link to={categoryUrl} className="wb-card__cat" style={{ textDecoration: 'none' }}>
          {product.category}
        </Link>

        {product.colors && product.colors.length > 0 && (
          <div className="wb-card__colors">
            {product.colors.map((color, idx) => (
              <span
                key={idx}
                className={`wb-card__dot ${selectedColor === color ? 'wb-card__dot--active' : ''}`}
                style={{ background: getHexColor(color) }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(prev => prev === color ? null : color);
                }}
                title={color}
              />
            ))}
          </div>
        )}

        <div className="wb-card__price-row">
          {product.originalPrice && (
            <span className="wb-card__old-price">₹{product.originalPrice.toFixed(2)}</span>
          )}
          <span className="wb-card__price">₹{product.price.toFixed(2)}</span>
        </div>

        <button
          className="wb-card__add-cart-btn-static"
          onClick={handleAddToCart}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

export default function WeeklyBestsellers() {
  const [activeTab, setActiveTab] = useState('All');
  const [apiProducts, setApiProducts] = useState([]);
  const [dynamicTabs, setDynamicTabs] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // 1. Dynamic Tabs Fetching from Backend Categories API
  useEffect(() => {
    categoriesApi.getAll().then(res => {
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const catNames = res.data.map(c => c.name);
        setDynamicTabs(['All', ...catNames]);
      } else {
        setDynamicTabs(['All', 'Gifts', 'Toys', 'Astrology', 'Flowers', 'Decor']);
      }
    }).catch(err => {
      console.error("Failed to load dynamic categories:", err);
      setDynamicTabs(['All', 'Gifts', 'Toys', 'Astrology', 'Flowers', 'Decor']);
    });
  }, []);

  // Robust Helper to match product to tab category (Gifts, Toys, Astrology, Flowers, Decor, etc.)
  const isProductInTab = (p, tabName) => {
    if (!p || !tabName) return false;
    if (tabName === 'All') return true;

    const tLower = tabName.toLowerCase().trim();
    const pCat = String(p.category || p.category_name || '').toLowerCase().trim();
    const pSlug = String(p.category_slug || '').toLowerCase().trim();
    const pTitle = String(p.name || '').toLowerCase().trim();
    const pDesc = String(p.description || '').toLowerCase().trim();

    // Strict type checks
    const isStoneOrCrystal = pSlug.includes('crystal') || pSlug.includes('gem') || pTitle.includes('crystal') || pTitle.includes('stone') || pTitle.includes('quartz') || pTitle.includes('sapphire') || pTitle.includes('ruby') || pTitle.includes('emerald') || pTitle.includes('amethyst') || pTitle.includes('rudraksha') || pTitle.includes('yantra');
    const isToyItem = pSlug.includes('toy') || pTitle.includes('toy') || pTitle.includes('train') || pTitle.includes('puzzle') || pTitle.includes('teddy') || pTitle.includes('doll') || pTitle.includes('rabbit') || pTitle.includes('bear') || pTitle.includes('board game');

    if (tLower === 'decor' || tLower.includes('decor')) {
      if (isStoneOrCrystal || isToyItem) return false; // Strictly exclude stones & toys from Decor!
      return pCat.includes('decor') || pSlug.includes('decor') || pTitle.includes('decor') || pTitle.includes('vase') || pTitle.includes('frame') || pTitle.includes('lamp') || pTitle.includes('idol') || pTitle.includes('clock') || pTitle.includes('wall hanging');
    }

    if (tLower === 'astrology' || tLower.includes('astro')) {
      if (isToyItem) return false;
      return isStoneOrCrystal || pCat.includes('astro') || pSlug.includes('astro') || pTitle.includes('ring') || pTitle.includes('pendant') || pTitle.includes('zodiac');
    }

    if (tLower === 'toys' || tLower.includes('toy')) {
      if (isStoneOrCrystal) return false;
      return isToyItem || pCat.includes('toy') || pSlug.includes('toy');
    }

    if (tLower === 'flowers' || tLower.includes('flower')) {
      if (isStoneOrCrystal || isToyItem) return false;
      return pCat.includes('flower') || pSlug.includes('flower') || pTitle.includes('flower') || pTitle.includes('bouquet') || pTitle.includes('rose') || pTitle.includes('orchid');
    }

    if (tLower === 'gifts' || tLower.includes('gift')) {
      if (isStoneOrCrystal || isToyItem) return false;
      return pCat.includes('gift') || pSlug.includes('gift') || pTitle.includes('gift') || pTitle.includes('hamper') || pTitle.includes('box') || pTitle.includes('anniversary') || pTitle.includes('birthday') || pTitle.includes('couple');
    }

    // Direct category or slug match
    return pCat === tLower || pSlug === tLower;
  };

  // 2. Dynamic Products Fetching from Backend Products API
  useEffect(() => {
    const fetchBestsellers = async () => {
      setLoading(true);
      try {
        // Fetch all products so category filtering works for Gifts, Toys, Astrology, Flowers, Decor
        let res = await productsApi.getAll({ per_page: 100 });
        let productsData = (res && Array.isArray(res.data)) ? res.data : [];

        // Also check bestsellers endpoint if available
        try {
          const bsRes = await productsApi.getBestsellers();
          if (bsRes && bsRes.status === 'success' && Array.isArray(bsRes.data) && bsRes.data.length > 0) {
            const bsIds = new Set(bsRes.data.map(b => String(b.id)));
            productsData = productsData.map(p => ({
              ...p,
              is_bestseller: bsIds.has(String(p.id)) || p.is_bestseller
            }));
          }
        } catch (e) {
          // Ignore
        }

        const formatted = productsData.map(p => {
          return {
            ...p,
            id: p.id,
            name: p.name,
            price: Number(p.price) || 0,
            originalPrice: p.old_price ? Number(p.old_price) : null,
            img: getFormattedImageUrl(p.image || p.image_url || p.img),
            category: p.category_name || p.category || 'Gifts',
            badge: p.badge || (p.is_new ? 'NEW' : (p.discount_percentage ? `-${p.discount_percentage}%` : null)),
            featured: true,
            rating: Number(p.rating) || 5
          };
        });

        setApiProducts(formatted);
      } catch (error) {
        console.error("Failed to fetch dynamic products:", error);
        setApiProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  // Filter products by selected active category tab
  const filteredProducts = React.useMemo(() => {
    if (!apiProducts || apiProducts.length === 0) return [];

    if (activeTab === 'All') {
      const bestsellers = apiProducts.filter(p => p.is_bestseller || p.badge === 'BESTSELLER');
      if (bestsellers.length >= 4) return bestsellers.slice(0, 10);
      return apiProducts.slice(0, 10);
    }

    return apiProducts.filter(p => isProductInTab(p, activeTab));
  }, [activeTab, apiProducts]);

  return (
    <section className="wb-section" id="bestsellers-section">
      <div className="wb-container">

        {/* Header */}
        <div className="wb-header">
          <div className="wb-header__titles">
            <h2 className="wb-title">Bestsellers</h2>
            <p className="wb-subtitle">Products that customers choose most often</p>
          </div>

          {/* Dynamic Filter Tabs */}
          <div className="wb-tabs">
            {dynamicTabs.map(tab => (
              <button
                key={tab}
                className={`wb-tab${activeTab === tab ? ' wb-tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="wb-grid">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="wb-skeleton-card">
                <div className="wb-skeleton-img" />
                <div className="wb-skeleton-line wb-skeleton-title" />
                <div className="wb-skeleton-line wb-skeleton-cat" />
                <div className="wb-skeleton-line wb-skeleton-price" />
              </div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onQuickView={(p) => setQuickViewProduct(p)} />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#777' }}>
              No bestsellers found for "{activeTab}".
            </div>
          )}
        </div>

        {quickViewProduct && (
          <ProductDetailModal
            product={quickViewProduct}
            allProducts={apiProducts}
            onClose={() => setQuickViewProduct(null)}
          />
        )}

      </div>
    </section>
  );
}
