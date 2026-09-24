import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './WeeklyBestsellers.css';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { productsApi, categoriesApi } from '../../services/api';
import ProductDetailModal from './ProductDetailModal';

import giftsImg from '../../assets/gifts.png';
import giftItemImg from '../../assets/gift image.jpg';
import astroImg from '../../assets/astro.png';
import flowersImg from '../../assets/flowers.png';
import crystalImg from '../../assets/Rose_Quartz.webp';

const ALLOWED_TABS = ['All', 'Gifts', 'Toys', 'Astrology', 'Flowers', 'Decor'];
const DEFAULT_TABS = ['All', 'Gifts', 'Toys', 'Astrology', 'Flowers', 'Decor'];

const STATIC_BESTSELLERS = [
  { id: 'b1', name: 'Luxury Birthday Gift Hamper', price: 1499, originalPrice: 1899, img: giftItemImg, category: 'Gifts', badge: 'BESTSELLER', featured: true, rating: 5.0 },
  { id: 'b2', name: 'Personalized Couple Anniversary Box', price: 1299, originalPrice: 1599, img: giftsImg, category: 'Gifts', badge: '-20%', featured: true, rating: 4.9 },
  { id: 'b3', name: 'Cute Giant Teddy Bear (Soft Toy)', price: 899, originalPrice: 1199, img: '/toy1.jpg', category: 'Toys', badge: 'HOT', featured: true, rating: 4.8 },
  { id: 'b4', name: 'Wooden Heritage Train Set', price: 699, originalPrice: 899, img: '/toy2.jpg', category: 'Toys', badge: 'NEW', featured: true, rating: 5.0 },
  { id: 'b5', name: 'Natural Rose Quartz Healing Crystal', price: 799, originalPrice: 999, img: crystalImg, category: 'Astrology', badge: 'SACRED', featured: true, rating: 5.0 },
  { id: 'b6', name: 'Certified Yellow Sapphire Gemstone Ring', price: 2499, originalPrice: 2999, img: astroImg, category: 'Astrology', badge: 'CERTIFIED', featured: true, rating: 4.9 },
  { id: 'b7', name: 'Fresh Red Roses Premium Bouquet', price: 599, originalPrice: 799, img: flowersImg, category: 'Flowers', badge: 'FRESH', featured: true, rating: 5.0 },
  { id: 'b8', name: 'Terracotta Minimalist Vase', price: 499, originalPrice: 649, img: '/decor1.jpg', category: 'Decor', badge: 'HOT', featured: true, rating: 5.0 },
];

function Stars({ rating }) {
  if (!rating) return null;
  return (
    <span className="wb-stars">
      <span className="wb-stars__val">{rating}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5a623" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
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
  const categoryUrl = `/category/${product.category.toLowerCase()}`;

  const activeColor = selectedColor || product.color || (product.colors && product.colors.length > 0 ? product.colors[0] : null);

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
          <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlisted ? "#e07b39" : "none"} stroke={wishlisted ? "#e07b39" : "currentColor"} strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        <Link to={productUrl}>
          <img
            src={product.img || giftItemImg}
            alt={product.name}
            className="wb-card__img wb-card__img--main"
            onError={(e) => {
              e.target.onerror = null;
              const staticMatch = STATIC_BESTSELLERS.find(s => s.name.toLowerCase() === (product.name || '').toLowerCase());
              e.target.src = staticMatch?.img || giftItemImg;
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
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
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
                style={{ backgroundColor: color }}
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
  const [apiProducts, setApiProducts] = useState(STATIC_BESTSELLERS); // Default to AstroGifts items
  const [dynamicTabs, setDynamicTabs] = useState(ALLOWED_TABS);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    categoriesApi.getAll().then(res => {
      if (res?.data && res.data.length > 0) {
        const activeCategoryNames = res.data.map(c => c.name);
        const filteredTabs = ALLOWED_TABS.filter(tab => tab === 'All' || activeCategoryNames.some(ac => ac.toLowerCase() === tab.toLowerCase()));
        if (filteredTabs.length > 1) {
          setDynamicTabs(filteredTabs);
        }
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Step 3: React Frontend mein API Call
        const response = await productsApi.getBestsellers();
        
        if (response.status === 'success' && Array.isArray(response.data) && response.data.length > 0) {
          // Backend se aaye data ko format karna taaki ProductCard use samajh sake
          const formattedProducts = response.data.map(p => {
            const staticMatch = STATIC_BESTSELLERS.find(s => String(s.id) === String(p.id) || s.name.toLowerCase() === (p.name || '').toLowerCase());
            
            const rawImg = p.image || p.image_url || p.img;
            let finalImg = staticMatch?.img || giftItemImg;

            if (rawImg && typeof rawImg === 'string' && rawImg.trim()) {
              const trimmed = rawImg.trim();
              if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
                finalImg = trimmed;
              } else if (trimmed.startsWith('storage/') || trimmed.startsWith('/storage/')) {
                finalImg = `http://127.0.0.1:8000/${trimmed.replace(/^\//, '')}`;
              } else if (trimmed.startsWith('/')) {
                finalImg = trimmed;
              } else {
                finalImg = `/${trimmed}`;
              }
            }

            return {
              ...p,
              id: p.id,
              name: p.name,
              price: Number(p.price) || 0,
              originalPrice: p.old_price ? Number(p.old_price) : null,
              img: finalImg, 
              category: p.category_name || p.category || 'Gifts',
              badge: p.badge || (p.is_new ? 'NEW' : (p.discount_percentage ? `-${p.discount_percentage}%` : null)),
              featured: true,
              rating: p.rating || 5
            };
          });
          setApiProducts(formattedProducts);
        }
      } catch (error) {
        console.error("Backend server running nahi hai, static data dikha rahe hain.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  let filtered = [];
  if (activeTab === 'All') {
    let allFiltered = [];
    for (const tab of dynamicTabs) {
      if (tab === 'All') continue;
      const tabProducts = apiProducts.filter(p => p.featured && (p.category === tab || p.category_name === tab)).slice(0, 2);
      allFiltered = [...allFiltered, ...tabProducts];
    }
    filtered = allFiltered;
    if (filtered.length < 8) {
       const others = apiProducts.filter(p => p.featured && !filtered.includes(p));
       filtered = [...filtered, ...others].slice(0, 8);
    }
  } else {
    filtered = apiProducts.filter(p => p.category === activeTab || p.category_name === activeTab);
  }

  return (
    <section className="wb-section" id="bestsellers-section">
      <div className="wb-container">
        
        {/* Header */}
        <div className="wb-header">
          <div className="wb-header__titles">
            <h2 className="wb-title">Bestsellers</h2>
            <p className="wb-subtitle">Products that customers choose most often</p>
          </div>

          {/* Filter Tabs */}
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
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} onQuickView={(p) => setQuickViewProduct(p)} />
          ))}
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
