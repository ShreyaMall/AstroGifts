import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './FloatingCartBar.css';

export default function FloatingCartBar() {
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [animatePulse, setAnimatePulse] = useState(false);
  const containerRef = useRef(null);

  // Trigger pulse animation when cart item count changes
  useEffect(() => {
    if (cartCount > 0) {
      setAnimatePulse(true);
      const timer = setTimeout(() => setAnimatePulse(false), 800);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [cartCount, cartTotal]);

  // Click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Do not show on checkout page or admin pages
  if (cartCount === 0 || location.pathname.startsWith('/checkout') || location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleCheckout = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    navigate('/checkout');
  };

  const togglePopup = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="floating-cart-container" ref={containerRef}>
      
      {/* ── Cart Popover Dropup ── */}
      {isOpen && (
        <div className="fcb-popover" role="dialog" aria-label="Cart Overview">
          {/* Header */}
          <div className="fcb-popover-header">
            <h3 className="fcb-popover-title">
              Your Cart <span>({cartCount})</span>
            </h3>
            <button 
              className="fcb-popover-close" 
              onClick={() => setIsOpen(false)}
              aria-label="Close cart popup"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Items List */}
          <div className="fcb-popover-body">
            {cartItems.map((item) => (
              <div className="fcb-item-row" key={item.id}>
                {/* Product Thumbnail */}
                <div className="fcb-item-img-wrap">
                  <img 
                    src={item.image || '/gift.png'} 
                    alt={item.name} 
                    className="fcb-item-img"
                    onError={(e) => { e.target.src = '/gift.png'; }}
                  />
                </div>

                {/* Product Details */}
                <div className="fcb-item-info">
                  <div className="fcb-item-name" title={item.name}>
                    {item.name}
                  </div>
                  <div className="fcb-item-meta">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                    {!item.size && !item.color && item.category && <span>{item.category}</span>}
                  </div>
                  <div className="fcb-item-price-qty">
                    <span className="fcb-item-price">
                      ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                    <span className="fcb-item-qty">x {item.quantity}</span>
                  </div>
                </div>

                {/* Delete Button */}
                <button 
                  className="fcb-item-delete"
                  onClick={() => removeFromCart(item.id)}
                  title="Remove item"
                  aria-label="Remove item"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Subtotal Footer */}
          <div className="fcb-popover-footer">
            <span className="fcb-subtotal-label">Subtotal</span>
            <span className="fcb-subtotal-val">
              ₹{Number(cartTotal).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* ── Main Dark Chocolate / Brown Floating Pill ── */}
      <div className={`floating-cart-bar ${animatePulse ? 'floating-cart-bar--pulse' : ''} ${isOpen ? 'floating-cart-bar--active' : ''}`}>
        
        {/* Left Side: Bag Icon + Count + Price + Toggle Arrow */}
        <div 
          className="fcb-left" 
          onClick={togglePopup}
          role="button"
          tabIndex={0}
          title="Click to view cart details"
        >
          <div className="fcb-bag-wrapper">
            <svg className="fcb-bag-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="currentColor" fillOpacity="0.15"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className="fcb-badge">{cartCount}</span>
          </div>
          
          <span className="fcb-total">
            ₹{Number(cartTotal).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>

          <span className={`fcb-toggle-arrow ${isOpen ? 'fcb-toggle-arrow--open' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="fcb-divider" />

        {/* Right Side: Checkout Button */}
        <button 
          className="fcb-checkout-btn" 
          onClick={handleCheckout}
          aria-label="Proceed to Checkout"
        >
          <span className="fcb-checkout-text">CHECKOUT</span>
          <span className="fcb-arrow-circle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#ffffff" />
              <path d="M10 8l4 4-4 4" stroke="#2c1510" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </span>
        </button>
      </div>

    </div>
  );
}
