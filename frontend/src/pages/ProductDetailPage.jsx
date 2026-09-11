import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductDetailPage.css';


import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { productsApi, addressesApi } from '../services/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, cartItems, updateQuantity, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Delivery & Pincode State
  const [pincode, setPincode] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tempPincode, setTempPincode] = useState('');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('Sunday, 13 Sep');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    name: '', phone: '', pincode: '', locality: '', address_line: '', city: '', state: ''
  });

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

  const handlePincodeSubmit = (codeToSubmit, addressToSubmit = null) => {
    const code = typeof codeToSubmit === 'string' ? codeToSubmit : tempPincode;
    if (code.length === 6) {
      setPincode(code);
      setTempPincode(code);
      if (addressToSubmit) {
        setDeliveryAddress(addressToSubmit);
      } else {
        setDeliveryAddress('');
      }
      setIsEditingLocation(false);
      // Simulate backend logic for delivery date based on pincode
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + 3 + (parseInt(code[0], 10) || 0) % 3);
      setDeliveryDate(baseDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }));
    } else {
      alert("Please enter a valid 6-digit pincode.");
    }
  };

  const handleCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use OpenStreetMap Nominatim for free reverse geocoding
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await res.json();
            setIsLocating(false);
            if (data && data.address) {
              const pin = data.address.postcode || '';
              const fullAddress = data.display_name;
              handlePincodeSubmit(pin, `Current Location: ${fullAddress}`);
            } else {
              alert("Could not determine address from your location.");
            }
          } catch (err) {
            setIsLocating(false);
            alert("Error fetching address data.");
          }
        },
        (error) => {
          setIsLocating(false);
          alert("Location access denied or unavailable. Please enable location permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    try {
      await addressesApi.addAddress(newAddressForm);
      const updated = await addressesApi.getUserAddresses();
      setSavedAddresses(Array.isArray(updated) ? updated : []);
      setIsAddingNewAddress(false);
      
      const newAddrStr = `${newAddressForm.name}, ${newAddressForm.address_line}, ${newAddressForm.city}`;
      handlePincodeSubmit(newAddressForm.pincode, newAddrStr);
      
      setNewAddressForm({name: '', phone: '', pincode: '', locality: '', address_line: '', city: '', state: ''});
    } catch (err) {
      console.error(err);
      alert("Failed to save address. " + (err.data?.message || err.message || "Check fields."));
    }
  };

  useEffect(() => {
    if (isEditingLocation && user) {
      addressesApi.getUserAddresses()
        .then(data => {
          if (Array.isArray(data)) {
            setSavedAddresses(data);
          }
        })
        .catch(err => console.error("Failed to load addresses", err));
    }
  }, [isEditingLocation, user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);

    // Backend API lookup
    productsApi.getById(id)
      .then(res => {
        if (res && res.data) {
          const fetchedProduct = res.data;
          setProduct(fetchedProduct);
          setActiveImage(fetchedProduct.image || fetchedProduct.img);
          setSelectedColor(fetchedProduct.colors?.[0] || null);
          setQuantity(1);

          // Fetch related products for the same category
          if (fetchedProduct.category) {
             productsApi.getAll({ category: fetchedProduct.category, per_page: 5 })
               .then(relatedRes => {
                  if (relatedRes && relatedRes.data) {
                     // Filter out the current product
                     setRelatedProducts(relatedRes.data.filter(p => String(p.id) !== String(fetchedProduct.id)).slice(0, 4));
                  }
               })
               .catch(err => console.error("Failed to load related products:", err));
          }
        }
      })
      .catch(err => {
        console.error("Failed to load product details:", err);
      })
      .finally(() => setLoading(false));
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
          <Link to={`/product/${product.id || String(product.name).toLowerCase().replace(/\s+/g, '-')}`} className="pdp-breadcrumb-current">{product.name}</Link>
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
                <span className="pdp-meta-value pdp-in-stock" style={{ color: '#39b54a', fontWeight: '600' }}>
                  ✓ {product.stock || Math.floor(Math.random() * 40 + 5)} {product.category || 'Items'} in Stock
                </span>
              </div>
            </div>

            {/* Delivery Details Block */}
            <div className="pdp-delivery-details">
              <h3 className="pdp-delivery-title">Delivery details</h3>
              <div className="pdp-delivery-box pdp-delivery-box--blue" style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => { setIsEditingLocation(true); setTempPincode(''); setIsAddingNewAddress(false); }}>
                <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pdp-delivery-icon" style={{ flexShrink: 0 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="pdp-delivery-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', color: '#1a1a1a', fontWeight: '500' }}>
                    {deliveryAddress ? deliveryAddress : (pincode ? `Delivering to ${pincode}` : <><span style={{fontWeight: '600'}}>Location not set</span> <span className="pdp-delivery-link" style={{marginLeft: '4px'}}>Select delivery location &gt;</span></>)}
                  </span>
                </div>
                {(deliveryAddress || pincode) && (
                   <span style={{ color: '#666', flexShrink: 0, marginLeft: '12px' }}>&gt;</span>
                )}
              </div>
              <div className="pdp-delivery-box pdp-delivery-box--grey">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pdp-delivery-icon">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span className="pdp-delivery-text">
                  Delivery by <span style={{color: '#1a1a1a', fontWeight: '700'}}>{deliveryDate}</span>
                </span>
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
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </span>
                <div>
                  <strong>10-Day Return</strong>
                  <span>Easy returns & refunds</span>
                </div>
              </div>
              <div className="pdp-trust-item">
                <span className="pdp-trust-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f59e53' }}>
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <circle cx="12" cy="12" r="2"></circle>
                    <path d="M6 12h.01M18 12h.01"></path>
                  </svg>
                </span>
                <div>
                  <strong>Cash on Delivery</strong>
                  <span>Available at checkout</span>
                </div>
              </div>
              <div className="pdp-trust-item">
                <span className="pdp-trust-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f59e53' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </span>
                <div>
                  <strong>Cancellation</strong>
                  <span>Allowed up to 6 hours</span>
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

      {/* Delivery Location Modal */}
      {isEditingLocation && (
        <div className="pdp-modal-overlay" onClick={() => setIsEditingLocation(false)}>
          <div className="pdp-modal-content" onClick={e => e.stopPropagation()}>
            <div className="pdp-modal-header">
              <h3>Select delivery address</h3>
              <button className="pdp-modal-close" onClick={() => setIsEditingLocation(false)}>✕</button>
            </div>
            
            <div className="pdp-modal-body">
              <div className="pdp-modal-search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search by area, street name, pin code" 
                  value={tempPincode}
                  onChange={e => setTempPincode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePincodeSubmit()}
                  autoFocus
                />
              </div>

              <button className="pdp-modal-current-loc" onClick={handleCurrentLocation} disabled={isLocating}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <strong>{isLocating ? 'Locating...' : 'Use my current location'}</strong>
                  <span>Allow access to location</span>
                </div>
              </button>

              <div className="pdp-modal-saved">
                <div className="pdp-modal-saved-header">
                  <h4>{isAddingNewAddress ? 'Add new address' : 'Saved addresses'}</h4>
                  <button className="pdp-modal-add-btn" onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}>
                    {isAddingNewAddress ? 'Cancel' : '+ Add New'}
                  </button>
                </div>
                
                {isAddingNewAddress ? (
                  <form onSubmit={handleAddNewAddress} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input type="text" placeholder="Full Name" required value={newAddressForm.name} onChange={e => setNewAddressForm({...newAddressForm, name: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none' }} />
                    <input type="text" placeholder="Phone Number" required value={newAddressForm.phone} onChange={e => setNewAddressForm({...newAddressForm, phone: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none' }} />
                    <input type="text" placeholder="Pincode" required maxLength="6" value={newAddressForm.pincode} onChange={e => setNewAddressForm({...newAddressForm, pincode: e.target.value.replace(/\D/g,'')})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none' }} />
                    <input type="text" placeholder="Address Line (House No, Building, Street)" required value={newAddressForm.address_line} onChange={e => setNewAddressForm({...newAddressForm, address_line: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none' }} />
                    <input type="text" placeholder="Locality / Area" value={newAddressForm.locality} onChange={e => setNewAddressForm({...newAddressForm, locality: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none' }} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" placeholder="City" required value={newAddressForm.city} onChange={e => setNewAddressForm({...newAddressForm, city: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 1, fontSize: '13px', outline: 'none' }} />
                      <input type="text" placeholder="State" required value={newAddressForm.state} onChange={e => setNewAddressForm({...newAddressForm, state: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 1, fontSize: '13px', outline: 'none' }} />
                    </div>
                    <button type="submit" style={{ padding: '10px', background: '#d96b27', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}>Save Address</button>
                  </form>
                ) : (
                  <div className="pdp-modal-address-list">
                    {savedAddresses.length > 0 ? (
                      savedAddresses.map(address => (
                        <div 
                          key={address.id} 
                          className="pdp-modal-address-item" 
                          onClick={() => handlePincodeSubmit(address.pincode, `${address.address_line}, ${address.locality ? address.locality + ', ' : ''}${address.city}, ${address.state}`)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          <div>
                            <strong>{address.name}</strong>
                            <p>{address.address_line}, {address.locality ? address.locality + ', ' : ''}{address.city}, {address.state}</p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div style={{ color: '#888', fontSize: '13px', padding: '10px 0' }}>No saved addresses found.</div>
                  )}
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
  );
}
