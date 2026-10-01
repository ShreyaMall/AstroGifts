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

    const productName = product.name || product.title || 'Product';
    const actualProductId = product.product_id || product._id || product.id || String(productName).toLowerCase().replace(/\s+/g, '-');

    return {
      id: actualProductId,
      product_id: actualProductId,
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

  const isInWishlist = (idOrProduct) => {
    if (!idOrProduct) return false;
    const targetId = typeof idOrProduct === 'object'
      ? (idOrProduct.product_id || idOrProduct._id || idOrProduct.id)
      : idOrProduct;
    return wishlistItems.some(item => item.id === targetId || item.product_id === targetId);
  };

  const toggleWishlist = (product) => {
    const item = normalizeProduct(product);
    const exists = isInWishlist(item.id);
    console.log('====================================');
    console.log(`❤️ [WISHLIST ${exists ? 'REMOVE' : 'ADD'} EVENT] Data Sent From Frontend:`);
    console.log('1️⃣ RAW INPUT PRODUCT:', product);
    console.log('2️⃣ PROCESSED WISHLIST ITEM:', {
      action: exists ? 'REMOVED' : 'ADDED',
      wishlist_id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image,
    });
    console.log('====================================');

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
