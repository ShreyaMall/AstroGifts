import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './WeeklyBestsellers.css';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ALL_PRODUCTS } from '../data/categoryData';

const PRODUCTS = ALL_PRODUCTS.map(p => ({
  ...p,
  img: p.image || p.img,
  originalPrice: p.oldPrice,
  featured: p.rating >= 4.5 || p.badge === 'HOT' || p.badge === 'NEW'
}));

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

export default function WeeklyBestsellers() {
  const [activeTab, setActiveTab] = useState('All');
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  let filtered = [];
  if (activeTab === 'All') {
    const chairs = PRODUCTS.filter(p => p.featured && p.category === 'Chairs').slice(0, 2);
    const sofas = PRODUCTS.filter(p => p.featured && p.category === 'Sofas').slice(0, 2);
    const armchairs = PRODUCTS.filter(p => p.featured && p.category === 'Armchairs').slice(0, 2);
    const tables = PRODUCTS.filter(p => p.featured && p.category === 'Tables').slice(0, 2);
    filtered = [...chairs, ...sofas, ...armchairs, ...tables];
    if (filtered.length < 8) {
       const others = PRODUCTS.filter(p => p.featured && !filtered.includes(p));
       filtered = [...filtered, ...others].slice(0, 8);
    }
  } else {
    filtered = PRODUCTS.filter(p => p.category === activeTab);
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
          {filtered.map(product => {
            const wishlisted = isInWishlist(product.id);
            const slug = product.slug || String(product.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const productUrl = `/product/${slug}`;
            const categoryUrl = `/category/${product.category.toLowerCase()}`;

            return (
              <div key={product.id} className="wb-card">
                
                {/* Image Wrap linking to Product Page */}
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

                {/* Details */}
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

                  <div className="wb-card__price-row">
                    {product.originalPrice && (
                      <span className="wb-card__old-price">₹{product.originalPrice.toFixed(2)}</span>
                    )}
                    <span className="wb-card__price">₹{product.price.toFixed(2)}</span>
                  </div>


                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
