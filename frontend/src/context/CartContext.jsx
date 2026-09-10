import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('woodmart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('woodmart_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems]);

  // Helper to normalize product objects from various components
  const normalizeProduct = (product) => {
    const rawPrice = product.price;
    const numericPrice = typeof rawPrice === 'number'
      ? rawPrice
      : parseFloat(String(rawPrice || '0').replace(/[^0-9.]/g, '')) || 0;

    return {
      id: product.id || String(product.name).toLowerCase().replace(/\s+/g, '-'),
      name: product.name || product.title || 'Product',
      price: numericPrice,
      image: product.img || product.image || product.bgImg || '',
      category: product.category || '',
    };
  };

  const addToCart = (product, qty = 1) => {
    const item = normalizeProduct(product);

    setCartItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty
        };
        return updated;
      }
      return [...prev, { ...item, quantity: qty }];
    });

    // Trigger Popup Notification
    setNotification({
      id: Date.now(),
      product: item,
      quantity: qty
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.reduce((acc, item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > 0) {
          acc.push({ ...item, quantity: newQty });
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, []));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const openCheckout = () => {
    setIsCartOpen(false); // Close cart drawer when checkout opens
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      notification,
      closeNotification,
      isCartOpen,
      setIsCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      isCheckoutOpen,
      openCheckout,
      closeCheckout,
    }}>
      {children}
    </CartContext.Provider>
  );
};
