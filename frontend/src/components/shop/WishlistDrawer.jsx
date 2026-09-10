import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import './WishlistDrawer.css';

export default function WishlistDrawer() {
  const {
    isWishlistOpen,
    closeWishlist,
    wishlistItems,
    removeFromWishlist,
    clearWishlist,
    wishlistCount,
  } = useWishlist();

  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  return (
    <div className="wishlist-drawer-overlay" onClick={closeWishlist}>
      <div
        className="wishlist-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist"
      >
        {/* Header */}
        <div className="wishlist-drawer__header">
          <h3 className="wishlist-drawer__title">
            ♡ Wishlist ({wishlistCount})
          </h3>
          <button
            className="wishlist-drawer__close-btn"
            onClick={closeWishlist}
            aria-label="Close wishlist"
          >
            ✕
          </button>
        </div>

        {/* Wishlist Body */}
        <div className="wishlist-drawer__body">
          {wishlistItems.length === 0 ? (
            <div className="wishlist-drawer__empty">
              <div className="wishlist-drawer__empty-icon">♡</div>
              <p className="wishlist-drawer__empty-text">Your wishlist is currently empty.</p>
              <button className="wishlist-drawer__shop-btn" onClick={closeWishlist}>
                Explore Products
              </button>
            </div>
          ) : (
            <ul className="wishlist-drawer__list">
              {wishlistItems.map((item) => (
                <li key={item.id} className="wishlist-drawer__item">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="wishlist-drawer__item-img"
                    />
                  )}
                  <div className="wishlist-drawer__item-info">
                    <h4 className="wishlist-drawer__item-name">{item.name}</h4>
                    {item.category && (
                      <span className="wishlist-drawer__item-cat">{item.category}</span>
                    )}
                    <span className="wishlist-drawer__item-price">
                      ₹{item.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="wishlist-drawer__item-actions">
                    <button
                      className="wishlist-drawer__add-cart-btn"
                      onClick={() => {
                        addToCart(item);
                        removeFromWishlist(item.id);
                      }}
                      title="Move to Cart"
                    >
                      Add to Cart
                    </button>
                    <button
                      className="wishlist-drawer__remove-btn"
                      onClick={() => removeFromWishlist(item.id)}
                      title="Remove from wishlist"
                      aria-label="Remove item"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {wishlistItems.length > 0 && (
          <div className="wishlist-drawer__footer">
            <button
              className="wishlist-drawer__add-all-btn"
              onClick={() => {
                wishlistItems.forEach(item => addToCart(item));
                clearWishlist();
              }}
            >
              Move All To Cart
            </button>
            <button
              className="wishlist-drawer__clear-btn"
              onClick={clearWishlist}
            >
              Clear Wishlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
