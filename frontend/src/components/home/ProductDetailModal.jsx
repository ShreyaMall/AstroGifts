import React, { useState, useEffect } from 'react';
import './ProductDetailModal.css';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getColorName, getHexColor } from '../../utils/colorUtils';

export default function ProductDetailModal({ product, allProducts = [], onClose, onSelectProduct }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const mainImage = product?.img || product?.image || product?.image_url || '';
  const [activeImage, setActiveImage] = useState(mainImage);

  // Reset states when the product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedColor(null);
      setActiveImage(product.img || product.image || product.image_url || '');
    }
  }, [product]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!product) return null;

  const wishlisted = isInWishlist(product.id);

  // Find related products: same category first, excluding current product
  const renderTrustBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'warranty': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>;
      case 'truck': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>;
      case 'lock': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
      case 'star': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
      case 'shield': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
      case 'return':
      default:
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>;
    }
  };

  const modalBadges = Array.isArray(product.trust_badges) && product.trust_badges.length > 0
    ? product.trust_badges
    : [
        { title: 'Free Delivery', description: 'On orders above ₹12,500', icon: 'truck' },
        { title: '30-Day Returns', description: 'Hassle-free guarantee', icon: 'return' },
        { title: '2-Year Warranty', description: 'Certified AstroGifts quality', icon: 'warranty' }
      ];

  const handleAddToCart = () => {
    const activeColor = selectedColor || product.color || (product.colors && product.colors.length > 0 ? product.colors[0] : null);
    addToCart(activeColor ? { ...product, color: activeColor } : product, quantity);
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleRelatedClick = (relProduct) => {
    if (onSelectProduct) {
      onSelectProduct(relProduct);
    }
    // Scroll modal top smoothly
    const modalBody = document.querySelector('.pdm-scroll-wrap');
    if (modalBody) {
      modalBody.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="pdm-backdrop" onClick={onClose}>
      <div className="pdm-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="pdm-modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #ebe8e2', background: '#faf9f7', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1c1c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e07b39" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View Details
          </h3>
          <button className="pdm-close-btn" onClick={onClose} aria-label="Close modal" style={{ position: 'static', top: 'auto', right: 'auto' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="pdm-scroll-wrap">
          {/* Top Breadcrumb */}
          <div className="pdm-breadcrumb">
            <span>Home</span>
            <span className="pdm-sep">/</span>
            <span>{product.category}</span>
            <span className="pdm-sep">/</span>
            <span className="pdm-breadcrumb-current">{product.name}</span>
          </div>

          {/* Main Product Details Section */}
          <div className="pdm-main-grid">
            {/* Left Column: Image Preview */}
            <div className="pdm-gallery">
              <div className="pdm-main-img-wrap">
                {product.badge && (
                  <span className={`pdm-badge ${product.badge.startsWith('-') ? 'pdm-badge--sale' : 'pdm-badge--new'}`}>
                    {product.badge}
                  </span>
                )}
                <button
                  className={`pdm-wish-btn ${wishlisted ? 'pdm-wish-btn--active' : ''}`}
                  onClick={() => toggleWishlist(product)}
                  aria-label="Wishlist"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "#e07b39" : "none"} stroke={wishlisted ? "#e07b39" : "currentColor"} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <img src={activeImage || mainImage} alt={product.name} className="pdm-main-img" />
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="pdm-thumbs">
                  {product.images.map((imgUrl, i) => (
                    <button
                      key={i}
                      className={`pdm-thumb ${activeImage === imgUrl ? 'pdm-thumb--active' : ''}`}
                      onClick={() => setActiveImage(imgUrl)}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${i+1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Information & Controls */}
            <div className="pdm-info">
              <div className="pdm-cat-tag">{product.category}</div>
              <h1 className="pdm-title">{product.name}</h1>

              {/* Rating */}
              <div className="pdm-rating-row">
                <div className="pdm-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={i < Math.floor(product.rating || 4.5) ? "#f5a623" : "#e0e0e0"} stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <span className="pdm-rating-val">{product.rating ? `${product.rating} / 5.0` : '4.8 / 5.0'}</span>
                <span className="pdm-review-count">(18 customer reviews)</span>
              </div>

              {/* Price */}
              <div className="pdm-price-row">
                {product.originalPrice && (
                  <span className="pdm-old-price">₹{product.originalPrice.toFixed(2)}</span>
                )}
                <span className="pdm-price">₹{product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="pdm-save-badge">
                    Save ₹{(product.originalPrice - product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="pdm-desc">
                Crafted from premium sustainable materials, this {product.category.toLowerCase().slice(0, -1) || 'piece'} seamlessly blends Scandinavian aesthetics with exceptional ergonomic comfort. Designed to elevate any modern living space.
              </p>

              {/* Color Selection / Display */}
              {(product.colors && product.colors.length > 0) ? (
                <div style={{ margin: '12px 0' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#111', display: 'block', marginBottom: '8px' }}>
                    Color: <span style={{ fontWeight: '500', color: '#444' }}>{getColorName(selectedColor || product.colors[0])}</span>
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {product.colors.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        title={getColorName(c)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: (selectedColor || product.colors[0]) === c ? '2px solid #111' : '1px solid #ccc',
                          background: getHexColor(c),
                          cursor: 'pointer',
                          padding: '2px',
                          backgroundClip: 'content-box'
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : product.color ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>Color:</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f5f5f5', padding: '4px 12px', borderRadius: '16px', border: '1px solid #e0e0e0' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: getHexColor(product.color), border: '1px solid #ccc', display: 'inline-block' }} />
                    <span style={{ fontSize: '13px', color: '#333', fontWeight: '600' }}>
                      {getColorName(product.color)}
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Quantity and Actions */}
              <div className="pdm-actions-row">
                <div className="pdm-qty-picker">
                  <button
                    className="pdm-qty-btn"
                    onClick={() => handleQuantityChange(-1)}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="pdm-qty-val">{quantity}</span>
                  <button
                    className="pdm-qty-btn"
                    onClick={() => handleQuantityChange(1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button className="pdm-add-cart-btn" onClick={handleAddToCart}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Add to cart
                </button>

                <button
                  className={`pdm-wishlist-toggle ${wishlisted ? 'pdm-wishlist-toggle--active' : ''}`}
                  onClick={() => toggleWishlist(product)}
                  title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "#e07b39" : "none"} stroke={wishlisted ? "#e07b39" : "currentColor"} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>

              {/* Meta information */}
              <div className="pdm-meta-list">
                <div className="pdm-meta-item">
                  <span className="pdm-meta-title">SKU:</span>
                  <span className="pdm-meta-value">WM-{product.id < 10 ? `0${product.id}` : product.id}</span>
                </div>
                <div className="pdm-meta-item">
                  <span className="pdm-meta-title">Category:</span>
                  <span className="pdm-meta-value">{product.category}</span>
                </div>
                <div className="pdm-meta-item">
                  <span className="pdm-meta-title">Availability:</span>
                  <span className="pdm-meta-value pdm-in-stock" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> In Stock (Ready to dispatch)
                  </span>
                </div>
              </div>

              {/* Highlights/Trust badges */}
              <div className="pdm-trust-badges">
                {modalBadges.map((badge, idx) => (
                  <div key={idx} className="pdm-trust-item">
                    <span className="pdm-trust-icon">{renderTrustBadgeIcon(badge.icon)}</span>
                    <div>
                      <strong>{badge.title}</strong>
                      <p>{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
