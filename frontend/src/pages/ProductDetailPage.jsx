import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductDetailPage.css';


import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { findProductByIdOrSlug, ALL_PRODUCTS } from '../data/categoryData';
import { productsApi } from '../services/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, cartItems, updateQuantity, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');

  const cartItem = product ? cartItems.find(i => i.id === (product.id || String(product.name).toLowerCase().replace(/\s+/g, '-'))) : null;
  const displayQuantity = cartItem ? cartItem.quantity : quantity;

  const handleDecrease = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, -1);
    } else {
      setQuantity(q => Math.max(1, q - 1));
    }
  };

  const handleIncrease = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, 1);
    } else {
      setQuantity(q => q + 1);
    }
  };

  const handleAddToCart = () => {
    if (cartItem) {
      openCart();
    } else {
      addToCart(product, parseInt(quantity, 10));
      setQuantity(1);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);

    // First try to look up in local rich dataset
    const localFound = findProductByIdOrSlug(id);

    if (localFound) {
      setProduct(localFound);
      setActiveImage(localFound.image || localFound.img);
      setSelectedColor(localFound.colors && localFound.colors.length > 0 ? localFound.colors[0] : null);
      setQuantity(1);
      setLoading(false);
    } else {
      // Try backend API lookup
      productsApi.getById(id)
        .then(res => {
          if (res && res.data) {
            setProduct(res.data);
            setActiveImage(res.data.image || res.data.img);
            setSelectedColor(res.data.colors?.[0] || null);
          } else if (ALL_PRODUCTS.length > 0) {
            setProduct(ALL_PRODUCTS[0]);
            setActiveImage(ALL_PRODUCTS[0].image || ALL_PRODUCTS[0].img);
          }
        })
        .catch(() => {
          if (ALL_PRODUCTS.length > 0) {
            setProduct(ALL_PRODUCTS[0]);
            setActiveImage(ALL_PRODUCTS[0].image || ALL_PRODUCTS[0].img);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="pdp-page">
      <Header />
        <div className="pdp-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading product details...</div>
        </div>
        </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp-page">
        <Header />
        <div className="pdp-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <h2>Product Not Found</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>The product you are looking for does not exist or has been removed.</p>
          <Link to="/" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 24px', background: '#d96b27', color: '#fff', borderRadius: '6px', textDecoration: 'none' }}>
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const relatedProducts = ALL_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="pdp-page">
      <Header />
      <div className="pdp-container">
        {/* Breadcrumb */}
        <div className="pdp-breadcrumb">
          <Link to="/">Home</Link>
          <span className="pdp-sep">/</span>
          <Link to={`/category/${product.category?.toLowerCase() || 'chairs'}`}>{product.category || 'Category'}</Link>
          <span className="pdp-sep">/</span>
          <span className="pdp-breadcrumb-current">{product.name}</span>
        </div>

        {/* Main Product Grid */}
        <div className="pdp-main-grid">
          {/* Gallery */}
          <div className="pdp-gallery">
            <div className="pdp-main-img-wrap">
              {product.badge && (
                <span className={`pdp-badge ${product.badge.startsWith('-') ? 'pdp-badge--sale' : 'pdp-badge--new'}`}>
                  {product.badge}
                </span>
              )}

              <button
                className={`pdp-wish-btn ${wishlisted ? 'pdp-wish-btn--active' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "#e07b39" : "none"} stroke={wishlisted ? "#e07b39" : "currentColor"} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>

              <img src={activeImage || product.image || product.img} alt={product.name} className="pdp-main-img" />
            </div>

            {/* Thumbs */}
            <div className="pdp-thumbs">
              <button
                className={`pdp-thumb ${activeImage === (product.image || product.img) ? 'pdp-thumb--active' : ''}`}
                onClick={() => setActiveImage(product.image || product.img)}
              >
                <img src={product.image || product.img} alt={product.name} />
              </button>
              {relatedProducts[0] && (
                <button
                  className={`pdp-thumb ${activeImage === (relatedProducts[0].image || relatedProducts[0].img) ? 'pdp-thumb--active' : ''}`}
                  onClick={() => setActiveImage(relatedProducts[0].image || relatedProducts[0].img)}
                >
                  <img src={relatedProducts[0].image || relatedProducts[0].img} alt="Alternate view" />
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="pdp-info">
            <div className="pdp-cat-tag">{product.category}</div>
            <h1 className="pdp-title">{product.name}</h1>

            {/* Rating */}
            <div className="pdp-rating-row">
              <div className="pdp-stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < Math.floor(product.rating || 4.5) ? "#f5a623" : "#e0e0e0"} stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <span className="pdp-rating-val">{product.rating ? `${product.rating} / 5.0` : '4.8 / 5.0'}</span>
              <span className="pdp-review-count">(24 customer reviews)</span>
            </div>

            {/* Price */}
            <div className="pdp-price-row">
              {product.oldPrice && (
                <span className="pdp-old-price">₹{product.oldPrice.toFixed(2)}</span>
              )}
              <span className="pdp-price">₹{product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="pdp-save-badge">
                  Save ₹{(product.oldPrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="pdp-desc">
              Designed with precision craftsmanship, this {product.category?.toLowerCase() || 'piece'} combines organic materials with enduring durability. Built to complement luxury modern interiors with timeless aesthetic appeal.
            </p>



            {/* Actions */}
              <div className="pdp-actions-row">
                <div className="pdp-qty-picker">
                  <button
                    type="button"
                    className="pdp-qty-btn"
                    onClick={handleDecrease}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="pdp-qty-val">{displayQuantity}</span>
                  <button
                    type="button"
                    className="pdp-qty-btn"
                    onClick={handleIncrease}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="pdp-add-cart-btn"
                  onClick={handleAddToCart}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  {cartItem ? 'View Cart' : 'Add to cart'}
                </button>

              <button
                className={`pdp-wishlist-toggle ${wishlisted ? 'pdp-wishlist-toggle--active' : ''}`}
                onClick={() => toggleWishlist(product)}
                title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "#e07b39" : "none"} stroke={wishlisted ? "#e07b39" : "currentColor"} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>

            {/* Meta */}
            <div className="pdp-meta-list">
              <div className="pdp-meta-item">
                <span className="pdp-meta-title">SKU:</span>
                <span className="pdp-meta-value">WM-{product.id}</span>
              </div>
              <div className="pdp-meta-item">
                <span className="pdp-meta-title">Category:</span>
                <span className="pdp-meta-value">{product.category}</span>
              </div>
              {product.brand && (
                <div className="pdp-meta-item">
                  <span className="pdp-meta-title">Brand:</span>
                  <span className="pdp-meta-value">{product.brand}</span>
                </div>
              )}
              {product.material && (
                <div className="pdp-meta-item">
                  <span className="pdp-meta-title">Material:</span>
                  <span className="pdp-meta-value">{product.material}</span>
                </div>
              )}
              <div className="pdp-meta-item">
                <span className="pdp-meta-title">Availability:</span>
                <span className="pdp-meta-value pdm-in-stock">✓ In Stock (Ready to dispatch)</span>
              </div>
            </div>

            {/* Badges */}
            <div className="pdp-trust-badges">
              <div className="pdp-trust-item">
                <span className="pdp-trust-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f59e53' }}>
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                </span>
                <div>
                  <strong>Free Express Delivery</strong>
                  <span>Orders over ₹1,000</span>
                </div>
              </div>
              <div className="pdp-trust-item">
                <span className="pdp-trust-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f59e53' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </span>
                <div>
                  <strong>5-Year Warranty</strong>
                  <span>100% genuine guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="pdp-tabs-wrap">
          <div className="pdp-tab-nav">
            <button
              className={`pdp-tab-btn ${activeTab === 'desc' ? 'pdp-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('desc')}
            >
              Description
            </button>
            <button
              className={`pdp-tab-btn ${activeTab === 'specs' ? 'pdp-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Additional Information
            </button>
            <button
              className={`pdp-tab-btn ${activeTab === 'reviews' ? 'pdp-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews (24)
            </button>
          </div>

          <div className="pdp-tab-content">
            {activeTab === 'desc' && (
              <div className="pdp-tab-pane">
                <p>
                  Experience the ultimate fusion of form and function. Designed with organic timber profiles, reinforced internal framing, and eco-certified finishes, this {product.name} provides superior structural stability and visual lightness.
                </p>
                <p style={{ marginTop: '12px' }}>
                  Every joinery intersection is precision-milled and hand-finished by master carpenters. Ideal for luxury residential, boutique hospitality, and modern office settings.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="pdp-tab-pane">
                <table className="pdp-specs-table">
                  <tbody>
                    <tr>
                      <td>Brand</td>
                      <td>{product.brand || 'Homewood Decor Studio'}</td>
                    </tr>
                    <tr>
                      <td>Material</td>
                      <td>{product.material || 'Solid Oak / Premium Fabric'}</td>
                    </tr>
                    <tr>
                      <td>Dimensions</td>
                      <td>85cm (H) x 62cm (W) x 58cm (D)</td>
                    </tr>
                    <tr>
                      <td>Weight</td>
                      <td>12.5 kg</td>
                    </tr>
                    <tr>
                      <td>Assembly Required</td>
                      <td>Minimal (tools included)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="pdp-tab-pane">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong>Rohit Sharma</strong>
                      <span style={{ color: '#888', fontSize: '12px' }}>2 days ago</span>
                    </div>
                    <div style={{ color: '#f5a623', marginBottom: '6px' }}>★★★★★</div>
                    <p>Exceptional quality and finishing! Looks even better in real life than the photos.</p>
                  </div>
                  <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong>Priya Verma</strong>
                      <span style={{ color: '#888', fontSize: '12px' }}>1 week ago</span>
                    </div>
                    <div style={{ color: '#f5a623', marginBottom: '6px' }}>★★★★★</div>
                    <p>Very comfortable and super sturdy. Fast shipping too!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pdp-related-section">
            <h2 className="pdp-related-title">Related Products</h2>
            <div className="pdp-related-grid">
              {relatedProducts.map(rel => (
                <Link
                  key={rel.id}
                  to={`/product/${rel.slug || String(rel.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="pdp-rel-card"
                >
                  <img src={rel.image || rel.img} alt={rel.name} className="pdp-rel-img" />
                  <span className="pdp-rel-cat">{rel.category}</span>
                  <h3 className="pdp-rel-name">{rel.name}</h3>
                  <span className="pdp-rel-price">₹{rel.price.toFixed(2)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      </div>
  );
}
