import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const HeartIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? '#e07b39' : 'none'} stroke={filled ? '#e07b39' : 'currentColor'} strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export const ProductCard = ({ product, viewMode = 'grid-3' }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const wishlisted = isInWishlist(product.id);
  const isList = viewMode === 'list';

  let badgeClass = '';
  if (product.badge === 'NEW') badgeClass = 'cp-card__badge cp-card__badge--new';
  else if (product.badge === 'HOT') badgeClass = 'cp-card__badge cp-card__badge--hot';
  else if (product.badge) badgeClass = 'cp-card__badge cp-card__badge--sale';

  const slug = product.slug || String(product.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const handleCardClick = () => navigate(`/product/${slug}`);
  const discount = product.old_price && product.old_price > product.price ? Math.round(product.old_price - product.price) : 0;

  return (
    <div
      className={`cp-card${isList ? ' cp-card--list' : ''}${hovered ? ' cp-card--hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <div className="cp-card__img-wrap">
        {product.badge && <span className={badgeClass}>{product.badge}</span>}
        <button className={`cp-card__wish${wishlisted ? ' cp-card__wish--active' : ''}`} onClick={e => { e.stopPropagation(); toggleWishlist(product); }} aria-label="Add to wishlist">
          <HeartIcon filled={wishlisted} />
        </button>
        <Link to={`/product/${slug}`} className="cp-card__img-link">
          <img 
            src={(() => {
              const raw = product.image || product.image_url || product.img;
              if (!raw || typeof raw !== 'string' || !raw.trim()) return '/chair1.jpg';
              const t = raw.trim();
              if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')) return t;
              if (t.startsWith('storage/') || t.startsWith('/storage/')) return `http://127.0.0.1:8000/${t.replace(/^\//, '')}`;
              if (t.startsWith('/')) return t;
              return `/${t}`;
            })()} 
            alt={product.name} 
            className="cp-card__img" 
            loading="lazy" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/chair1.jpg';
            }}
          />
        </Link>
        {!isList && (
          <div className="cp-card__hover-actions cp-card__hover-actions--desktop">
            <button className="cp-card__hover-btn cp-card__hover-btn--cart" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M20 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </button>
            <button className="cp-card__hover-btn cp-card__hover-btn--view" onClick={handleCardClick} aria-label="View product">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        )}
        {!isList && (
          <button className="cp-card__mobile-add" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>ADD</button>
        )}
      </div>

      <div className="cp-card__info" onClick={handleCardClick}>
        <div className="cp-card__mobile-price">
          <div className="cp-card__mobile-price-row">
            <span className="cp-card__mobile-price-new">&#8377;{product.price.toFixed(0)}</span>
            {product.old_price && <span className="cp-card__mobile-price-old">&#8377;{product.old_price.toFixed(0)}</span>}
          </div>
          {discount > 0 && <div className="cp-card__mobile-off">&#8377;{discount} OFF</div>}
        </div>

        <h3 className="cp-card__title">
          <Link to={`/product/${slug}`}>{product.name}</Link>
        </h3>

        <div className="cp-card__mobile-meta">
          <span className="cp-card__mobile-unit">1 pc</span>
          {product.rating > 0 && (
            <span className="cp-card__mobile-rating">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#39b54a"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {product.rating.toFixed(1)} ({product.reviews_count || 46})
            </span>
          )}
        </div>

        {product.rating > 0 && (
          <div className="cp-card__rating cp-card__rating--desktop">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < Math.floor(product.rating) ? '#f5a623' : '#e0e0e0'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ))}
          </div>
        )}

        {isList && (
          <div className="cp-card__meta-tags">
            {product.brand && <span className="cp-card__meta-tag">Brand: <strong>{product.brand}</strong></span>}
            {product.material && <span className="cp-card__meta-tag">Material: <strong>{product.material}</strong></span>}
            <span className="cp-card__meta-tag cp-card__meta-tag--stock">&#9679; In Stock</span>
          </div>
        )}

        {!isList && (
          <div className="cp-card__price-row cp-card__price-row--desktop">
            {product.old_price && <span className="cp-card__old-price">&#8377;{product.old_price.toFixed(2)}</span>}
            <span className="cp-card__price">&#8377;{product.price.toFixed(2)}</span>
          </div>
        )}
      </div>

      {isList && (
        <div className="cp-card__list-right">
          <div className="cp-card__price-row">
            {product.old_price && <span className="cp-card__old-price">&#8377;{product.old_price.toFixed(2)}</span>}
            <span className="cp-card__price">&#8377;{product.price.toFixed(2)}</span>
          </div>
          <button className="cp-card__list-cart-btn" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>Add to cart</button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
