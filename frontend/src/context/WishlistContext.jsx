import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('astrogifts_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('astrogifts_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }, [wishlistItems]);

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

  const isInWishlist = (id) => {
    return wishlistItems.some(item => item.id === id);
  };

  const toggleWishlist = (product) => {
    const item = normalizeProduct(product);
    const exists = isInWishlist(item.id);

    if (exists) {
      setWishlistItems(prev => prev.filter(i => i.id !== item.id));
      setNotification({
        id: Date.now(),
        product: item,
        action: 'removed'
      });
    } else {
      setWishlistItems(prev => [...prev, item]);
      setNotification({
        id: Date.now(),
        product: item,
        action: 'added'
      });
    }
  };

  const removeFromWishlist = (id) => {
    const item = wishlistItems.find(i => i.id === id);
    setWishlistItems(prev => prev.filter(i => i.id !== id));
    if (item) {
      setNotification({
        id: Date.now(),
        product: item,
        action: 'removed'
      });
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      wishlistCount,
      notification,
      closeNotification,
      isWishlistOpen,
      setIsWishlistOpen,
      openWishlist: () => setIsWishlistOpen(true),
      closeWishlist: () => setIsWishlistOpen(false),
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
