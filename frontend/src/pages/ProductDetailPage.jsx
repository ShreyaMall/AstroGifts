import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ProductDetailPage.css';


import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { productsApi, addressesApi, reviewsApi } from '../services/api';
import fallbackGift1 from '../assets/gift image.jpg';
import fallbackGift2 from '../assets/decor1.jpg';
import fallbackGift3 from '../assets/textile1.webp';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, updateQuantity, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const [relatedProducts, setRelatedProducts] = useState([]);

  const galleryImages = React.useMemo(() => {
    if (!product) return [];

    // If product defines isolated color_gallery per color variant, show color-specific gallery
    if (selectedColor && product.color_gallery && Array.isArray(product.color_gallery[selectedColor]) && product.color_gallery[selectedColor].length > 0) {
      return product.color_gallery[selectedColor].filter(Boolean);
    }

    let list = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      list = product.images.filter(Boolean);
    } else if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      list = product.gallery.filter(Boolean);
    } else if (typeof product.images === 'string' && product.images.trim()) {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) list = parsed.filter(Boolean);
      } catch (e) {
        list = product.images.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const mainImg = product.image || product.img || product.image_url;
    if (mainImg && !list.includes(mainImg)) {
      list.unshift(mainImg);
    }

    const extraImgs = [
      product.image_2 || product.secondary_image,
      product.image_3 || product.tertiary_image,
      product.image_4
    ].filter(Boolean);

    list = [...list, ...extraImgs];

    // Filter unique distinct images
    let uniqueList = Array.from(new Set(list.filter(Boolean)));

    return uniqueList;
  }, [product, selectedColor]);

  // Delivery & Pincode State
  const [pincode, setPincode] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tempPincode, setTempPincode] = useState('');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [newAddressForm, setNewAddressForm] = useState({
    name: '', phone: '', pincode: '', locality: '', address_line: '', city: '', state: ''
  });

  // Dynamic Reviews State
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    user_name: '',
    user_email: '',
    rating: 0,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewStatus, setReviewStatus] = useState({ error: '', success: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const scrollToReviews = () => {
    setActiveTab('reviews');
    setTimeout(() => {
      document.getElementById('pdp-reviews-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (id) {
      setLoadingReviews(true);
      const localKey = `astrogifts_product_reviews_${id}`;
      const savedLocal = JSON.parse(localStorage.getItem(localKey) || '[]');

      reviewsApi.getByProduct(id)
        .then(res => {
          if (res && res.data && Array.isArray(res.data)) {
            const combined = [...res.data, ...savedLocal];
            const uniqueReviews = combined.filter((v, i, a) => a.findIndex(t => (t.id && t.id === v.id) || (t.user_name === v.user_name && t.comment === v.comment)) === i);
            setReviews(uniqueReviews);
          } else {
            setReviews(savedLocal);
          }
        })
        .catch(err => {
          console.error("Failed to load reviews from API:", err);
          setReviews(savedLocal);
        })
        .finally(() => setLoadingReviews(false));
    }
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewForm.rating < 1) {
      setReviewStatus({ error: 'Please select a star rating (1 to 5 stars).', success: '' });
      return;
    }
    if (!reviewForm.user_name.trim() || !reviewForm.comment.trim()) {
      setReviewStatus({ error: 'Please enter your name and review comment.', success: '' });
      return;
    }

    setSubmittingReview(true);
    setReviewStatus({ error: '', success: '' });

    const newReviewObj = {
      id: 'rev_' + Date.now(),
      user_name: reviewForm.user_name.trim(),
      user_email: reviewForm.user_email.trim(),
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment.trim(),
      created_at: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    // Save to localStorage so review NEVER gets lost on page refresh
    const localKey = `astrogifts_product_reviews_${id}`;
    const savedLocal = JSON.parse(localStorage.getItem(localKey) || '[]');
    localStorage.setItem(localKey, JSON.stringify([newReviewObj, ...savedLocal]));

    // Update state immediately
    setReviews(prev => [newReviewObj, ...prev]);

    try {
      await reviewsApi.addReview(id, {
        user_name: reviewForm.user_name.trim(),
        user_email: reviewForm.user_email.trim() || undefined,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
        product_name: product?.name || 'Chair',
        product_image: product?.image || product?.img || '/chair1.jpg',
        status: 'Pending'
      });
    } catch (err) {
      console.warn("Backend review sync notice:", err.message);
    } finally {
      setReviewStatus({ error: '', success: 'Thank you! Your review is submitted and pending approval.' });
      setReviewSubmitted(true);
      setIsReviewModalOpen(false);
      setReviewForm({
        user_name: '',
        user_email: '',
        rating: 0,
        comment: ''
      });
      setSubmittingReview(false);
    }
  };

  const baseStock = product
    ? (typeof product.stock === 'number'
        ? product.stock
        : (typeof product.stock_quantity === 'number'
            ? product.stock_quantity
            : (product.stock !== undefined && product.stock !== null && !isNaN(parseInt(product.stock, 10))
                ? parseInt(product.stock, 10)
                : 25)))
    : 0;

  const availableStock = (selectedColor && product?.stock_by_color && typeof product.stock_by_color[selectedColor] !== 'undefined')
    ? parseInt(product.stock_by_color[selectedColor], 10)
    : baseStock;

  const isOutOfStock = availableStock <= 0;

  const baseId = product ? (product.id || String(product.name).toLowerCase().replace(/\s+/g, '-')) : null;
  const colorSuffix = selectedColor ? `-${selectedColor.toLowerCase().replace(/\s+/g, '-')}` : '';
  const cartItemId = baseId ? `${baseId}${colorSuffix}` : null;
  const cartItem = cartItemId ? cartItems.find(i => i.id === cartItemId) : null;
  const displayQuantity = cartItem ? cartItem.quantity : quantity;

  const handleDecrease = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, -1);
    } else {
      setQuantity(q => Math.max(1, q - 1));
    }
  };

  const handleIncrease = () => {
    if (isOutOfStock) return;
    if (cartItem) {
      if (cartItem.quantity < availableStock) {
        updateQuantity(cartItem.id, 1);
      }
    } else {
      setQuantity(q => Math.min(availableStock, q + 1));
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (product.colors?.length > 0 && !selectedColor) {
      alert('Please select a color before adding to cart.');
      return;
    }
    if (cartItem) {
      openCart();
    } else {
      const productToAdd = { ...product };
      if (selectedColor) {
        productToAdd.color = selectedColor;
      }
      if (selectedSize) {
        productToAdd.size = selectedSize;
      }
      addToCart(productToAdd, Math.min(availableStock, parseInt(quantity, 10) || 1));
      setQuantity(1);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (product.colors?.length > 0 && !selectedColor) {
      alert('Please select a color to buy this product.');
      return;
    }
    if (!cartItem) {
      const productToAdd = { ...product };
      if (selectedColor) {
        productToAdd.color = selectedColor;
      }
      if (selectedSize) {
        productToAdd.size = selectedSize;
      }
      addToCart(productToAdd, Math.min(availableStock, parseInt(quantity, 10) || 1));
    }
    navigate('/checkout');
  };

  // Helper for color swatches
  const getHexColor = (colorName) => {
    if (!colorName) return '#ddd';
    const normalized = colorName.toLowerCase().trim();
    const map = {
      'bone white': '#f9f6f0',
      'white': '#ffffff',
      'black': '#222222',
      'grey': '#808080',
      'gray': '#808080',
      'dark grey': '#444444',
      'light grey': '#d3d3d3',
      'brown': '#654321',
      'dark brown': '#3e2723',
      'beige': '#f5f5dc',
      'navy': '#1b2a4a',
      'navy blue': '#1b2a4a',
      'blue': '#0066cc',
      'red': '#d93838',
      'green': '#27ae60',
      'teal': '#0d9488',
      'yellow': '#f4d03f',
      'orange': '#f07d26',
      'pink': '#e87a90',
      'purple': '#800080',
      'gold': '#d4af37',
      'rose gold': '#b76e79',
      'silver': '#c0c0c0',
      'maroon': '#800020',
      'multi': '#e74c3c'
    };
    if (map[normalized]) return map[normalized];
    for (const key in map) {
      if (normalized.includes(key)) return map[key];
    }
    return normalized.replace(/\s+/g, '');
  };

  const parseDimensions = (dimStr) => {
    if (!dimStr) return { w: 'N/A', h: 'N/A', d: 'N/A' };
    
    let w = 'N/A', h = 'N/A', d = 'N/A';
    
    const wMatch = dimStr.match(/W:\s*([^xX,]+)/i);
    const dMatch = dimStr.match(/D:\s*([^xX,]+)/i);
    const hMatch = dimStr.match(/H:\s*([^xX,]+)/i);
    
    if (wMatch) w = wMatch[1].trim();
    if (hMatch) h = hMatch[1].trim();
    if (dMatch) d = dMatch[1].trim();
    
    if (!wMatch && !hMatch && !dMatch) {
      const parts = dimStr.split(/x/i).map(s => s.trim());
      if (parts.length >= 3) {
        w = parts[0];
        d = parts[1];
        h = parts[2];
      } else if (parts.length === 2) {
        w = parts[0];
        h = parts[1];
      }
    }
    
    return { w, h, d };
  };

  const getColorName = (colorVal) => {
    if (!colorVal) return '';
    if (!colorVal.startsWith('#')) return colorVal.charAt(0).toUpperCase() + colorVal.slice(1);
    
    const hexColors = {
      '#e8e0d4': 'Bone',
      '#f9f6f0': 'Bone White',
      '#ffffff': 'White',
      '#000000': 'Black',
      '#111111': 'Jet Black',
      '#1c1c1c': 'Dark Black',
      '#222222': 'Black',
      '#333333': 'Dark Grey',
      '#808080': 'Grey',
      '#444444': 'Dark Grey',
      '#d3d3d3': 'Light Grey',
      '#654321': 'Brown',
      '#3e2723': 'Dark Brown',
      '#8b4513': 'Saddle Brown',
      '#a0522d': 'Sienna',
      '#d2b48c': 'Tan',
      '#f5f5dc': 'Beige',
      '#000080': 'Navy',
      '#0000ff': 'Blue',
      '#ff0000': 'Red',
      '#008000': 'Green',
      '#008080': 'Teal',
      '#ffff00': 'Yellow',
      '#ffa500': 'Orange',
      '#ffc0cb': 'Pink',
      '#800080': 'Purple',
      '#795548': 'Brown',
      '#4caf50': 'Green',
      '#2196f3': 'Blue',
      '#f44336': 'Red',
      '#e91e63': 'Pink',
      '#9c27b0': 'Purple',
      '#3f51b5': 'Indigo',
      '#00bcd4': 'Cyan',
      '#009688': 'Teal',
      '#cddc39': 'Lime',
      '#ffeb3b': 'Yellow',
      '#ff9800': 'Orange',
      '#ff5722': 'Deep Orange',
      '#607d8b': 'Blue Grey'
    };

    const targetHex = colorVal.toLowerCase();
    if (hexColors[targetHex]) return hexColors[targetHex];
    
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) || 0;
      const g = parseInt(hex.slice(3, 5), 16) || 0;
      const b = parseInt(hex.slice(5, 7), 16) || 0;
      return [r, g, b];
    };
    
    const target = hexToRgb(targetHex);
    let minDistance = Infinity;
    let closestName = colorVal;
    
    for (const [hex, name] of Object.entries(hexColors)) {
      const rgb = hexToRgb(hex);
      const distance = Math.pow(target[0] - rgb[0], 2) + Math.pow(target[1] - rgb[1], 2) + Math.pow(target[2] - rgb[2], 2);
      if (distance < minDistance) {
        minDistance = distance;
        closestName = name;
      }
    }
    
    return closestName;
  };

  const getPincodeFallbackLocation = (pin) => {
    if (!pin || pin.length < 6) return '';
    const prefix3 = pin.substring(0, 3);
    const prefix2 = pin.substring(0, 2);

    const MAP_3 = {
      '110': 'New Delhi, Delhi',
      '122': 'Gurugram, Haryana',
      '201': 'Noida / Ghaziabad, UP',
      '400': 'Mumbai, Maharashtra',
      '401': 'Thane / Palghar, Maharashtra',
      '411': 'Pune, Maharashtra',
      '560': 'Bengaluru, Karnataka',
      '600': 'Chennai, Tamil Nadu',
      '700': 'Kolkata, West Bengal',
      '500': 'Hyderabad, Telangana',
      '380': 'Ahmedabad, Gujarat',
      '302': 'Jaipur, Rajasthan',
      '226': 'Lucknow, Uttar Pradesh',
      '800': 'Patna, Bihar',
      '452': 'Indore, Madhya Pradesh',
      '160': 'Chandigarh',
      '141': 'Ludhiana, Punjab',
      '781': 'Guwahati, Assam',
    };
    if (MAP_3[prefix3]) return MAP_3[prefix3];

    const MAP_2 = {
      '11': 'Delhi NCR', '12': 'Haryana', '13': 'Haryana', '14': 'Punjab', '15': 'Punjab',
      '16': 'Chandigarh', '17': 'Himachal Pradesh', '18': 'Jammu & Kashmir', '19': 'Jammu & Kashmir',
      '20': 'Uttar Pradesh', '21': 'Uttar Pradesh', '22': 'Uttar Pradesh', '23': 'Uttar Pradesh',
      '24': 'Uttarakhand', '25': 'Uttar Pradesh', '26': 'Uttar Pradesh', '27': 'Uttar Pradesh',
      '28': 'Uttar Pradesh', '30': 'Rajasthan', '31': 'Rajasthan', '32': 'Rajasthan',
      '33': 'Rajasthan', '34': 'Rajasthan', '36': 'Gujarat', '37': 'Gujarat', '38': 'Gujarat',
      '39': 'Gujarat', '40': 'Mumbai Region', '41': 'Pune Region, MH', '42': 'Nashik Region, MH',
      '43': 'Aurangabad, MH', '44': 'Nagpur Region, MH', '45': 'Indore Region, MP', '46': 'Bhopal Region, MP',
      '47': 'Gwalior Region, MP', '48': 'Jabalpur Region, MP', '49': 'Chhattisgarh', '50': 'Telangana',
      '51': 'Andhra Pradesh', '52': 'Vijayawada, AP', '53': 'Visakhapatnam, AP', '56': 'Bengaluru, KA',
      '57': 'Mysuru Region, KA', '58': 'Hubballi Region, KA', '60': 'Chennai, TN', '61': 'Tamil Nadu',
      '62': 'Madurai, TN', '63': 'Coimbatore, TN', '64': 'Tamil Nadu', '67': 'Kerala', '68': 'Kochi, KL',
      '69': 'Thiruvananthapuram, KL', '70': 'Kolkata, WB', '71': 'West Bengal', '72': 'West Bengal',
      '73': 'Siliguri Region, WB', '74': 'West Bengal', '75': 'Bhubaneswar, OD', '76': 'Odisha',
      '77': 'Odisha', '78': 'Assam', '79': 'North East India', '80': 'Patna, BR', '81': 'Bihar',
      '82': 'Ranchi, JH', '83': 'Jamshedpur, JH', '84': 'Bihar', '85': 'Bihar'
    };
    return MAP_2[prefix2] ? MAP_2[prefix2] : `Pincode ${pin}`;
  };

  // Pincode handler
  const handlePincodeSubmit = async (pin, addressText = null) => {
    if (!pin) pin = tempPincode;
    if (pin.length === 6) {
      setPincode(pin);
      setTempPincode(pin);
      if (addressText) {
        setDeliveryAddress(addressText);
      } else {
        setDeliveryAddress('');
      }
      setIsLocating(true);
      const estDate = new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      setDeliveryDate(estDate);

      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const po = data[0].PostOffice[0];
          const areaName = po.Name || po.Block || '';
          const district = po.District || '';
          const state = po.State || '';
          
          let fullLoc = '';
          if (areaName && district && areaName.toLowerCase() !== district.toLowerCase()) {
            fullLoc = `${areaName}, ${district} (${state})`;
          } else if (district) {
            fullLoc = `${district}, ${state}`;
          } else {
            fullLoc = state || getPincodeFallbackLocation(pin);
          }
          setDeliveryLocation(fullLoc);
        } else {
          setDeliveryLocation(getPincodeFallbackLocation(pin));
        }
      } catch (err) {
        console.error('Error fetching pincode:', err);
        setDeliveryLocation(getPincodeFallbackLocation(pin));
      } finally {
        setIsLocating(false);
      }
      setIsEditingLocation(false);
    } else {
      alert("Please enter a valid 6-digit pincode.");
    }
  };

  const handleCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use OpenStreetMap Nominatim for free reverse geocoding
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await res.json();
            setIsLocating(false);
            if (data && data.address) {
              const pin = data.address.postcode || '';
              const fullAddress = data.display_name;
              handlePincodeSubmit(pin, `Current Location: ${fullAddress}`);
            } else {
              alert("Could not determine address from your location.");
            }
          } catch (err) {
            setIsLocating(false);
            alert("Error fetching address data.");
          }
        },
        (error) => {
          setIsLocating(false);
          alert("Location access denied or unavailable. Please enable location permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    try {
      await addressesApi.addAddress(newAddressForm);
      const updated = await addressesApi.getUserAddresses();
      setSavedAddresses(Array.isArray(updated) ? updated : []);
      setIsAddingNewAddress(false);
      
      const newAddrStr = `${newAddressForm.name}, ${newAddressForm.address_line}, ${newAddressForm.city}`;
      handlePincodeSubmit(newAddressForm.pincode, newAddrStr);
      
      setNewAddressForm({name: '', phone: '', pincode: '', locality: '', address_line: '', city: '', state: ''});
    } catch (err) {
      console.error(err);
      alert("Failed to save address. " + (err.data?.message || err.message || "Check fields."));
    }
  };

  useEffect(() => {
    if (isEditingLocation && user) {
      addressesApi.getUserAddresses()
        .then(data => {
          if (Array.isArray(data)) {
            setSavedAddresses(data);
          }
        })
        .catch(err => console.error("Failed to load addresses", err));
    }
  }, [isEditingLocation, user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);

    // Backend API lookup
    productsApi.getById(id)
      .then(res => {
        if (res && res.data) {
          const fetchedProduct = res.data;
          setProduct(fetchedProduct);
          setActiveImage(fetchedProduct.image || fetchedProduct.img);
          setSelectedColor(null);
          if (fetchedProduct.sizes && fetchedProduct.sizes.length > 0) {
            setSelectedSize(fetchedProduct.sizes[0]);
          }
          setQuantity(1);

          // Fetch related products for the same category
          const categorySlug = fetchedProduct.category_slug || (fetchedProduct.category ? fetchedProduct.category.toLowerCase() : null);
          if (categorySlug) {
             productsApi.getAll({ category: categorySlug, per_page: 8 })
               .then(relatedRes => {
                  if (relatedRes && relatedRes.data) {
                     // Filter out the current product
                     setRelatedProducts(relatedRes.data.filter(p => String(p.id) !== String(fetchedProduct.id)).slice(0, 4));
                  }
               })
               .catch(err => console.error("Failed to load related products:", err));
          }
        }
      })
      .catch(err => {
        console.error("Failed to load product details:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pdp-page">
      <Header />
        <div className="pdp-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading product details...</div>
        </div>
        </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp-page">
        <Header />
        <div className="pdp-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <h2>Product Not Found</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>The product you are looking for does not exist or has been removed.</p>
          <Link to="/" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 24px', background: '#d96b27', color: '#fff', borderRadius: '6px', textDecoration: 'none' }}>
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const approvedReviews = reviews.filter(r => r.status === 'Approved');

  const renderTrustBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'warranty': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>;
      case 'truck': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>;
      case 'lock': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
      case 'star': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
      case 'shield': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
      case 'return':
      default:
        return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>;
    }
  };

  const activeTrustBadges = Array.isArray(product.trust_badges)
    ? product.trust_badges 
    : [
        { title: '7 Days Return', description: 'Easy return process', icon: 'return' }
      ];

  return (
    <div className="pdp-page">
      <Header />
      <div className="pdp-container">
        {/* Breadcrumb */}
        <div className="pdp-breadcrumb">
          <Link to="/">Home</Link>
          <span className="pdp-sep">/</span>
          <Link to={`/category/${product.category?.toLowerCase() || 'chairs'}`}>{product.category || 'Category'}</Link>
          <span className="pdp-sep">/</span>
          <Link to={`/product/${product.id || String(product.name).toLowerCase().replace(/\s+/g, '-')}`} className="pdp-breadcrumb-current">{product.name}</Link>
        </div>

        {/* Main Product Grid */}
        <div className="pdp-main-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* 1. Images (Gallery) */}
          <div className="pdp-gallery">
            {/* Thumbs (Left - Only show if more than 1 image) */}
            {galleryImages.length > 1 && (
              <div className="pdp-thumbs">
                {galleryImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    className={`pdp-thumb ${(activeImgIndex === i || activeImage === imgUrl) ? 'pdp-thumb--active' : ''}`}
                    onClick={() => {
                      setActiveImgIndex(i);
                      setActiveImage(imgUrl);
                    }}
                    title={`View ${i + 1}`}
                  >
                    <img src={imgUrl} alt={`${product.name} view ${i+1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image (Right) */}
            <div className="pdp-main-img-wrap">
              {product.badge && (
                <span className={`pdp-badge ${product.badge.startsWith('-') ? 'pdp-badge--sale' : 'pdp-badge--new'}`}>
                  {product.badge}
                </span>
              )}
              <button 
                className={`pdp-img-wishlist-btn ${wishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? "#d96b27" : "none"} stroke={wishlisted ? "#d96b27" : "currentColor"} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>

              <img src={galleryImages[activeImgIndex] || activeImage || product.image || product.img} alt={product.name} className="pdp-main-img" />
            </div>
          </div>

          {/* Product Info - Step 2 to 10 */}
          <div className="pdp-info">
            {/* 2. Product Name */}
            <h1 className="pdp-title">{product.name}</h1>
            <div style={{ fontSize: '13px', color: '#d96b27', fontWeight: '500', marginBottom: '8px' }}>
              Premium Gift Item • Handcrafted • Express Delivery
            </div>

            {/* 3. Rating */}
            <div className="pdp-rating-row" style={{ marginBottom: '16px' }}>
              <div style={{ background: '#1c8851', color: '#fff', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                ★ {(() => {
                  const avgRating = approvedReviews.length > 0 
                    ? approvedReviews.reduce((sum, r) => sum + Number(r.rating), 0) / approvedReviews.length 
                    : (product.rating || 4.5);
                  return avgRating.toFixed(1);
                })()}
              </div>
              <span className="pdp-review-count">
                ({approvedReviews.length} Reviews)
              </span>
              <span style={{ color: '#ccc' }}>|</span>
              <button
                type="button"
                onClick={scrollToReviews}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#d96b27',
                  textDecoration: 'underline',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                View All Reviews
              </button>
            </div>

            {/* 4. Price */}
            <div className="pdp-price-row" style={{ marginBottom: '4px' }}>
              <span className="pdp-price">₹{product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="pdp-old-price">₹{product.oldPrice.toFixed(2)}</span>
              )}
              {product.oldPrice && (
                <span className="pdp-save-badge">
                  {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#777', marginBottom: '20px' }}>Inclusive of all taxes</div>

            {/* 5. Description */}
            <div className="pdp-short-desc" style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', marginBottom: '20px', background: '#fcf8f5', padding: '14px 16px', borderRadius: '8px', borderLeft: '4px solid #d96b27' }}>
              {product.description || `Make memories unforgettable with this handcrafted anniversary gift box from AstroGifts. Designed with premium materials and personalized touches to celebrate love and togetherness.`}
            </div>

            {/* 6. Variations (MORE COLORS with Image Swatches) */}
            {product.colors && product.colors.length > 0 ? (
              <div style={{ margin: '0 0 20px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                  MORE COLORS: <span style={{ fontWeight: '500', color: '#d96b27', textTransform: 'none', letterSpacing: 'normal' }}>{getColorName(selectedColor || product.colors[0])}</span>
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  {product.colors.map((c, cIndex) => {
                    const stock = product.stock_by_color?.[c] ?? baseStock;
                    const isColOutOfStock = stock <= 0;
                    const colorThumbImg = product.color_images?.[c] || galleryImages[cIndex];

                    if (colorThumbImg) {
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            if (!isColOutOfStock) {
                              setSelectedColor(c);
                              setActiveImage(colorThumbImg);
                              const foundIdx = galleryImages.indexOf(colorThumbImg);
                              if (foundIdx !== -1) setActiveImgIndex(foundIdx);
                            }
                          }}
                          disabled={isColOutOfStock}
                          title={c}
                          style={{
                            width: '48px',
                            height: '56px',
                            borderRadius: '6px',
                            border: selectedColor === c ? '2px solid #d96b27' : '1px solid #e2e8f0',
                            padding: '2px',
                            background: '#fff',
                            cursor: isColOutOfStock ? 'not-allowed' : 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: selectedColor === c ? '0 2px 8px rgba(217, 107, 39, 0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <img src={colorThumbImg} alt={c} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', opacity: isColOutOfStock ? 0.4 : 1 }} />
                          {isColOutOfStock && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#dc2626', fontWeight: 'bold' }}>
                              OUT
                            </div>
                          )}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          if (!isColOutOfStock) {
                            setSelectedColor(c);
                          }
                        }}
                        disabled={isColOutOfStock}
                        title={c}
                        style={{
                          width: '30px', height: '30px',
                          borderRadius: '50%',
                          border: selectedColor === c ? '2px solid #111' : '1px solid #ddd',
                          background: getHexColor(c),
                          cursor: isColOutOfStock ? 'not-allowed' : 'pointer',
                          position: 'relative',
                          padding: '2px',
                          backgroundClip: 'content-box'
                        }}
                      >
                        {isColOutOfStock && (
                          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#9ca3af', transform: 'rotate(-45deg)' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Variations - Size / Gift Edition */}
            <div className="pdp-size-selector" style={{ marginBottom: '20px' }}>
              <span className="pdp-size-label">Gift Edition / Size: <strong>{selectedSize || 'Standard Box (M)'}</strong></span>
              <div className="pdp-size-options" style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="button" className={`pdp-size-btn ${selectedSize === 'Compact Box (S)' ? 'pdp-size-btn--active' : ''}`} onClick={() => setSelectedSize('Compact Box (S)')}>Compact Box (S)</button>
                <button type="button" className={`pdp-size-btn ${(selectedSize === 'Standard Box (M)' || !selectedSize) ? 'pdp-size-btn--active' : ''}`} onClick={() => setSelectedSize('Standard Box (M)')}>Standard Box (M)</button>
                <button type="button" className={`pdp-size-btn ${selectedSize === 'Royal Hamper (XL)' ? 'pdp-size-btn--active' : ''}`} onClick={() => setSelectedSize('Royal Hamper (XL)')}>Royal Hamper (XL)</button>
              </div>
            </div>

            {/* 7. Quantity */}
            <div className="pdp-qty-wrap" style={{ marginBottom: '16px' }}>
              <span className="pdp-qty-label" style={{ fontWeight: '600', fontSize: '14px' }}>Quantity:</span>
              <div className="pdp-qty-controls" style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                <button type="button" onClick={handleDecrease} style={{ width: '32px', height: '32px', border: 'none', background: '#f5f5f5', cursor: 'pointer' }}>-</button>
                <input type="number" min="1" value={displayQuantity} onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  if (!cartItem) {
                    setQuantity(Math.max(1, val));
                  }
                }} style={{ width: '40px', textAlign: 'center', border: 'none', fontSize: '14px', outline: 'none' }} />
                <button type="button" onClick={handleIncrease} style={{ width: '32px', height: '32px', border: 'none', background: '#f5f5f5', cursor: 'pointer' }}>+</button>
              </div>
            </div>

            {/* 8. Stock */}
            <div className="pdp-stock-status" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isOutOfStock ? (
                <span style={{ color: '#dc2626', background: '#fee2e2', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Out of Stock
                </span>
              ) : (
                <span style={{ color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> In Stock ({availableStock} units available)
                </span>
              )}
            </div>

            {/* 9. Delivery/Pincode */}
            <div className="pdp-delivery-pincode-box" style={{ background: '#fafafa', border: '1px solid #eaeaea', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '600', color: '#222', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d96b27" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Check Delivery & Pincode Availability
              </h4>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit Pincode" 
                  value={tempPincode}
                  onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
                <button 
                  type="button" 
                  onClick={() => handlePincodeSubmit(tempPincode)}
                  style={{ background: '#d96b27', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Check
                </button>
              </div>
              {pincode ? (
                <div style={{ fontSize: '12px', color: '#16a34a', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg><strong>Deliverable {deliveryLocation ? `to ${deliveryLocation}` : ''}</strong></div>
                  <div style={{ color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d96b27" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>Estimated Delivery by <strong>{deliveryDate}</strong></div>
                  <div style={{ color: '#777', display: 'flex', alignItems: 'center', gap: '6px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>Free Gift Packaging & COD available</div>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#777' }}>Enter your area PIN code to check exact delivery timeline.</div>
              )}
            </div>

            {/* 10. Add to Cart / Buy Now */}
            <div className="pdp-main-actions" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button
                type="button"
                className="pdp-add-cart-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                style={{ background: '#d96b27', color: '#fff', border: 'none', flex: 1, height: '46px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: isOutOfStock ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>{isOutOfStock ? 'Out of Stock' : (cartItem ? 'View Cart' : 'Add to Cart')}</span>
              </button>

              <button
                type="button"
                className="pdp-buy-now-btn"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '8px', flex: 1, height: '46px', fontSize: '14px', fontWeight: '600', cursor: isOutOfStock ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
              >
                Buy Now
              </button>
            </div>

            {/* Trust highlights */}
            {activeTrustBadges.length > 0 && (
              <div className="pdp-trust-strip" style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                {activeTrustBadges.map((badge, idx) => (
                  <div key={idx} className="pdp-trust-strip-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#555' }}>
                    <div className="pdp-trust-strip-icon" style={{ color: '#d96b27' }}>{renderTrustBadgeIcon(badge.icon)}</div>
                    <div>
                      <strong style={{ display: 'block', color: '#222' }}>{badge.title}</strong>
                      <span style={{ fontSize: '11px', color: '#777' }}>{badge.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 11. Product Details Section */}
        <div className="pdp-tabs-wrap" style={{ marginTop: '20px' }}>
          <div className="pdp-tab-nav">
            <button className={`pdp-tab-btn ${activeTab === 'desc' ? 'pdp-tab-btn--active' : ''}`} onClick={() => setActiveTab('desc')}>
              Product Details
            </button>
            <button className={`pdp-tab-btn ${activeTab === 'specs' ? 'pdp-tab-btn--active' : ''}`} onClick={() => setActiveTab('specs')}>
              Specifications
            </button>
            <button className={`pdp-tab-btn ${activeTab === 'faq' ? 'pdp-tab-btn--active' : ''}`} onClick={() => setActiveTab('faq')}>
              FAQs
            </button>
          </div>

          <div className="pdp-tab-content">
            {activeTab === 'desc' && (
              <div className="pdp-tab-pane">
                <div className="pdp-desc-grid">
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 16px' }}>Full Product Details</h3>
                    <p style={{ lineHeight: '1.7', color: '#555', marginBottom: '20px' }}>
                      {product.description || `Celebrate timeless romance with this exquisite AstroGifts anniversary collection. Carefully handcrafted with premium materials, fine detailing, and personalized packaging to make your anniversary moments unforgettable.`}
                    </p>
                    <ul style={{ paddingLeft: '20px', color: '#555', lineHeight: '1.8' }}>
                      {product.features && product.features.length > 0 ? (
                        product.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))
                      ) : (
                        <>
                          <li>Premium handcrafted craftsmanship with elegant finishing</li>
                          <li>Includes custom greeting message card for your special one</li>
                          <li>Luxurious ribbon gift-box packaging ready for gifting</li>
                          <li>Durable, long-lasting keepsake designed to cherish forever</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 16px' }}>Product Showcase</h3>
                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={activeImage || product.image || product.img} alt="Showcase" style={{ width: '100%', display: 'block', height: '240px', objectFit: 'cover' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="pdp-tab-pane">
                <div className="pdp-details-grid">
                  <div className="pdp-details-col">
                    <h3>Product Specifications</h3>
                    <table className="pdp-specs-table">
                      <tbody>
                        <tr>
                          <td>Primary Material</td>
                          <td>{product.material || 'Organic Wood / Crystal / Brass'}</td>
                        </tr>
                        <tr>
                          <td>Finish</td>
                          <td>Hand-polished Premium Finish</td>
                        </tr>
                        <tr>
                          <td>Color</td>
                          <td>{getColorName(selectedColor || product.color || 'Golden / Rose')}</td>
                        </tr>
                        <tr>
                          <td>Occasion</td>
                          <td>Anniversary / Romantic Celebration</td>
                        </tr>
                        <tr>
                          <td>Packaging</td>
                          <td>Rigid Gift Box with Satin Ribbon</td>
                        </tr>
                        <tr>
                          <td>Country of Origin</td>
                          <td>India</td>
                        </tr>
                        <tr>
                          <td>SKU</td>
                          <td>AG-ANNIV-{product.id}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pdp-details-col pdp-dim-col">
                    <h3>Product Dimensions</h3>
                    <div style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.6', color: '#444' }}>
                      {product.dimensions ? (
                        <p><strong>Dimensions:</strong> {product.dimensions}</p>
                      ) : (
                        <p><strong>Dimensions:</strong> Standard Gift Box (22cm x 18cm x 10cm)</p>
                      )}
                      {product.weight && (
                        <p><strong>Weight:</strong> {product.weight}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="pdp-tab-pane">
                <div style={{ maxWidth: '600px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>Frequently Asked Questions</h3>
                  {product.faqs && product.faqs.length > 0 ? (
                    product.faqs.map((faq, idx) => (
                      <div style={{ marginBottom: '20px' }} key={idx}>
                        <strong>{faq.question}</strong>
                        <p style={{ marginTop: '5px', color: '#666' }}>{faq.answer}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <strong>Q: Can I add a personalized message card?</strong>
                        <p style={{ marginTop: '4px', color: '#666' }}>Yes! Every anniversary gift box includes a complimentary personalized gift message card.</p>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <strong>Q: How long does delivery take?</strong>
                        <p style={{ marginTop: '4px', color: '#666' }}>Standard delivery takes 3 to 5 business days. Express pincode delivery option is also available at checkout.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 12. What's Included */}
        <div className="pdp-whats-included-section" style={{ marginTop: '20px', background: '#fff9f5', border: '1px solid #f2e2d9', borderRadius: '12px', padding: '20px 24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d96b27" strokeWidth="2"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
            What's Included in this Gift Box
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '14px 16px', borderRadius: '8px', border: '1px solid #f0ded3' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d96b27" strokeWidth="2"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: '#222', display: 'block' }}>1x Main Anniversary Gift</strong>
                <span style={{ fontSize: '12px', color: '#666' }}>{product.name}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '14px 16px', borderRadius: '8px', border: '1px solid #f0ded3' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d96b27" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: '#222', display: 'block' }}>1x Custom Wishing Card</strong>
                <span style={{ fontSize: '12px', color: '#666' }}>Personalized message insert</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '14px 16px', borderRadius: '8px', border: '1px solid #f0ded3' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d96b27" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: '#222', display: 'block' }}>1x Luxury Rigid Box</strong>
                <span style={{ fontSize: '12px', color: '#666' }}>Satin ribbon & protective cushion</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '14px 16px', borderRadius: '8px', border: '1px solid #f0ded3' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d96b27" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: '#222', display: 'block' }}>1x Authenticity Card</strong>
                <span style={{ fontSize: '12px', color: '#666' }}>Quality assurance guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* 13. Delivery & Return */}
        <div className="pdp-delivery-return-section" style={{ marginTop: '20px', background: '#ffffff', border: '1px solid #eee', borderRadius: '12px', padding: '20px 24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d96b27" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            Delivery & Return Policy
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#222', marginBottom: '6px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d96b27" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg> Express Dispatch</strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' }}>Orders are processed and dispatched within 24 to 48 hours with live tracking details sent to SMS/Email.</p>
            </div>
            <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#222', marginBottom: '6px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d96b27" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg> Free Standard Delivery</strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' }}>Free delivery across 25,000+ PIN codes in India. Estimated delivery within 3-5 business days.</p>
            </div>
            <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#222', marginBottom: '6px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d96b27" strokeWidth="2"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> 7-Day Easy Replacements</strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' }}>In the rare event of transit damage or defects, enjoy effortless 7-day doorstep replacement support.</p>
            </div>
          </div>
        </div>

        {/* 14. Reviews */}
        <div className="pdp-reviews-section" id="pdp-reviews-section" style={{ marginTop: '20px', background: '#ffffff', border: '1px solid #eee', borderRadius: '12px', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111' }}>
              Customer Reviews ({approvedReviews.length})
            </h3>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              style={{
                background: '#d96b27',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#ffffff" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Write a Review
            </button>
          </div>

          {reviewStatus.success && (
            <div style={{ background: '#eef7ed', color: '#155724', padding: '14px 20px', borderRadius: '10px', border: '1px solid #c3e6cb', marginBottom: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#155724" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> {reviewStatus.success}
            </div>
          )}

          {/* Reviews List */}
          <div className="pdp-reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loadingReviews ? (
              <p style={{ color: '#666' }}>Loading reviews...</p>
            ) : approvedReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', background: '#fafafa', borderRadius: '10px', border: '1px solid #eeeeee' }}>
                <p style={{ color: '#666', fontSize: '15px', marginBottom: '15px' }}>There are no reviews yet for "{product.name}".</p>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  style={{ background: '#d96b27', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Be the first to write a review
                </button>
              </div>
            ) : (
              approvedReviews.map((rev, idx) => (
                <div key={rev.id || idx} style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '10px', border: '1px solid #eeeeee', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '15px', color: '#1a1a1a' }}>{rev.user_name}</strong>
                    <span style={{ color: '#888', fontSize: '12px' }}>
                      {rev.created_at ? (typeof rev.created_at === 'string' && rev.created_at.includes('T') ? new Date(rev.created_at).toLocaleDateString() : rev.created_at) : 'Recently'}
                    </span>
                  </div>
                  <div style={{ color: '#f59e53', fontSize: '14px', marginBottom: '8px' }}>
                    {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                  </div>
                  <p style={{ margin: 0, color: '#444', lineHeight: '1.6', fontSize: '14px' }}>{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 15. Related Anniversary Gifts */}
        {relatedProducts.length > 0 && (
          <div className="pdp-related-section" style={{ marginTop: '50px' }}>
            <div className="pdp-related-header">
              <h2 className="pdp-related-title">Related Anniversary Gifts</h2>
              <Link
                to={`/category/${product.category_slug || product.category?.toLowerCase() || 'gifts'}`}
                className="pdp-related-view-all"
              >
                View All →
              </Link>
            </div>
            <div className="pdp-related-grid">
              {relatedProducts.map(rel => {
                const relSlug = rel.slug || String(rel.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const relImg = rel.image_url || rel.image || rel.img || '';
                const relPrice = typeof rel.price === 'number' ? rel.price : parseFloat(rel.price) || 0;
                return (
                  <div key={rel.id} className="pdp-rel-card">
                    <Link to={`/product/${relSlug}`} className="pdp-rel-img-wrap">
                      {rel.badge && (
                        <span className={`pdp-rel-badge ${rel.badge_type === 'sale' ? 'pdp-rel-badge--sale' : 'pdp-rel-badge--new'}`}>
                          {rel.badge}
                        </span>
                      )}
                      <img src={relImg} alt={rel.name} className="pdp-rel-img" />
                    </Link>
                    <div className="pdp-rel-info">
                      <span className="pdp-rel-cat">{rel.category_name || rel.category}</span>
                      <Link to={`/product/${relSlug}`} className="pdp-rel-name-link">
                        <h3 className="pdp-rel-name">{rel.name}</h3>
                      </Link>
                      <div className="pdp-rel-price-row">
                        {rel.old_price && <span className="pdp-rel-old-price">₹{parseFloat(rel.old_price).toFixed(2)}</span>}
                        <span className="pdp-rel-price">₹{relPrice.toFixed(2)}</span>
                      </div>
                      <button
                        className="pdp-rel-add-btn"
                        onClick={() => addToCart({ ...rel, id: rel.id, name: rel.name, price: relPrice, img: relImg })}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <Footer />

      {/* Delivery Location Modal */}
      {isEditingLocation && (
        <div className="pdp-modal-overlay" onClick={() => setIsEditingLocation(false)}>
          <div className="pdp-modal-content" onClick={e => e.stopPropagation()}>
            <div className="pdp-modal-header">
              <h3>Select delivery address</h3>
              <button className="pdp-modal-close" onClick={() => setIsEditingLocation(false)}>✕</button>
            </div>
            
            <div className="pdp-modal-body">
              <div className="pdp-modal-search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search by area, street name, pin code" 
                  value={tempPincode}
                  onChange={e => setTempPincode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePincodeSubmit()}
                  autoFocus
                />
              </div>

              <button className="pdp-modal-current-loc" onClick={handleCurrentLocation} disabled={isLocating}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <strong>{isLocating ? 'Locating...' : 'Use my current location'}</strong>
                  <span>Allow access to location</span>
                </div>
              </button>

              <div className="pdp-modal-saved">
                <div className="pdp-modal-saved-header">
                  <h4>{isAddingNewAddress ? 'Add new address' : 'Saved addresses'}</h4>
                  <button className="pdp-modal-add-btn" onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}>
                    {isAddingNewAddress ? 'Cancel' : '+ Add New'}
                  </button>
                </div>
                
                {isAddingNewAddress ? (
                  <form onSubmit={handleAddNewAddress} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input type="text" placeholder="Full Name" required value={newAddressForm.name} onChange={e => setNewAddressForm({...newAddressForm, name: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none' }} />
                    <input type="text" placeholder="Phone Number" required value={newAddressForm.phone} onChange={e => setNewAddressForm({...newAddressForm, phone: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none' }} />
                    <input type="text" placeholder="Pincode" required maxLength="6" value={newAddressForm.pincode} onChange={e => setNewAddressForm({...newAddressForm, pincode: e.target.value.replace(/\D/g,'')})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none' }} />
                    <input type="text" placeholder="Address Line (House No, Building, Street)" required value={newAddressForm.address_line} onChange={e => setNewAddressForm({...newAddressForm, address_line: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none' }} />
                    <input type="text" placeholder="Locality / Area" value={newAddressForm.locality} onChange={e => setNewAddressForm({...newAddressForm, locality: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none' }} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" placeholder="City" required value={newAddressForm.city} onChange={e => setNewAddressForm({...newAddressForm, city: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 1, fontSize: '13px', outline: 'none' }} />
                      <input type="text" placeholder="State" required value={newAddressForm.state} onChange={e => setNewAddressForm({...newAddressForm, state: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 1, fontSize: '13px', outline: 'none' }} />
                    </div>
                    <button type="submit" style={{ padding: '10px', background: '#d96b27', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}>Save Address</button>
                  </form>
                ) : (
                  <div className="pdp-modal-address-list">
                    {savedAddresses.length > 0 ? (
                      savedAddresses.map(address => (
                        <div 
                          key={address.id} 
                          className="pdp-modal-address-item" 
                          onClick={() => handlePincodeSubmit(address.pincode, `${address.address_line}, ${address.locality ? address.locality + ', ' : ''}${address.city}, ${address.state}`)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          <div>
                            <strong>{address.name}</strong>
                            <p>{address.address_line}, {address.locality ? address.locality + ', ' : ''}{address.city}, {address.state}</p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div style={{ color: '#888', fontSize: '13px', padding: '10px 0' }}>No saved addresses found.</div>
                  )}
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── WRITE A REVIEW POPUP MODAL ── */}
      {isReviewModalOpen && (
        <div className="admin__modal-overlay" onClick={() => setIsReviewModalOpen(false)}>
          <div className="admin__modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', borderRadius: '16px', padding: '24px', background: '#ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div className="admin__modal-header" style={{ borderBottom: '1px solid #eeeeee', paddingBottom: '12px', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: 0 }}>Write a Review</h3>
              <button type="button" className="admin__modal-close" onClick={() => setIsReviewModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleReviewSubmit} style={{ paddingTop: '5px' }}>
              
              {/* Star Rating Selector */}
              <div style={{ marginBottom: '20px', textAlign: 'center', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #eeeeee' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                  Select Rating *
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '32px',
                        cursor: 'pointer',
                        color: star <= reviewForm.rating ? '#f59e53' : '#ddd',
                        padding: '0 4px',
                        transition: 'transform 0.15s ease'
                      }}
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {reviewForm.rating > 0 && (
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#f59e53', marginTop: '4px', display: 'block' }}>
                    {reviewForm.rating} out of 5 Stars
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={reviewForm.user_name}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, user_name: e.target.value }))}
                    style={{ width: '100%', padding: '11px 16px', border: '1px solid #ddd', borderRadius: '25px', outline: 'none', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Email (optional)</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={reviewForm.user_email}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, user_email: e.target.value }))}
                    style={{ width: '100%', padding: '11px 16px', border: '1px solid #ddd', borderRadius: '25px', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Your Review *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Share details of your experience with this product..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '14px', outline: 'none', fontSize: '14px', resize: 'vertical' }}
                ></textarea>
              </div>

              {reviewStatus.error && (
                <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                  {reviewStatus.error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  style={{ background: '#f5f5f5', color: '#555', border: 'none', padding: '10px 22px', borderRadius: '25px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    background: '#f79051',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '10px 26px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: submittingReview ? 'not-allowed' : 'pointer',
                    opacity: submittingReview ? 0.7 : 1
                  }}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
