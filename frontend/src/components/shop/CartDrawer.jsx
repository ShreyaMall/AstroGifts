import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getColorName, getHexColor } from '../../utils/colorUtils';
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
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
              <div className="cart-drawer__empty-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </div>
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
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        closeCart();
                        navigate(`/product/${item.slug || String(item.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
                      }}
                    />
                  )}
                  <div className="cart-drawer__item-info">
                    <h4
                      className="cart-drawer__item-name"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        closeCart();
                        navigate(`/product/${item.slug || String(item.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
                      }}
                      title="View product page"
                    >
                      {item.name}
                    </h4>
                    {item.color && (
                      <div className="cart-drawer__item-color" style={{ fontSize: '12px', color: '#555', margin: '2px 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Color: <strong>{getColorName(item.color)}</strong></span>
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: getHexColor(item.color),
                            display: 'inline-block',
                            border: '1px solid #ccc',
                            flexShrink: 0
                          }}
                          title={getColorName(item.color)}
                        />
                      </div>
                    )}
                    <div className="cart-drawer__item-price-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span className="cart-drawer__item-price">
                        ₹{item.price.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          closeCart();
                          navigate(`/product/${item.slug || String(item.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
                        }}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          color: '#334155',
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '2px 8px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="View item details"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        View
                      </button>
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
                onClick={() => {
                  if (!isAuthenticated) {
                    closeCart();
                    navigate('/login');
                  } else {
                    closeCart();
                    navigate('/checkout');
                  }
                }}
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
