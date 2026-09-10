import React, { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import './CartNotification.css';

export default function CartNotification() {
  const { notification, closeNotification, openCart, cartCount, cartTotal } = useCart();

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      closeNotification();
    }, 4000);

    return () => clearTimeout(timer);
  }, [notification, closeNotification]);

  if (!notification) return null;

  const { product, quantity } = notification;

  return (
    <div className="cart-toast" role="alert" aria-live="assertive">
      <div className="cart-toast__inner">

        {/* Top Header */}
        <div className="cart-toast__header">
          <div className="cart-toast__title-wrap">
            <span className="cart-toast__check-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="cart-toast__title">Added to cart successfully!</span>
          </div>
          <button
            className="cart-toast__close"
            onClick={closeNotification}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>

        {/* Product Details */}
        <div className="cart-toast__body">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="cart-toast__img"
            />
          )}
          <div className="cart-toast__details">
            <h4 className="cart-toast__prod-name">{product.name}</h4>
            <div className="cart-toast__prod-price">
              <span>Qty: {quantity}</span>
              <span className="cart-toast__dot">•</span>
              <span className="cart-toast__price-val">₹{(product.price * quantity).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Summary Info */}
        <div className="cart-toast__summary">
          <span>Cart Total ({cartCount} {cartCount === 1 ? 'item' : 'items'}):</span>
          <strong>₹{cartTotal.toFixed(2)}</strong>
        </div>

        {/* Action Buttons */}
        <div className="cart-toast__actions">
          <button
            className="cart-toast__btn cart-toast__btn--view"
            onClick={() => {
              closeNotification();
              openCart();
            }}
          >
            View Cart
          </button>
          <button
            className="cart-toast__btn cart-toast__btn--continue"
            onClick={closeNotification}
          >
            Continue Shopping
          </button>
        </div>

        {/* Animated Progress Bar */}
        <div className="cart-toast__progress">
          <div className="cart-toast__progress-bar" />
        </div>

      </div>
    </div>
  );
}
