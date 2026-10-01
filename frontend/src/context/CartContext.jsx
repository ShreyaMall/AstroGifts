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

    const productName = product.name || product.title || 'Product';
    // Clean product ID: prioritize product_id, _id, or id (never category_id)
    const actualProductId = product.product_id || product._id || product.id || String(productName).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const colorSuffix = product.color ? `-${String(product.color).toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
    const sizeSuffix = product.size ? `-${String(product.size).toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';

    return {
      id: `${actualProductId}${colorSuffix}${sizeSuffix}`,
      product_id: actualProductId,
      slug: product.slug || String(productName).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: productName,
      title: productName,
      price: numericPrice,
      image: product.img || product.image || product.product_image || product.bgImg || '',
      category: product.category_name || product.category || '',
      category_id: product.category_id || null,
      stock: product.stock !== undefined ? product.stock : null,
      color: product.color || null,
      size: product.size || null,
    };
  };

  const addToCart = (product, qty = 1) => {
    const item = normalizeProduct(product);
    console.log('====================================');
    console.log('🛒 [CART ADD EVENT] Data Sent From Frontend:');
    console.log('1️⃣ RAW INPUT PRODUCT:', product);
    console.log('2️⃣ PROCESSED CART ITEM:', {
      cart_id: item.id,
      product_id: item.product_id,
      name: item.name,
      title: item.title,
      price: item.price,
      quantity: qty,
      color: item.color,
      size: item.size,
      image: item.image,
    });
    console.log('====================================');

    setCartItems(prev => {
      // Calculate total quantity of this specific product already in cart
      const currentTotalQty = prev
        .filter(i => (item.product_id && i.product_id) ? i.product_id === item.product_id : i.id === item.id)
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
          .filter(i => (itemToUpdate.product_id && i.product_id) ? i.product_id === itemToUpdate.product_id : i.id === itemToUpdate.id)
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
