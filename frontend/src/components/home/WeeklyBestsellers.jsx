import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './WeeklyBestsellers.css';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { productsApi } from '../../services/api';

const TABS = ['All', 'Chairs', 'Sofas', 'Armchairs', 'Tables'];

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

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : null);

  const wishlisted = isInWishlist(product.id);
  const slug = product.slug || String(product.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const productUrl = `/product/${slug}`;
  const categoryUrl = `/category/${product.category.toLowerCase()}`;

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
            src={product.img}
            alt={product.name}
            className="wb-card__img wb-card__img--main"
          />
        </Link>

        <div className="wb-card__hover-actions">
          <button
            className="wb-card__add-cart-btn"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              addToCart(product);
            }}
          >
            Add to cart
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
                  setSelectedColor(color);
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
      </div>
    </div>
  );
}

export default function WeeklyBestsellers() {
  const [activeTab, setActiveTab] = useState('All');
  const [apiProducts, setApiProducts] = useState([]); // Dynamic data only
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Step 3: React Frontend mein API Call
        const response = await productsApi.getBestsellers();
        
        if (response.status === 'success' && response.data.length > 0) {
          // Backend se aaye data ko format karna taaki ProductCard use samajh sake
          const formattedProducts = response.data.map(p => ({
            ...p,
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.old_price,
            img: p.image_url || p.image, 
            category: p.category_name || 'All',
            // Yahan hum dynamic badge set kar rahe hain jo API se aayega
            badge: p.badge || (p.is_new ? 'NEW' : (p.discount_percentage ? `-${p.discount_percentage}%` : null)),
            featured: true,
            rating: p.rating || 5
          }));
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
    const chairs = apiProducts.filter(p => p.featured && p.category === 'Chairs').slice(0, 2);
    const sofas = apiProducts.filter(p => p.featured && p.category === 'Sofas').slice(0, 2);
    const armchairs = apiProducts.filter(p => p.featured && p.category === 'Armchairs').slice(0, 2);
    const tables = apiProducts.filter(p => p.featured && p.category === 'Tables').slice(0, 2);
    filtered = [...chairs, ...sofas, ...armchairs, ...tables];
    if (filtered.length < 8) {
       const others = apiProducts.filter(p => p.featured && !filtered.includes(p));
       filtered = [...filtered, ...others].slice(0, 8);
    }
  } else {
    filtered = apiProducts.filter(p => p.category === activeTab);
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
            {TABS.map(tab => (
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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
