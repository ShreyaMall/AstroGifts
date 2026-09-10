import React from 'react';
import { useCart } from '../../context/CartContext';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    openCheckout,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={closeCart}>
      <div
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        {/* Header */}
        <div className="cart-drawer__header">
          <h3 className="cart-drawer__title">
            Shopping Cart ({cartCount})
          </h3>
          <button
            className="cart-drawer__close-btn"
            onClick={closeCart}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Cart Body */}
        <div className="cart-drawer__body">
          {cartItems.length === 0 ? (
            <div className="cart-drawer__empty">
              <div className="cart-drawer__empty-icon">🛒</div>
              <p className="cart-drawer__empty-text">Your cart is currently empty.</p>
              <button className="cart-drawer__shop-btn" onClick={closeCart}>
                Return To Shop
              </button>
            </div>
          ) : (
            <ul className="cart-drawer__list">
              {cartItems.map((item) => (
                <li key={item.id} className="cart-drawer__item">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-drawer__item-img"
                    />
                  )}
                  <div className="cart-drawer__item-info">
                    <h4 className="cart-drawer__item-name">{item.name}</h4>
                    <div className="cart-drawer__item-price-row">
                      <span className="cart-drawer__item-price">
                        ₹{item.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="cart-drawer__qty-controls">
                      <button
                        className="cart-drawer__qty-btn"
                        onClick={() => updateQuantity(item.id, -1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="cart-drawer__qty-val">{item.quantity}</span>
                      <button
                        className="cart-drawer__qty-btn"
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-drawer__item-right">
                    <span className="cart-drawer__item-subtotal">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      className="cart-drawer__remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
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
        {cartItems.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__subtotal-row">
              <span>Subtotal:</span>
              <strong className="cart-drawer__subtotal-val">
                ₹{cartTotal.toFixed(2)}
              </strong>
            </div>

            <p className="cart-drawer__shipping-note">
              Shipping & taxes calculated at checkout
            </p>

            <div className="cart-drawer__footer-actions">
              <button
                className="cart-drawer__checkout-btn"
                onClick={openCheckout}
              >
                Proceed to Checkout
              </button>

              <button
                className="cart-drawer__clear-btn"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
