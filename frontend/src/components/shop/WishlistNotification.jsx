import React, { useEffect } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import './WishlistNotification.css';

export default function WishlistNotification() {
  const { notification, closeNotification, openWishlist, wishlistCount } = useWishlist();

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      closeNotification();
    }, 4000);

    return () => clearTimeout(timer);
  }, [notification, closeNotification]);

  if (!notification) return null;

  const { product, action } = notification;
  const isAdded = action === 'added';

  return (
    <div className="wishlist-toast" role="alert" aria-live="assertive">
      <div className="wishlist-toast__inner">

        {/* Top Header */}
        <div className="wishlist-toast__header">
          <div className="wishlist-toast__title-wrap">
            <span className={`wishlist-toast__icon ${isAdded ? 'wishlist-toast__icon--add' : 'wishlist-toast__icon--remove'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isAdded ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </span>
            <span className="wishlist-toast__title">
              {isAdded ? 'Added to wishlist!' : 'Removed from wishlist'}
            </span>
          </div>
          <button
            className="wishlist-toast__close"
            onClick={closeNotification}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>

        {/* Product Details */}
        <div className="wishlist-toast__body">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="wishlist-toast__img"
            />
          )}
          <div className="wishlist-toast__details">
            <h4 className="wishlist-toast__prod-name">{product.name}</h4>
            <div className="wishlist-toast__prod-price">
              <span className="wishlist-toast__price-val">₹{product.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="wishlist-toast__actions">
          <button
            className="wishlist-toast__btn wishlist-toast__btn--view"
            onClick={() => {
              closeNotification();
              openWishlist();
            }}
          >
            View Wishlist ({wishlistCount})
          </button>
          <button
            className="wishlist-toast__btn wishlist-toast__btn--close"
            onClick={closeNotification}
          >
            Close
          </button>
        </div>

        {/* Animated Progress Bar */}
        <div className="wishlist-toast__progress">
          <div className={`wishlist-toast__progress-bar ${isAdded ? 'wishlist-toast__progress-bar--add' : 'wishlist-toast__progress-bar--remove'}`} />
        </div>

      </div>
    </div>
  );
}
