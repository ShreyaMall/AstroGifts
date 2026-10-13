import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi, addressesApi, couponsApi, authApi, getAuthToken } from '../services/api';
import AstroGiftsSVG from '../components/common/AstroGiftsSVG';
import { getColorName, getHexColor } from '../utils/colorUtils';
import './CheckoutPage.css';

// Indian States and Union Territories
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const FREE_SHIPPING_THRESHOLD = 999;
const ESTIMATED_DELIVERY_TEXT = 'Estimated delivery: 3–5 business days across India (Dispatched within 24 hours)';
const DRAFT_STORAGE_KEY = 'astrogifts_checkout_form_draft';
const SELECTED_ADDRESS_STORAGE_KEY = 'astrogifts_checkout_selected_address_id';

// Format Indian Currency (e.g. ₹1,299 or ₹1,299.00)
const formatINR = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
  });
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderNumber: urlOrderNumber } = useParams();

  const {
    cartItems,
    cartTotal,
    clearCart,
    openCart,
  } = useCart();

  const {
    user,
    isAuthenticated,
    isPhoneVerified,
    openAuth,
    login,
  } = useAuth();

  // Active step: 1 = Checkout form, 2 = Order Complete
  const [currentStep, setCurrentStep] = useState(urlOrderNumber ? 2 : 1);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(!!urlOrderNumber);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressSelectionError, setAddressSelectionError] = useState('');
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [useNewAddressForm, setUseNewAddressForm] = useState(false);

  // Form State
  const initialFormState = {
    fullName: user?.name || '',
    phone: user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : '',
    email: user?.email || '',
    country: 'India',
    state: 'Delhi',
    city: '',
    address: '',
    line2: '',
    landmark: '',
    pincode: '',
    label: 'Home',
    notes: '',
    saveAddressToAccount: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'razorpay'

  // Mobile Collapsible Summary
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Coupon State
  const [showCouponBox, setShowCouponBox] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Ref for focusing first invalid field
  const formRef = useRef(null);

  // ── 1. AUTHENTICATION ENFORCEMENT: Login is ALWAYS required for checkout ──
  useEffect(() => {
    if (!isAuthenticated && currentStep === 1) {
      openAuth({ pendingAction: 'checkout', redirectTo: '/checkout' });
    }
  }, [isAuthenticated, currentStep]);

  // ── 2. LOAD COMPLETED ORDER (If direct URL /order-complete/:orderNumber) ──
  useEffect(() => {
    if (urlOrderNumber) {
      setCurrentStep(2);
      setLoadingOrder(true);
      ordersApi.track(urlOrderNumber)
        .then(res => {
          if (res?.data) {
            setOrderDetails(res.data);
          }
        })
        .catch(err => {
          console.warn('Failed tracking order from URL param:', err);
        })
        .finally(() => setLoadingOrder(false));
    }
  }, [urlOrderNumber]);

  // ── 3. LOAD SAVED USER ADDRESSES (When Logged In) ──
  const fetchAddresses = async () => {
    if (!isAuthenticated) return;
    setLoadingAddresses(true);
    try {
      const addrs = await addressesApi.getUserAddresses();
      if (Array.isArray(addrs) && addrs.length > 0) {
        setSavedAddresses(addrs);
        setUseNewAddressForm(false);

        // Check if an address was actively chosen in the CURRENT browser session
        const sessionSelectedId = sessionStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);
        if (sessionSelectedId) {
          const matched = addrs.find(a => String(a.id || a._id) === String(sessionSelectedId));
          if (matched) {
            setSelectedAddressId(matched.id);
            applySavedAddress(matched);
          } else {
            sessionStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY);
            setSelectedAddressId(null);
          }
        } else {
          // NO address pre-selected on initial load (even if only 1 saved address or default address exists)
          setSelectedAddressId(null);
        }
      } else {
        setSavedAddresses([]);
        setUseNewAddressForm(true);
        setSelectedAddressId(null);
        sessionStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Error fetching user addresses:', err);
      setUseNewAddressForm(true);
      setSelectedAddressId(null);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const applySavedAddress = (addr) => {
    if (!addr) return;
    setFormData(prev => ({
      ...prev,
      fullName: addr.full_name || addr.name || prev.fullName || user?.name || '',
      phone: (addr.phone || prev.phone || user?.phone || '').replace(/\D/g, '').slice(-10),
      address: addr.line1 || addr.address_line || '',
      line2: addr.line2 || '',
      landmark: addr.landmark || addr.locality || '',
      city: addr.city || '',
      state: addr.state || 'Delhi',
      pincode: (addr.pincode || '').replace(/\D/g, '').slice(0, 6),
      country: addr.country || 'India',
      label: addr.label || 'Home',
    }));
    setFieldErrors({});
  };

  const handleSelectAddress = (addr) => {
    if (!addr) return;
    setSelectedAddressId(addr.id);
    sessionStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, String(addr.id));
    applySavedAddress(addr);
    setAddressSelectionError('');
  };

  const handleAddNewAddressClick = () => {
    setEditingAddressId(null);
    setUseNewAddressForm(true);
    setSelectedAddressId(null);
    sessionStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY);
    setAddressSelectionError('');
    setFormData(prev => ({
      ...prev,
      fullName: prev.fullName || user?.name || '',
      phone: prev.phone || (user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : ''),
      address: '',
      line2: '',
      landmark: '',
      city: '',
      state: 'Delhi',
      pincode: '',
      label: 'Home',
      saveAddressToAccount: true,
    }));
    setFieldErrors({});
  };

  const handleEditSavedAddress = (addr) => {
    setEditingAddressId(addr.id);
    setUseNewAddressForm(true);
    applySavedAddress(addr);
    setAddressSelectionError('');
    setFieldErrors({});
  };

  const handleCancelNewAddress = () => {
    setUseNewAddressForm(false);
    setEditingAddressId(null);
    setAddressSelectionError('');
    if (selectedAddressId) {
      const existing = savedAddresses.find(a => a.id === selectedAddressId);
      if (existing) {
        applySavedAddress(existing);
      } else {
        setSelectedAddressId(null);
        sessionStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY);
      }
    } else {
      setSelectedAddressId(null);
    }
  };

  // ── 4. RESTORE FORM DRAFT FROM SESSION STORAGE ──
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          setFormData(prev => ({
            ...prev,
            ...parsed,
            // Ensure account-prefilled info is respected if draft is empty
            fullName: parsed.fullName || user?.name || prev.fullName,
            email: parsed.email || user?.email || prev.email,
            phone: parsed.phone || (user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : prev.phone),
          }));
        }
      }
    } catch (e) {
      console.warn('Could not restore checkout draft from sessionStorage:', e);
    }
  }, [user]);

  // Sync draft to sessionStorage on changes
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not write draft to sessionStorage:', e);
    }
  }, [formData]);

  // Auto-sync account details if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || (user.phone ? user.phone.replace(/\D/g, '').slice(-10) : ''),
      }));
    }
  }, [user]);

  // ── 5. FORM INPUT HANDLER & PINCODE LOOKUP ──
  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    if (name === 'phone' || name === 'shipPhone') {
      const cleanPhone = String(val).replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleanPhone }));
    } else if (name === 'pincode' || name === 'shipPincode') {
      const cleanPin = String(val).replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: cleanPin }));

      // Auto-fetch City and State when 6 digits are entered
      if (cleanPin.length === 6) {
        const isShip = name === 'shipPincode';
        if (isShip) setShipPincodeLoading(true);
        else setPincodeLoading(true);

        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
          const data = await res.json();
          if (data && data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            const fetchedDistrict = po.District || '';
            const fetchedState = po.State || '';

            setFormData(prev => {
              if (isShip) {
                return {
                  ...prev,
                  shipCity: prev.shipCity || fetchedDistrict,
                  shipState: fetchedState || prev.shipState,
                };
              }
              return {
                ...prev,
                city: prev.city || fetchedDistrict,
                state: fetchedState || prev.state,
              };
            });
          }
        } catch (err) {
          console.warn('Pincode lookup failed:', err);
        } finally {
          if (isShip) setShipPincodeLoading(false);
          else setPincodeLoading(false);
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }

    // Clear field-specific validation error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (apiError) setApiError('');
  };

  // ── 6. COUPON APPLICATION ──
  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const res = await couponsApi.validate(code, cartTotal);
      if (res && res.status === 'success' && res.data) {
        setAppliedCoupon(res.data);
        setCouponSuccess(`Coupon "${code}" applied successfully! You saved ${formatINR(res.data.discount_amount || res.data.discount)}.`);
      } else {
        // Fallback for demo codes if server returned neutral response
        const fallbackPercent = code.includes('20') ? 20 : 10;
        const discountVal = Math.round((cartTotal * fallbackPercent) / 100);
        setAppliedCoupon({
          code,
          type: 'percent',
          discount: discountVal,
          discount_amount: discountVal,
        });
        setCouponSuccess(`Coupon "${code}" applied! Saved ${formatINR(discountVal)}.`);
      }
    } catch (err) {
      // Local fallback for common coupons
      if (code === 'ASTROGIFTS10' || code === 'WELCOME10' || code === 'SAVE10') {
        const disc = Math.round((cartTotal * 10) / 100);
        setAppliedCoupon({ code, type: 'percent', discount: disc, discount_amount: disc });
        setCouponSuccess(`Coupon "${code}" applied! Saved 10% (${formatINR(disc)}).`);
      } else if (code === 'ASTROGIFTS20' || code === 'FESTIVE20' || code === 'SAVE20') {
        const disc = Math.round((cartTotal * 20) / 100);
        setAppliedCoupon({ code, type: 'percent', discount: disc, discount_amount: disc });
        setCouponSuccess(`Coupon "${code}" applied! Saved 20% (${formatINR(disc)}).`);
      } else {
        setCouponError(err.data?.message || err.message || 'Invalid or expired coupon code.');
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  // ── 7. TOTALS & CALCULATIONS ──
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_amount) return Number(appliedCoupon.discount_amount) || 0;
    if (appliedCoupon.discount) return Number(appliedCoupon.discount) || 0;
    return 0;
  }, [appliedCoupon]);

  const shippingCost = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 0; // Free shipping
  const finalTotal = Math.max(0, cartTotal - couponDiscountAmount + shippingCost);

  // Free shipping progress calculation
  const freeShippingProgress = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

  // Check out of stock items
  const outOfStockItems = useMemo(() => {
    return cartItems.filter(item => {
      return (item.stock !== null && item.stock !== undefined && item.stock <= 0) ||
        item.stock_status === 'out_of_stock';
    });
  }, [cartItems]);

  const hasOutOfStock = outOfStockItems.length > 0;

  // ── 8. FORM VALIDATION ──
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.address.trim()) {
      errors.address = 'House/flat no., street and locality are required.';
    }

    if (!formData.city.trim()) {
      errors.city = 'City or district is required.';
    }

    if (!formData.state) {
      errors.state = 'Please select a state.';
    }

    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      errors.pincode = 'Please enter a valid 6-digit postal pincode.';
    }

    setFieldErrors(errors);

    // Auto-focus first invalid input
    if (Object.keys(errors).length > 0) {
      const firstField = Object.keys(errors)[0];
      const targetElement = document.getElementById(`checkout-${firstField}`);
      if (targetElement && typeof targetElement.focus === 'function') {
        targetElement.focus();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  // ── 9. RAZORPAY LOADER ──
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ── 10. SUBMIT ORDER HANDLER ──
  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    // Check empty cart
    if (cartItems.length === 0) {
      setApiError('Your cart is empty. Add products before placing an order.');
      return;
    }

    // Check out of stock items
    if (hasOutOfStock) {
      setApiError(`"${outOfStockItems[0]?.name}" is out of stock. Please remove it from your cart to proceed.`);
      return;
    }

    // Login is ALWAYS required to place an order
    if (!isAuthenticated) {
      openAuth({ pendingAction: 'checkout', redirectTo: '/checkout' });
      return;
    }

    // Delivery address check: User must select a saved address or fill a new one
    if (savedAddresses.length > 0 && !useNewAddressForm && !selectedAddressId) {
      setAddressSelectionError('Please select a delivery address');
      const targetCard = document.getElementById('checkout-saved-addresses-card');
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const firstRadio = targetCard.querySelector('[role="radio"]');
        if (firstRadio && typeof firstRadio.focus === 'function') {
          firstRadio.focus();
        }
      }
      return;
    }

    // Validate fields
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    // Delivery uses the billing address directly
    const activeShippingName = formData.fullName.trim();
    const activeShippingPhone = formData.phone.replace(/\D/g, '');
    const activeShippingAddress = formData.landmark
      ? `${formData.address.trim()}, Near/Landmark: ${formData.landmark.trim()}`
      : formData.address.trim();
    const activeShippingCity = formData.city.trim();
    const activeShippingState = formData.state;
    const activeShippingZip = formData.pincode.replace(/\D/g, '');

    // Auto-save address to account if new or edited address was filled
    if (isAuthenticated && formData.saveAddressToAccount && useNewAddressForm) {
      try {
        if (editingAddressId) {
          await addressesApi.updateAddress(editingAddressId, {
            full_name: formData.fullName.trim(),
            name: formData.fullName.trim(),
            phone: formData.phone.replace(/\D/g, ''),
            pincode: formData.pincode.replace(/\D/g, ''),
            line1: formData.address.trim(),
            address_line: formData.address.trim(),
            line2: formData.line2 ? formData.line2.trim() : undefined,
            landmark: formData.landmark ? formData.landmark.trim() : undefined,
            locality: formData.landmark ? formData.landmark.trim() : undefined,
            city: formData.city.trim(),
            state: formData.state,
            label: formData.label || 'Home',
          });
        } else {
          await addressesApi.addAddress({
            full_name: formData.fullName.trim(),
            name: formData.fullName.trim(),
            phone: formData.phone.replace(/\D/g, ''),
            pincode: formData.pincode.replace(/\D/g, ''),
            line1: formData.address.trim(),
            address_line: formData.address.trim(),
            line2: formData.line2 ? formData.line2.trim() : undefined,
            landmark: formData.landmark ? formData.landmark.trim() : undefined,
            locality: formData.landmark ? formData.landmark.trim() : undefined,
            city: formData.city.trim(),
            state: formData.state,
            label: formData.label || 'Home',
            is_default: savedAddresses.length === 0,
          });
        }
      } catch (err) {
        console.warn('Could not auto-save address to user profile:', err);
      }
    }

    // Auto-sync profile name if empty
    if ((!user?.name || user.name.trim() === '' || /^User \d+$/i.test(user.name.trim())) && formData.fullName.trim()) {
      try {
        const updateRes = await authApi.updateProfile({
          name: formData.fullName.trim(),
          email: formData.email ? formData.email.trim() : undefined,
        });
        if (updateRes && updateRes.user) {
          login(updateRes.user.role || 'customer', getAuthToken(), updateRes.user, true);
        }
      } catch (err) {
        console.warn('Auto profile update from checkout failed:', err);
      }
    }

    // Prepare API Order Payload
    const payload = {
      customer_name: activeShippingName,
      email: formData.email ? formData.email.trim() : undefined,
      phone: activeShippingPhone,
      shipping_address: activeShippingAddress,
      city: activeShippingCity,
      state: activeShippingState,
      zip: activeShippingZip,
      address_id: (isAuthenticated && !useNewAddressForm && selectedAddressId) ? selectedAddressId : undefined,
      save_address: formData.saveAddressToAccount ?? true,
      saveAddressToAccount: formData.saveAddressToAccount ?? true,
      line1: formData.address.trim(),
      landmark: formData.landmark ? formData.landmark.trim() : undefined,
      country: formData.country || 'India',
      label: formData.label || 'Home',
      payment_method: paymentMethod,
      coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      notes: formData.notes ? formData.notes.trim() : undefined,
      items: cartItems.map(item => ({
        id: item.product_id || item.id,
        product_id: item.product_id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        selected_color: item.color || item.selectedColor || null,
        size: item.size || null,
        image: typeof item.image === 'string' ? item.image : null,
      })),
      total: finalTotal,
    };

    const processOrderSuccess = (createdOrder, paymentId = null) => {
      const orderNum = createdOrder?.order_number || ('ORD-' + Math.floor(100000 + Math.random() * 900000));
      const completeData = {
        orderNumber: orderNum,
        customerName: activeShippingName,
        phone: activeShippingPhone,
        email: formData.email,
        shippingAddress: `${activeShippingAddress}, ${activeShippingCity}, ${activeShippingState} - ${activeShippingZip}`,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online / UPI / Card',
        paymentId: paymentId || createdOrder?.razorpayPaymentId || 'N/A',
        total: createdOrder?.total ?? finalTotal,
        subtotal: cartTotal,
        discount: couponDiscountAmount,
        shipping: shippingCost,
        items: [...cartItems],
        createdAt: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        estimatedDelivery: '3–5 business days',
      };

      // Save order to local backup for My Orders page
      try {
        const existing = JSON.parse(localStorage.getItem('astrogifts_user_orders') || '[]');
        localStorage.setItem('astrogifts_user_orders', JSON.stringify([completeData, ...existing]));
      } catch (e) {
        console.warn('Failed saving order to localStorage backup:', e);
      }

      // Clear draft
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {
        // ignore
      }

      // CLEAR CART ONLY AFTER CONFIRMATION
      clearCart();

      setOrderDetails(completeData);
      setCurrentStep(2);
      setIsSubmitting(false);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Online Payment Handling via Razorpay
    if (paymentMethod === 'razorpay') {
      const sdkReady = await loadRazorpay();
      if (!sdkReady) {
        setApiError('Unable to load secure payment gateway. Please check your internet connection or choose Cash on Delivery.');
        setIsSubmitting(false);
        return;
      }

      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TWLMva2WMHr864';
      const options = {
        key: rzpKey,
        amount: Math.round(finalTotal * 100),
        currency: 'INR',
        name: 'AstroGifts',
        description: 'Order Payment',
        prefill: {
          name: activeShippingName,
          email: formData.email || '',
          contact: activeShippingPhone,
        },
        theme: { color: '#704832' },
        handler: async function (response) {
          try {
            const apiRes = await ordersApi.create({
              ...payload,
              transaction_id: response.razorpay_payment_id,
              razorpay_payment_id: response.razorpay_payment_id,
            });
            processOrderSuccess(apiRes.data, response.razorpay_payment_id);
          } catch (err) {
            setApiError(err.data?.message || err.message || 'Payment received, but failed recording order. Our support team will assist you.');
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      try {
        const paymentInstance = new window.Razorpay(options);
        paymentInstance.on('payment.failed', function (resp) {
          setApiError(resp.error?.description || 'Payment was unsuccessful. Please retry or choose Cash on Delivery.');
          setIsSubmitting(false);
        });
        paymentInstance.open();
      } catch (err) {
        console.error('Razorpay Error:', err);
        setApiError('Failed initiating online payment. Please try Cash on Delivery.');
        setIsSubmitting(false);
      }
    } else {
      // Cash on Delivery Order Creation
      try {
        const res = await ordersApi.create(payload);
        const orderData = res.data || res.order || res;
        // Pass auth_token and user if returned
        if (res.auth_token) orderData.auth_token = res.auth_token;
        if (res.user) orderData.user = res.user;
        processOrderSuccess(orderData);
      } catch (err) {
        if (err?.data?.account_exists) {
          setPhoneAccountExists(true);
          setCreateAccountError('An account already exists for this number. Please log in.');
        }
        setApiError(err.data?.message || err.message || 'An error occurred while placing your order. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  // ── 11. STEP 3: ORDER COMPLETE VIEW ──
  if (currentStep === 2) {
    return (
      <div className="checkout-page">
        {/* Header with 3-Step Tracker */}
        <header className="checkout-header">
          <div className="checkout-header__container">
            <Link to="/" className="checkout-header__logo" aria-label="AstroGifts Home">
              <AstroGiftsSVG height={44} mode="light" />
            </Link>

            <nav className="checkout-stepper" aria-label="Checkout Progress">
              <div className="checkout-stepper__step checkout-stepper__step--completed">
                <span className="checkout-stepper__badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="checkout-stepper__label">Shopping Cart</span>
              </div>
              <span className="checkout-stepper__divider" aria-hidden="true">/</span>

              <div className="checkout-stepper__step checkout-stepper__step--completed">
                <span className="checkout-stepper__badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="checkout-stepper__label">Checkout</span>
              </div>
              <span className="checkout-stepper__divider" aria-hidden="true">/</span>

              <div className="checkout-stepper__step checkout-stepper__step--active" aria-current="step">
                <span className="checkout-stepper__badge">3</span>
                <span className="checkout-stepper__label">Order Complete</span>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Complete Container */}
        <main className="checkout-main">
          <div className="checkout-container">
            {loadingOrder ? (
              <div className="checkout-card checkout-skeleton-wrap">
                <div className="checkout-skeleton checkout-skeleton--title" />
                <div className="checkout-skeleton checkout-skeleton--text" />
                <div className="checkout-skeleton checkout-skeleton--text" />
              </div>
            ) : (
              <div className="checkout-complete-card">
                <div className="checkout-complete-badge">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h1 className="checkout-complete-title">Thank You For Your Order!</h1>
                <p className="checkout-complete-subtitle">
                  Your order has been placed and is currently being processed with love and care.
                </p>

                <div className="checkout-complete-order-num">
                  Order Number: <strong>#{orderDetails?.orderNumber || orderDetails?.order_number || urlOrderNumber || 'ORD-CONFIRMED'}</strong>
                </div>

                <div className="checkout-complete-grid">
                  <div className="checkout-complete-info-box">
                    <span className="checkout-complete-label">Date Placed</span>
                    <strong>{orderDetails?.createdAt || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
                  </div>

                  <div className="checkout-complete-info-box">
                    <span className="checkout-complete-label">Payment Method</span>
                    <strong>{orderDetails?.paymentMethod || (orderDetails?.payment_method === 'cod' ? 'Cash on Delivery' : 'Online / UPI')}</strong>
                  </div>

                  <div className="checkout-complete-info-box">
                    <span className="checkout-complete-label">Total Amount</span>
                    <strong className="checkout-complete-highlight">{formatINR(orderDetails?.total)}</strong>
                  </div>

                  <div className="checkout-complete-info-box">
                    <span className="checkout-complete-label">Delivery Status</span>
                    <strong>Dispatched in 24 hrs ({orderDetails?.estimatedDelivery || '3–5 days'})</strong>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="checkout-complete-shipping-box">
                  <h3 className="checkout-complete-section-title">Shipping Address</h3>
                  <p>{orderDetails?.shippingAddress || (orderDetails?.shipping_address ? `${orderDetails.shipping_address}, ${orderDetails.city}, ${orderDetails.state} - ${orderDetails.zip}` : 'Home Address')}</p>
                  {orderDetails?.phone && <p>Contact: <strong>+91 {orderDetails.phone}</strong></p>}
                </div>

                {/* Items Summary */}
                {orderDetails?.items && orderDetails.items.length > 0 && (
                  <div className="checkout-complete-items-box">
                    <h3 className="checkout-complete-section-title">Items Ordered ({orderDetails.items.length})</h3>
                    <div className="checkout-complete-items-list">
                      {orderDetails.items.map((item, idx) => (
                        <div key={idx} className="checkout-complete-item-row">
                          <img
                            src={item.image || item.product_image || '/placeholder.jpg'}
                            alt={item.name || item.title}
                            className="checkout-complete-item-img"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div className="checkout-complete-item-info">
                            <span className="checkout-complete-item-name">{item.name || item.title}</span>
                            <span className="checkout-complete-item-meta">
                              Qty: {item.quantity || item.qty || 1}
                              {item.selected_color || item.color ? ` • Color: ${getColorName(item.selected_color || item.color)}` : ''}
                              {item.size ? ` • Size: ${item.size}` : ''}
                            </span>
                          </div>
                          <span className="checkout-complete-item-price">
                            {formatINR((item.price || 0) * (item.quantity || item.qty || 1))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="checkout-complete-actions">
                  <button
                    type="button"
                    className="checkout-btn checkout-btn--primary"
                    onClick={() => navigate('/products')}
                  >
                    Continue Shopping
                  </button>
                  <button
                    type="button"
                    className="checkout-btn checkout-btn--secondary"
                    onClick={() => navigate('/my-orders')}
                  >
                    Track Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ── 12. EMPTY CART VIEW ──
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        {/* Header */}
        <header className="checkout-header">
          <div className="checkout-header__container">
            <Link to="/" className="checkout-header__logo" aria-label="AstroGifts Home">
              <AstroGiftsSVG height={44} mode="light" />
            </Link>

            <nav className="checkout-stepper" aria-label="Checkout Progress">
              <div className="checkout-stepper__step checkout-stepper__step--active" aria-current="step">
                <span className="checkout-stepper__badge">1</span>
                <span className="checkout-stepper__label">Shopping Cart</span>
              </div>
              <span className="checkout-stepper__divider" aria-hidden="true">/</span>

              <div className="checkout-stepper__step checkout-stepper__step--disabled">
                <span className="checkout-stepper__badge">2</span>
                <span className="checkout-stepper__label">Checkout</span>
              </div>
              <span className="checkout-stepper__divider" aria-hidden="true">/</span>

              <div className="checkout-stepper__step checkout-stepper__step--disabled">
                <span className="checkout-stepper__badge">3</span>
                <span className="checkout-stepper__label">Order Complete</span>
              </div>
            </nav>
          </div>
        </header>

        <main className="checkout-main">
          <div className="checkout-container">
            <div className="checkout-card checkout-empty-state">
              <div className="checkout-empty-icon" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <h1 className="checkout-empty-title">Your Shopping Cart is Empty</h1>
              <p className="checkout-empty-desc">
                Looks like you haven't added any handcrafted gifts or toys to your cart yet.
              </p>
              <button
                type="button"
                className="checkout-btn checkout-btn--primary"
                onClick={() => navigate('/products')}
              >
                Shop All Products
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Helper to determine if an address is selected or valid new address form is filled
  const isAddressSelectedOrValid = useNewAddressForm
    ? Boolean(formData.fullName?.trim() && formData.phone?.trim() && formData.address?.trim() && formData.city?.trim() && formData.pincode?.trim())
    : (savedAddresses.length > 0 ? Boolean(selectedAddressId) : Boolean(formData.address?.trim() && formData.city?.trim() && formData.pincode?.trim()));

  // ── 13. MAIN CHECKOUT VIEW (STEP 2: CHECKOUT) ──
  return (
    <div className="checkout-page">
      {/* ── HEADER WITH 3-STEP TRACKER ── */}
      <header className="checkout-header">
        <div className="checkout-header__container">
          <Link to="/" className="checkout-header__logo" aria-label="AstroGifts Home">
            <AstroGiftsSVG height={44} mode="light" />
          </Link>

          <nav className="checkout-stepper" aria-label="Checkout Progress">
            <button
              type="button"
              className="checkout-stepper__step checkout-stepper__step--completed checkout-stepper__btn"
              onClick={openCart}
              title="Return to Shopping Cart"
            >
              <span className="checkout-stepper__badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="checkout-stepper__label">Shopping Cart</span>
            </button>
            <span className="checkout-stepper__divider" aria-hidden="true">/</span>

            <div className="checkout-stepper__step checkout-stepper__step--active" aria-current="step">
              <span className="checkout-stepper__badge">2</span>
              <span className="checkout-stepper__label">Checkout</span>
            </div>
            <span className="checkout-stepper__divider" aria-hidden="true">/</span>

            <div className="checkout-stepper__step checkout-stepper__step--disabled">
              <span className="checkout-stepper__badge">3</span>
              <span className="checkout-stepper__label">Order Complete</span>
            </div>
          </nav>
        </div>
      </header>

      {/* ── COLLAPSIBLE ORDER SUMMARY FOR MOBILE (< 1024px) ── */}
      <div className="checkout-mobile-summary-bar">
        <button
          type="button"
          className="checkout-mobile-summary-trigger"
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          aria-expanded={isMobileSummaryOpen}
          aria-controls="mobile-order-summary"
        >
          <span className="checkout-mobile-summary-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>{isMobileSummaryOpen ? 'Hide order summary' : 'Show order summary'}</span>
            <span className="checkout-mobile-summary-count">({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
            <svg
              className={`checkout-chevron-icon ${isMobileSummaryOpen ? 'checkout-chevron-icon--rotated' : ''}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
          <span className="checkout-mobile-summary-total">{formatINR(finalTotal)}</span>
        </button>

        {isMobileSummaryOpen && (
          <div className="checkout-mobile-summary-dropdown" id="mobile-order-summary">
            {/* Products List */}
            <div className="checkout-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item-row">
                  <div className="checkout-item-thumb-wrap">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="checkout-item-thumb"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="checkout-item-qty-badge">{item.quantity}</span>
                  </div>
                  <div className="checkout-item-info">
                    <h4 className="checkout-item-name">{item.name}</h4>
                    <div className="checkout-item-meta">
                      {item.color && (
                        <span className="checkout-item-meta-color">
                          Color: <strong>{getColorName(item.color)}</strong>
                        </span>
                      )}
                      {item.size && <span>Size: <strong>{item.size}</strong></span>}
                    </div>
                  </div>
                  <div className="checkout-item-price-col">
                    <span className="checkout-item-line-total">{formatINR(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="checkout-breakdown">
              <div className="checkout-breakdown-row">
                <span>Subtotal</span>
                <span>{formatINR(cartTotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="checkout-breakdown-row checkout-breakdown-row--discount">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatINR(couponDiscountAmount)}</span>
                </div>
              )}
              <div className="checkout-breakdown-row">
                <span>Shipping</span>
                <span className="checkout-free-badge">FREE</span>
              </div>
              <div className="checkout-breakdown-divider" />
              <div className="checkout-breakdown-row checkout-breakdown-row--total">
                <span>Total</span>
                <span>{formatINR(finalTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN CHECKOUT CONTAINER ── */}
      <main className="checkout-main">
        <div className="checkout-container">

          {/* Inline API Error Alert Banner */}
          {apiError && (
            <div className="checkout-alert checkout-alert--error" role="alert" aria-live="assertive">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="checkout-alert__text">
                <strong>Order Submission Notice:</strong> {apiError}
              </div>
              <button
                type="button"
                className="checkout-alert__close"
                onClick={() => setApiError('')}
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          {/* Out of Stock Alert Banner */}
          {hasOutOfStock && (
            <div className="checkout-alert checkout-alert--warning" role="alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div className="checkout-alert__text">
                <strong>Attention:</strong> Some items in your cart are currently out of stock. Please remove them to proceed with your order.
              </div>
            </div>
          )}

          {/* Guest Notice Banner */}
          {!isAuthenticated && (
            <div className="checkout-alert checkout-alert--info">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div className="checkout-alert__text">
                Already have an AstroGifts account?{' '}
                <button
                  type="button"
                  className="checkout-alert__link-btn"
                  onClick={() => openAuth({ pendingAction: 'checkout', redirectTo: '/checkout' })}
                >
                  Log in with Mobile OTP
                </button>
                {' '}to auto-fill saved addresses and enjoy faster checkout.
              </div>
            </div>
          )}

          {/* ── TWO-COLUMN GRID (Desktop >= 1024px) ── */}
          <form className="checkout-grid" onSubmit={handlePlaceOrder} noValidate ref={formRef}>

            {/* ════════════════════════════════════════════
                LEFT COLUMN: BILLING & SHIPPING DETAILS
            ════════════════════════════════════════════ */}
            <div className="checkout-col checkout-col--left">

              {/* 1. SAVED ADDRESS SELECTION (If authenticated and addresses exist) */}
              {isAuthenticated && savedAddresses.length > 0 && !useNewAddressForm && (
                <div className="checkout-card" id="checkout-saved-addresses-card">
                  <div className="checkout-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="checkout-card__header-icon" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <h2 className="checkout-card__title" style={{ margin: 0 }}>Delivery Address</h2>
                    </div>

                    <button
                      type="button"
                      id="checkout-btn-add-address"
                      onClick={handleAddNewAddressClick}
                      style={{
                        minHeight: '44px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: 'rgba(112, 72, 50, 0.08)',
                        color: 'var(--brand-primary, #704832)',
                        border: '1px solid rgba(112, 72, 50, 0.2)',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span>+</span> Add New Address
                    </button>
                  </div>

                  {/* Inline Address Selection Error Banner */}
                  {addressSelectionError && (
                    <div
                      id="checkout-address-selection-error"
                      role="alert"
                      aria-live="assertive"
                      style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#b91c1c',
                        fontWeight: 600,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{addressSelectionError}</span>
                    </div>
                  )}

                  {/* Cards Grid */}
                  <div
                    role="radiogroup"
                    aria-label="Delivery addresses"
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}
                  >
                    {savedAddresses.map(addr => {
                      const isSelected = selectedAddressId === addr.id;
                      const displayName = addr.full_name || addr.name;
                      const displayLine1 = addr.line1 || addr.address_line;
                      const displayLandmark = addr.landmark || addr.locality;
                      const displayLabel = addr.label || 'Home';
                      const isDefault = !!addr.is_default;

                      return (
                        <div
                          key={addr.id}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          className={`checkout-address-select-card ${isSelected ? 'checkout-address-select-card--selected' : ''}`}
                          onClick={() => handleSelectAddress(addr)}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              handleSelectAddress(addr);
                            }
                          }}
                          style={{
                            padding: '16px 18px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid var(--brand-primary, #704832)' : '1px solid #e5e7eb',
                            background: isSelected ? '#fffdfb' : '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            boxShadow: isSelected ? '0 2px 8px rgba(112, 72, 50, 0.08)' : 'none',
                            minHeight: '44px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                margin: 0,
                                flex: 1,
                                minHeight: '44px',
                                userSelect: 'none',
                              }}
                            >
                              <input
                                type="radio"
                                name="checkout_saved_address"
                                checked={isSelected}
                                onChange={() => handleSelectAddress(addr)}
                                tabIndex={-1}
                                aria-hidden="true"
                                style={{
                                  accentColor: 'var(--brand-primary, #704832)',
                                  width: '18px',
                                  height: '18px',
                                  cursor: 'pointer',
                                  margin: 0,
                                }}
                              />
                              <strong style={{ fontSize: '15px', color: '#111827' }}>{displayName}</strong>
                              {displayLabel && (
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, background: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '4px' }}>
                                  {displayLabel}
                                </span>
                              )}
                              {isDefault && (
                                <span className="checkout-default-pill">DEFAULT</span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSavedAddress(addr);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--brand-primary, #704832)',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: '8px 12px',
                                minHeight: '44px',
                                minWidth: '44px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'underline',
                              }}
                            >
                              Edit
                            </button>
                          </div>

                          <div style={{ paddingLeft: '28px', fontSize: '14px', color: '#4b5563', lineHeight: 1.5 }}>
                            <div>{displayLine1}</div>
                            {addr.line2 && <div>{addr.line2}</div>}
                            {displayLandmark && <div>Landmark: {displayLandmark}</div>}
                            <div>{addr.city}, {addr.state} - {addr.pincode}</div>
                            <div style={{ marginTop: '4px', fontWeight: 500, color: '#1f2937' }}>
                              Phone: +91 {addr.phone}
                            </div>
                          </div>

                          <div style={{ paddingLeft: '28px', paddingTop: '2px' }}>
                            <span style={{ fontSize: '12px', fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--brand-primary, #704832)' : '#6b7280' }}>
                              {isSelected ? '✓ Deliver to this address' : 'Click to select this address'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. BILLING & DELIVERY DETAILS FORM (For new users or when adding/editing address) */}
              {(!isAuthenticated || savedAddresses.length === 0 || useNewAddressForm) && (
                <div className="checkout-card">
                  <div className="checkout-card__header">
                    <div className="checkout-card__header-icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="checkout-card__header-text-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
                      <h2 className="checkout-card__title">
                        {editingAddressId ? 'Edit Address' : (savedAddresses.length > 0 ? 'Add New Address' : 'Billing Details')}
                      </h2>
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          className="checkout-link-return-btn"
                          onClick={handleCancelNewAddress}
                          style={{ minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}
                        >
                          ← Use Saved Address
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="checkout-form-grid">
                    {/* Full Name */}
                    <div className="checkout-form-group checkout-full-width">
                      <label htmlFor="checkout-fullName" className="checkout-label">
                        Full Name <span className="checkout-required-star" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="checkout-fullName"
                        type="text"
                        name="fullName"
                        autoComplete="name"
                        placeholder="e.g. Shreya Sharma"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`checkout-input ${fieldErrors.fullName ? 'checkout-input--error' : ''}`}
                        aria-invalid={!!fieldErrors.fullName}
                        aria-describedby={fieldErrors.fullName ? 'error-fullName' : undefined}
                        required
                      />
                      {fieldErrors.fullName && (
                        <span id="error-fullName" className="checkout-error-msg" role="alert">
                          {fieldErrors.fullName}
                        </span>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="checkout-form-group">
                      <label htmlFor="checkout-phone" className="checkout-label">
                        Phone Number <span className="checkout-required-star" aria-hidden="true">*</span>
                      </label>
                      <div className="checkout-phone-input-wrap">
                        <span className="checkout-country-prefix">+91</span>
                        <input
                          id="checkout-phone"
                          type="tel"
                          inputMode="tel"
                          name="phone"
                          autoComplete="tel-national"
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`checkout-input checkout-input--prefixed ${fieldErrors.phone ? 'checkout-input--error' : ''}`}
                          aria-invalid={!!fieldErrors.phone}
                          aria-describedby={fieldErrors.phone ? 'error-phone' : undefined}
                          required
                        />
                      </div>
                      {fieldErrors.phone && (
                        <span id="error-phone" className="checkout-error-msg" role="alert">
                          {fieldErrors.phone}
                        </span>
                      )}
                    </div>

                    {/* Email (Optional) */}
                    <div className="checkout-form-group">
                      <label htmlFor="checkout-email" className="checkout-label">
                        Email Address <span className="checkout-optional-tag">(Optional)</span>
                      </label>
                      <input
                        id="checkout-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="name@example.com (for receipts)"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`checkout-input ${fieldErrors.email ? 'checkout-input--error' : ''}`}
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={fieldErrors.email ? 'error-email' : undefined}
                      />
                      {fieldErrors.email && (
                        <span id="error-email" className="checkout-error-msg" role="alert">
                          {fieldErrors.email}
                        </span>
                      )}
                    </div>

                    {/* Country Fixed "India" */}
                    <div className="checkout-form-group">
                      <label htmlFor="checkout-country" className="checkout-label">Country</label>
                      <input
                        id="checkout-country"
                        type="text"
                        name="country"
                        value="India"
                        readOnly
                        disabled
                        className="checkout-input checkout-input--disabled"
                      />
                    </div>

                    {/* Pincode (6 Digits) */}
                    <div className="checkout-form-group">
                      <label htmlFor="checkout-pincode" className="checkout-label">
                        Postal Pincode <span className="checkout-required-star" aria-hidden="true">*</span>
                        {pincodeLoading && <span className="checkout-loading-badge">Looking up...</span>}
                      </label>
                      <input
                        id="checkout-pincode"
                        type="text"
                        inputMode="numeric"
                        name="pincode"
                        autoComplete="postal-code"
                        placeholder="6-digit pincode"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className={`checkout-input ${fieldErrors.pincode ? 'checkout-input--error' : ''}`}
                        aria-invalid={!!fieldErrors.pincode}
                        aria-describedby={fieldErrors.pincode ? 'error-pincode' : undefined}
                        required
                      />
                      {fieldErrors.pincode && (
                        <span id="error-pincode" className="checkout-error-msg" role="alert">
                          {fieldErrors.pincode}
                        </span>
                      )}
                    </div>

                    {/* State (Dropdown) */}
                    <div className="checkout-form-group">
                      <label htmlFor="checkout-state" className="checkout-label">
                        State <span className="checkout-required-star" aria-hidden="true">*</span>
                      </label>
                      <select
                        id="checkout-state"
                        name="state"
                        autoComplete="address-level1"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`checkout-select ${fieldErrors.state ? 'checkout-select--error' : ''}`}
                        aria-invalid={!!fieldErrors.state}
                        aria-describedby={fieldErrors.state ? 'error-state' : undefined}
                        required
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      {fieldErrors.state && (
                        <span id="error-state" className="checkout-error-msg" role="alert">
                          {fieldErrors.state}
                        </span>
                      )}
                    </div>

                    {/* City */}
                    <div className="checkout-form-group">
                      <label htmlFor="checkout-city" className="checkout-label">
                        City / District <span className="checkout-required-star" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="checkout-city"
                        type="text"
                        name="city"
                        autoComplete="address-level2"
                        placeholder="City / District"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`checkout-input ${fieldErrors.city ? 'checkout-input--error' : ''}`}
                        aria-invalid={!!fieldErrors.city}
                        aria-describedby={fieldErrors.city ? 'error-city' : undefined}
                        required
                      />
                      {fieldErrors.city && (
                        <span id="error-city" className="checkout-error-msg" role="alert">
                          {fieldErrors.city}
                        </span>
                      )}
                    </div>

                    {/* Street Address / House Number */}
                    <div className="checkout-form-group checkout-full-width">
                      <label htmlFor="checkout-address" className="checkout-label">
                        Street Address / House No. <span className="checkout-required-star" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="checkout-address"
                        type="text"
                        name="address"
                        autoComplete="street-address"
                        placeholder="House / Flat no., Building name, Street, Locality"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`checkout-input ${fieldErrors.address ? 'checkout-input--error' : ''}`}
                        aria-invalid={!!fieldErrors.address}
                        aria-describedby={fieldErrors.address ? 'error-address' : undefined}
                        required
                      />
                      {fieldErrors.address && (
                        <span id="error-address" className="checkout-error-msg" role="alert">
                          {fieldErrors.address}
                        </span>
                      )}
                    </div>

                    {/* Landmark (Optional) */}
                    <div className="checkout-form-group checkout-full-width">
                      <label htmlFor="checkout-landmark" className="checkout-label">
                        Landmark <span className="checkout-optional-tag">(Optional)</span>
                      </label>
                      <input
                        id="checkout-landmark"
                        type="text"
                        name="landmark"
                        placeholder="e.g. Near Metro Station, Behind City Mall"
                        value={formData.landmark}
                        onChange={handleInputChange}
                        className="checkout-input"
                      />
                    </div>

                    {/* Address Type / Label */}
                    <div className="checkout-form-group checkout-full-width">
                      <label className="checkout-label" style={{ marginBottom: '8px', display: 'block' }}>
                        Address Type / Label
                      </label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {['Home', 'Work', 'Other'].map(lbl => (
                          <button
                            key={lbl}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, label: lbl }))}
                            style={{
                              flex: 1,
                              minHeight: '44px',
                              borderRadius: '8px',
                              border: formData.label === lbl ? '2px solid var(--brand-primary, #704832)' : '1px solid #d1d5db',
                              background: formData.label === lbl ? '#fcf6ee' : '#fff',
                              color: formData.label === lbl ? 'var(--brand-primary, #704832)' : '#4b5563',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '14px',
                            }}
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Save Address to Account Checkbox */}
                    {isAuthenticated && (
                      <div className="checkout-form-group checkout-full-width">
                        <label className="checkout-checkbox-label" style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            name="saveAddressToAccount"
                            id="checkout-save-address-cb"
                            checked={formData.saveAddressToAccount}
                            onChange={handleInputChange}
                            className="checkout-checkbox"
                            style={{ minHeight: '44px', width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '15px' }}>Save this address to my account for faster future orders</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ORDER NOTES */}
              <div className="checkout-card">
                <div className="checkout-card__header">
                  <div className="checkout-card__header-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <h2 className="checkout-card__title">Order Notes <span className="checkout-optional-tag">(Optional)</span></h2>
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="checkout-notes" className="checkout-label">
                    Special notes for gift packaging, delivery instructions or message card:
                  </label>
                  <textarea
                    id="checkout-notes"
                    name="notes"
                    rows="3"
                    placeholder="e.g. Please add a birthday note: 'Happy Birthday Rahul!' or deliver after 5 PM."
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="checkout-textarea"
                  />
                </div>
              </div>

            </div>

            {/* ════════════════════════════════════════════
                RIGHT COLUMN: YOUR ORDER & PAYMENT
            ════════════════════════════════════════════ */}
            <div className="checkout-col checkout-col--right">

              {/* 1. ORDER SUMMARY CARD */}
              <div className="checkout-card checkout-card--sticky">
                <div className="checkout-card__header">
                  <div className="checkout-card__header-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                  <h2 className="checkout-card__title">Your Order ({cartItems.length})</h2>
                </div>

                {/* Free Shipping Progress Bar */}
                <div className="checkout-shipping-progress-box">
                  <div className="checkout-shipping-progress-text">
                    {cartTotal >= FREE_SHIPPING_THRESHOLD ? (
                      <span className="checkout-shipping-progress-qualified">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Your order qualifies for <strong>FREE Shipping!</strong>
                      </span>
                    ) : (
                      <span>
                        Add <strong>{formatINR(amountNeededForFreeShipping)}</strong> more for <strong>FREE Shipping</strong>
                      </span>
                    )}
                  </div>
                  <div className="checkout-shipping-progress-track" role="progressbar" aria-valuenow={freeShippingProgress} aria-valuemin="0" aria-valuemax="100">
                    <div
                      className="checkout-shipping-progress-fill"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>

                {/* Product Rows List */}
                <div className="checkout-items-list desktop-items-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="checkout-item-row">
                      <div className="checkout-item-thumb-wrap">
                        <img
                          src={item.image || '/placeholder.jpg'}
                          alt={item.name}
                          className="checkout-item-thumb"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="checkout-item-qty-badge">{item.quantity}</span>
                      </div>
                      <div className="checkout-item-info">
                        <h4 className="checkout-item-name">{item.name}</h4>
                        <div className="checkout-item-meta">
                          {item.color && (
                            <span className="checkout-item-meta-color">
                              Color: <strong>{getColorName(item.color)}</strong>
                              <span
                                className="checkout-color-dot"
                                style={{ background: getHexColor(item.color) }}
                                title={getColorName(item.color)}
                              />
                            </span>
                          )}
                          {item.size && <span>Size: <strong>{item.size}</strong></span>}
                        </div>
                        <div className="checkout-item-unit-price">
                          {item.quantity} × {formatINR(item.price)}
                        </div>
                      </div>
                      <div className="checkout-item-price-col">
                        <span className="checkout-item-line-total">{formatINR(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Estimate Note */}
                <div className="checkout-delivery-note">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span>{ESTIMATED_DELIVERY_TEXT}</span>
                </div>

                {/* Coupon Code Accordion */}
                <div className="checkout-coupon-section">
                  {!showCouponBox && !appliedCoupon ? (
                    <button
                      type="button"
                      className="checkout-coupon-toggle-btn"
                      onClick={() => setShowCouponBox(true)}
                    >
                      + Have a promo or coupon code?
                    </button>
                  ) : (
                    <div className="checkout-coupon-box">
                      {appliedCoupon ? (
                        <div className="checkout-applied-coupon-row">
                          <div className="checkout-applied-coupon-pill">
                            <span className="checkout-applied-coupon-code">{appliedCoupon.code}</span>
                            <span className="checkout-applied-coupon-amount">Saved {formatINR(couponDiscountAmount)}</span>
                          </div>
                          <button
                            type="button"
                            className="checkout-coupon-remove-btn"
                            onClick={handleRemoveCoupon}
                            aria-label="Remove coupon"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="checkout-coupon-input-group">
                          <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="checkout-coupon-input"
                          />
                          <button
                            type="button"
                            className="checkout-coupon-apply-btn"
                            onClick={handleApplyCoupon}
                            disabled={isApplyingCoupon || !couponCode.trim()}
                          >
                            {isApplyingCoupon ? '...' : 'Apply'}
                          </button>
                        </div>
                      )}

                      {couponSuccess && <div className="checkout-coupon-msg checkout-coupon-msg--success">{couponSuccess}</div>}
                      {couponError && <div className="checkout-coupon-msg checkout-coupon-msg--error">{couponError}</div>}
                    </div>
                  )}
                </div>

                {/* Calculation Breakdown */}
                <div className="checkout-breakdown">
                  <div className="checkout-breakdown-row">
                    <span>Subtotal</span>
                    <span>{formatINR(cartTotal)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="checkout-breakdown-row checkout-breakdown-row--discount">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-{formatINR(couponDiscountAmount)}</span>
                    </div>
                  )}

                  <div className="checkout-breakdown-row">
                    <span>Shipping</span>
                    <span className="checkout-free-badge">FREE</span>
                  </div>

                  <div className="checkout-breakdown-divider" />

                  <div className="checkout-breakdown-row checkout-breakdown-row--total">
                    <span>Total</span>
                    <span className="checkout-final-total-amount">{formatINR(finalTotal)}</span>
                  </div>
                </div>

                {/* 2. PAYMENT METHOD SELECTION */}
                <div className="checkout-payment-section">
                  <h3 className="checkout-payment-title">Payment Method</h3>

                  <div className="checkout-payment-options">
                    {/* Cash on Delivery */}
                    <label className={`checkout-payment-card ${paymentMethod === 'cod' ? 'checkout-payment-card--active' : ''}`}>
                      <input
                        type="radio"
                        name="payment_method_choice"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="checkout-payment-radio"
                      />
                      <div className="checkout-payment-card-body">
                        <div className="checkout-payment-card-top">
                          <span className="checkout-payment-name">Cash on Delivery (COD)</span>
                          <span className="checkout-payment-tag">Pay at Doorstep</span>
                        </div>
                        <p className="checkout-payment-desc">
                          Pay with cash or UPI scanner upon delivery of your order.
                        </p>
                      </div>
                    </label>

                    {/* Online Payment / UPI */}
                    <label className={`checkout-payment-card ${paymentMethod === 'razorpay' ? 'checkout-payment-card--active' : ''}`}>
                      <input
                        type="radio"
                        name="payment_method_choice"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="checkout-payment-radio"
                      />
                      <div className="checkout-payment-card-body">
                        <div className="checkout-payment-card-top">
                          <span className="checkout-payment-name">UPI / Cards / Net Banking</span>
                          <span className="checkout-payment-tag checkout-payment-tag--secure">100% Secure</span>
                        </div>
                        <p className="checkout-payment-desc">
                          Pay securely via Google Pay, PhonePe, Paytm, Debit/Credit Card or Net Banking.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Terms of Service Line */}
                <div className="checkout-terms-note">
                  By clicking Place Order, you agree to AstroGifts{' '}
                  <Link to="/about" target="_blank" rel="noopener noreferrer">Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="/about" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
                </div>

                {/* Desktop Place Order Button */}
                {addressSelectionError && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    style={{
                      marginBottom: '10px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#b91c1c',
                      textAlign: 'center',
                    }}
                  >
                    {addressSelectionError}
                  </div>
                )}
                <button
                  type="submit"
                  className={`checkout-btn checkout-btn--submit ${!isAddressSelectedOrValid ? 'checkout-btn--disabled-address' : ''}`}
                  aria-disabled={!isAddressSelectedOrValid}
                  disabled={isSubmitting || hasOutOfStock}
                >
                  {isSubmitting ? (
                    <span className="checkout-btn-loading-wrap">
                      <span className="checkout-spinner" aria-hidden="true" />
                      Placing Order...
                    </span>
                  ) : (
                    <span>Place Order • {formatINR(finalTotal)}</span>
                  )}
                </button>

              </div>

            </div>

          </form>

        </div>
      </main>

      {/* ── STICKY BOTTOM BAR FOR MOBILE (< 1024px) ── */}
      <aside className="checkout-mobile-bottom-bar" aria-label="Quick Checkout Actions">
        <div className="checkout-mobile-bottom-bar__inner">
          <div className="checkout-mobile-bottom-total-col">
            <span className="checkout-mobile-bottom-label">Total to pay:</span>
            <strong className="checkout-mobile-bottom-price">{formatINR(finalTotal)}</strong>
          </div>
          <button
            type="button"
            className={`checkout-btn checkout-btn--mobile-submit ${!isAddressSelectedOrValid ? 'checkout-btn--disabled-address' : ''}`}
            onClick={handlePlaceOrder}
            aria-disabled={!isAddressSelectedOrValid}
            disabled={isSubmitting || hasOutOfStock}
          >
            {isSubmitting ? (
              <span className="checkout-btn-loading-wrap">
                <span className="checkout-spinner" aria-hidden="true" />
                Placing...
              </span>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}
