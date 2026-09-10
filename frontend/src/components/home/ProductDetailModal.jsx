import React, { useState, useEffect } from 'react';
import './ProductDetailModal.css';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductDetailModal({ product, allProducts = [], onClose, onSelectProduct }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product?.colors && product.colors.length > 0 ? product.colors[0] : null
  );
  const [activeImage, setActiveImage] = useState(product?.img);

  // Reset states when the product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : null);
      setActiveImage(product.img);
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
  let related = allProducts.filter(p => p.category === product.category && p.id !== product.id);
  if (related.length < 4) {
    const otherProducts = allProducts.filter(p => p.id !== product.id && p.category !== product.category);
    related = [...related, ...otherProducts].slice(0, 4);
  } else {
    related = related.slice(0, 4);
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
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
        {/* Close Button */}
        <button className="pdm-close-btn" onClick={onClose} aria-label="Close modal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

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
                <img src={activeImage || product.img} alt={product.name} className="pdm-main-img" />
              </div>

              {/* Thumbnails */}
              <div className="pdm-thumbs">
                <button
                  className={`pdm-thumb ${activeImage === product.img ? 'pdm-thumb--active' : ''}`}
                  onClick={() => setActiveImage(product.img)}
                >
                  <img src={product.img} alt="Thumbnail 1" />
                </button>
                {related.length > 0 && related[0].img && (
                  <button
                    className={`pdm-thumb ${activeImage === related[0].img ? 'pdm-thumb--active' : ''}`}
                    onClick={() => setActiveImage(related[0].img)}
                  >
                    <img src={related[0].img} alt="Thumbnail 2" />
                  </button>
                )}
              </div>
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
                  <span className="pdm-meta-value pdm-in-stock">✓ In Stock (Ready to dispatch)</span>
                </div>
              </div>

              {/* Highlights/Trust badges */}
              <div className="pdm-trust-badges">
                <div className="pdm-trust-item">
                  <span className="pdm-trust-icon">🚚</span>
                  <div>
                    <strong>Free Delivery</strong>
                    <p>On orders above ₹12,500</p>
                  </div>
                </div>
                <div className="pdm-trust-item">
                  <span className="pdm-trust-icon">🔄</span>
                  <div>
                    <strong>30-Day Returns</strong>
                    <p>Hassle-free guarantee</p>
                  </div>
                </div>
                <div className="pdm-trust-item">
                  <span className="pdm-trust-icon">🛡️</span>
                  <div>
                    <strong>2-Year Warranty</strong>
                    <p>Certified Homewood Decor build</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Related Products */}
          {related.length > 0 && (
            <div className="pdm-related-section">
              <div className="pdm-related-header">
                <div>
                  <h3 className="pdm-related-title">Related Products</h3>
                  <p className="pdm-related-subtitle">You may also love these matching {product.category.toLowerCase()}</p>
                </div>
              </div>

              <div className="pdm-related-grid">
                {related.map((rel) => {
                  const relWishlisted = isInWishlist(rel.id);
                  return (
                    <div
                      key={rel.id}
                      className="pdm-rel-card"
                      onClick={() => handleRelatedClick(rel)}
                    >
                      <div className="pdm-rel-img-wrap">
                        {rel.badge && (
                          <span className={`pdm-badge ${rel.badge.startsWith('-') ? 'pdm-badge--sale' : 'pdm-badge--new'}`}>
                            {rel.badge}
                          </span>
                        )}
                        <button
                          className={`pdm-rel-wish ${relWishlisted ? 'pdm-rel-wish--active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(rel);
                          }}
                          aria-label="Wishlist"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={relWishlisted ? "#e07b39" : "none"} stroke={relWishlisted ? "#e07b39" : "currentColor"} strokeWidth="1.8">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </button>
                        <img src={rel.img} alt={rel.name} className="pdm-rel-img" />
                      </div>

                      <div className="pdm-rel-info">
                        <span className="pdm-rel-cat">{rel.category}</span>
                        <h4 className="pdm-rel-name">{rel.name}</h4>
                        <div className="pdm-rel-price-row">
                          {rel.originalPrice && (
                            <span className="pdm-rel-old-price">₹{rel.originalPrice.toFixed(2)}</span>
                          )}
                          <span className="pdm-rel-price">₹{rel.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
