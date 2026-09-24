import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('astrogifts_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('astrogifts_cart', JSON.stringify(cartItems));
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

    const baseId = product.id || String(product.name).toLowerCase().replace(/\s+/g, '-');
    const colorSuffix = product.color ? `-${product.color.toLowerCase().replace(/\s+/g, '-')}` : '';

    return {
      id: `${baseId}${colorSuffix}`,
      product_id: product.id || product._id || null,
      slug: product.slug || String(product.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: product.name || product.title || 'Product',
      price: numericPrice,
      image: product.img || product.image || product.bgImg || '',
      category: product.category || '',
      stock: product.stock !== undefined ? product.stock : null,
      color: product.color || null,
    };
  };

  const addToCart = (product, qty = 1) => {
    const item = normalizeProduct(product);

    setCartItems(prev => {
      // Calculate total quantity of this product_id already in cart
      const currentTotalQty = prev
        .filter(i => i.product_id === item.product_id)
        .reduce((sum, i) => sum + i.quantity, 0);

      if (item.stock !== null && item.stock !== undefined) {
        if (currentTotalQty + qty > item.stock) {
          alert(`Cannot add more. Only ${item.stock} item(s) available in stock.`);
          return prev; // Do not add to cart
        }
      }

      if (currentTotalQty + qty > 99) {
        alert('You cannot order more than 99 units of a single item.');
        return prev;
      }

      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty
        };
        // Trigger notification after state update (using a slight delay or outside setState usually, but here we just allow it)
        setTimeout(() => {
          setNotification({ id: Date.now(), product: item, quantity: qty });
        }, 0);
        return updated;
      }
      
      setTimeout(() => {
        setNotification({ id: Date.now(), product: item, quantity: qty });
      }, 0);
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => {
      const itemToUpdate = prev.find(i => i.id === id);
      if (!itemToUpdate) return prev;

      if (delta > 0 && itemToUpdate.stock !== null && itemToUpdate.stock !== undefined) {
        const currentTotalQty = prev
          .filter(i => i.product_id === itemToUpdate.product_id)
          .reduce((sum, i) => sum + i.quantity, 0);

        if (currentTotalQty >= itemToUpdate.stock) {
          alert(`Cannot add more. Only ${itemToUpdate.stock} item(s) available.`);
          return prev;
        }
      }

      if (delta > 0 && itemToUpdate.quantity >= 99) {
        alert('You cannot order more than 99 units of a single item.');
        return prev;
      }

      return prev.reduce((acc, item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty > 0) {
            acc.push({ ...item, quantity: newQty });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const closeNotification = () => {
    setNotification(null);
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
    }}>
      {children}
    </CartContext.Provider>
  );
};
