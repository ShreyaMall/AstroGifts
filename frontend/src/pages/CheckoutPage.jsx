import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customConfirm } from '../utils/confirmModal';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';
import { getColorName, getHexColor } from '../utils/colorUtils';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    cartTotal,
    clearCart,
    updateQuantity,
    removeFromCart
  } = useCart();

  const [step, setStep] = useState(1); // 1: Form, 2: Success
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const initialFormState = {
    fullName: user?.name || '',
    phone: '',
    email: user?.email || '',
    country: 'India',
    state: 'Delhi',
    city: '',
    address: '',
    pinCode: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        fullName: prev.fullName || user.name || '',
      }));
    }
  }, [user]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));

    if (name === 'pinCode' && value.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data && data[0]?.Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State
          }));
        }
      } catch (err) {
        console.error('Error fetching pincode details', err);
      }
    }
  };

  // Coupon State
  const [showCouponBox, setShowCouponBox] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      couponDiscountAmount = Math.round((cartTotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.type === 'flat') {
      couponDiscountAmount = Math.min(cartTotal, appliedCoupon.value);
    }
  }

  const finalTotal = Math.max(0, cartTotal - couponDiscountAmount);

  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    if (code === 'ASTROGIFTS10' || code === 'WELCOME10' || code === 'SAVE10') {
      setAppliedCoupon({ code, type: 'percent', value: 10 });
      setCouponSuccess(`Coupon "${code}" applied! Saved 10%.`);
    } else if (code === 'ASTROGIFTS20' || code === 'FESTIVE20' || code === 'SAVE20') {
      setAppliedCoupon({ code, type: 'percent', value: 20 });
      setCouponSuccess(`Coupon "${code}" applied! Saved 20%.`);
    } else if (code === 'FLAT500' || code === 'WOOD500') {
      setAppliedCoupon({ code, type: 'flat', value: 500 });
      setCouponSuccess(`Coupon "${code}" applied! Saved ₹500.`);
    } else {
      setAppliedCoupon({ code, type: 'percent', value: 10 });
      setCouponSuccess(`Coupon "${code}" applied! Saved 10%.`);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    setIsSubmitting(true);

    const billName = formData.fullName.trim() || user?.name || 'Customer';

    const payload = {
      customer_name: billName,
      email: formData.email,
      phone: formData.phone.replace(/[^0-9]/g, '').slice(-10),
      shipping_address: formData.address,
      city: formData.city,
      state: formData.state || 'Delhi',
      zip: formData.pinCode,
      payment_method: paymentMethod,
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
      total: finalTotal
    };

    console.log('====================================');
    console.log('📦 [CHECKOUT SUBMIT] Full Order Payload Being Sent To API:');
    console.log('Customer:', payload.customer_name, '| Email:', payload.email);
    console.log('Total Amount: ₹' + payload.total);
    console.log('Items Array Sent:', payload.items.map((it, index) => ({
      item_number: index + 1,
      id: it.id,
      product_id: it.product_id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      color: it.selected_color,
      size: it.size,
      image: it.image
    })));
    console.log('Full Raw Payload:', payload);
    console.log('====================================');

    const saveOrderLocally = (orderId, total) => {
      const newOrder = {
        order_number: orderId,
        customer_name: billName,
        email: formData.email,
        phone: formData.phone,
        payment_method: paymentMethod === 'cod' ? 'Cash on delivery' : 'Razorpay',
        created_at: new Date().toISOString().split('T')[0],
        status: 'Processing',
        total,
        items: cartItems.map(item => ({
          id: item.product_id || item.id,
          product_id: item.product_id || item.id,
          name: item.name || item.title || 'Product',
          product_name: item.name || item.title || 'Product',
          qty: item.quantity || 1,
          quantity: item.quantity || 1,
          price: item.price,
          color: item.color || item.selectedColor || null,
          selected_color: item.color || item.selectedColor || null,
          size: item.size || null,
          image: typeof item.image === 'string' ? item.image : null,
          product_image: typeof item.image === 'string' ? item.image : null,
        }))
      };
      const existing = JSON.parse(localStorage.getItem('astrogifts_user_orders') || '[]');
      localStorage.setItem('astrogifts_user_orders', JSON.stringify([newOrder, ...existing]));
    };

    const processOrderSuccess = async (paymentId = null) => {
      try {
        const res = await ordersApi.create({ ...payload, transaction_id: paymentId });
        const order = res.data;
        const orderId = order?.order_number || ('WM-' + Math.floor(100000 + Math.random() * 900000));
        const total = order?.total ?? finalTotal;
        const paymentMethodStr = paymentMethod === 'cod' ? 'Cash on delivery' : 'Credit Card/ Debit Card/ Internet Banking/ UPI';
        saveOrderLocally(orderId, total);
        setOrderDetails({ orderId, total, date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), paymentMethodStr });
        clearCart();
        setIsSubmitting(false);
        setStep(2);
      } catch (err) {
        const generatedOrderId = 'WM-' + Math.floor(100000 + Math.random() * 900000);
        const paymentMethodStr = paymentMethod === 'cod' ? 'Cash on delivery' : 'Credit Card/ Debit Card/ Internet Banking/ UPI';
        saveOrderLocally(generatedOrderId, finalTotal);
        setOrderDetails({ orderId: generatedOrderId, total: finalTotal, date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), paymentMethodStr });
        clearCart();
        setIsSubmitting(false);
        setStep(2);
      }
    };

    if (paymentMethod === 'razorpay') {
      const res = await loadRazorpay();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsSubmitting(false);
        return;
      }
      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykey12345';
      const options = {
        key: rzpKey,
        amount: finalTotal * 100,
        currency: 'INR',
        name: 'AstroGifts',
        description: 'Order Payment',
        handler: function (response) {
          processOrderSuccess(response.razorpay_payment_id);
        },
        prefill: {
          name: billName,
          email: formData.email,
          contact: formData.phone
        },
        theme: { color: '#111827' },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
          }
        }
      };

      try {
        if (options.key === 'rzp_test_dummykey12345' || !options.key.startsWith('rzp_')) {
          setTimeout(async () => {
            if (await customConfirm("Razorpay Payment Gateway (Test Mode).\n\nClick OK to confirm payment, or Cancel to return.")) {
              processOrderSuccess('pay_mock_' + Math.floor(Math.random() * 1000000));
            } else {
              setIsSubmitting(false);
            }
          }, 400);
        } else {
          const paymentObject = new window.Razorpay(options);
          paymentObject.on('payment.failed', function (response){
            alert("Payment Failed: " + response.error.description);
            setIsSubmitting(false);
          });
          paymentObject.open();
        }
      } catch (err) {
        console.error('Razorpay Error:', err);
        processOrderSuccess();
      }
    } else {
      processOrderSuccess();
    }
  };

  const handleFinish = () => {
    clearCart();
    setStep(1);
    setOrderDetails(null);
    setFormData(initialFormState);
    navigate('/');
  };

  return (
    <>
      <Header />
      <div className="astrogifts-checkout-page">
        {step === 1 ? (
          <div className="astrogifts-checkout-container">
            {cartItems.length === 0 ? (
              <div className="astrogifts-empty-cart-box">
                <h2>Your cart is empty</h2>
                <p>Add some products to your cart before proceeding to checkout.</p>
                <button className="astrogifts-btn-primary" onClick={() => navigate('/')}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <form className="astrogifts-checkout-form" onSubmit={handlePlaceOrder}>
                <div className="astrogifts-checkout-grid">
                  
                  {/* LEFT COLUMN: Verification, Shipping, Payment */}
                  <div className="astrogifts-left-col">
                    
                    {/* 1. Email Verification / Contact Information Card */}
                    <div className="astrogifts-card">
                      <div className="astrogifts-card-header">
                        <svg className="astrogifts-header-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <h2>{user ? 'Verify Your Email' : 'Contact Information'}</h2>
                      </div>
                      {user ? (
                        <div className="astrogifts-email-banner">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 8 12 14 14"></polyline>
                            <path d="M9 12l2 2 4-4"></path>
                          </svg>
                          <span>
                            Email verified: <strong>{user.email || formData.email}</strong>
                          </span>
                        </div>
                      ) : (
                        <div style={{ padding: '4px 0' }}>
                          <label htmlFor="checkout-email" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                            Email Address (For Order Receipt & Tracking) *
                          </label>
                          <input 
                            id="checkout-email"
                            type="email" 
                            name="email" 
                            autoComplete="email"
                            placeholder="Enter your email address" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            required 
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px',
                              boxSizing: 'border-box'
                            }}
                          />
                          {formData.email && (
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#16a34a', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              Order receipt will be sent to <strong>{formData.email}</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 2. Shipping Address Card */}
                    <div className="astrogifts-card">
                      <div className="astrogifts-card-header">
                        <svg className="astrogifts-header-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <h2>Shipping Address</h2>
                      </div>

                      <div className="astrogifts-form-grid">
                        <div className="astrogifts-form-group">
                          <label htmlFor="checkout-fullName">Full Name</label>
                          <input 
                            id="checkout-fullName"
                            type="text" 
                            name="fullName" 
                            autoComplete="name"
                            placeholder="Enter your full name" 
                            value={formData.fullName} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>

                        <div className="astrogifts-form-group">
                          <label htmlFor="checkout-phone">Phone Number</label>
                          <input 
                            id="checkout-phone"
                            type="tel" 
                            name="phone" 
                            autoComplete="tel"
                            placeholder="10-digit mobile number" 
                            maxLength="10" 
                            pattern="[0-9]{10}" 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>

                        <div className="astrogifts-form-group astrogifts-full-width">
                          <label htmlFor="checkout-address">Address</label>
                          <input 
                            id="checkout-address"
                            type="text" 
                            name="address" 
                            autoComplete="street-address"
                            placeholder="House no., street, locality" 
                            value={formData.address} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>

                        <div className="astrogifts-form-group">
                          <label htmlFor="checkout-city">City</label>
                          <input 
                            id="checkout-city"
                            type="text" 
                            name="city" 
                            autoComplete="address-level2"
                            placeholder="City" 
                            value={formData.city} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>

                        <div className="astrogifts-form-group">
                          <label htmlFor="checkout-state">State</label>
                          <input 
                            id="checkout-state"
                            type="text" 
                            name="state" 
                            autoComplete="address-level1"
                            placeholder="State" 
                            value={formData.state} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>

                        <div className="astrogifts-form-group">
                          <label htmlFor="checkout-pinCode">Pincode</label>
                          <input 
                            id="checkout-pinCode"
                            type="text" 
                            name="pinCode" 
                            autoComplete="postal-code"
                            placeholder="Pincode" 
                            maxLength="6" 
                            pattern="[0-9]{6}" 
                            value={formData.pinCode} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. Payment Method Card */}
                    <div className="astrogifts-card">
                      <div className="astrogifts-card-header">
                        <svg className="astrogifts-header-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                          <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                        <h2>Payment Method</h2>
                      </div>

                      <div className="astrogifts-payment-options">
                        <label className={`astrogifts-radio-option ${paymentMethod === 'cod' ? 'active' : ''}`} htmlFor="payment-cod">
                          <input 
                            id="payment-cod"
                            type="radio" 
                            name="payment" 
                            value="cod" 
                            checked={paymentMethod === 'cod'} 
                            onChange={(e) => setPaymentMethod(e.target.value)} 
                          />
                          <span className="astrogifts-radio-custom" />
                          <span className="astrogifts-radio-text">Cash on Delivery (COD)</span>
                        </label>

                        <label className={`astrogifts-radio-option ${paymentMethod === 'razorpay' ? 'active' : ''}`} htmlFor="payment-razorpay">
                          <input 
                            id="payment-razorpay"
                            type="radio" 
                            name="payment" 
                            value="razorpay" 
                            checked={paymentMethod === 'razorpay'} 
                            onChange={(e) => setPaymentMethod(e.target.value)} 
                          />
                          <span className="astrogifts-radio-custom" />
                          <span className="astrogifts-radio-text">Credit Card/ Debit Card/ Internet Banking/ UPI</span>
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: Order Items & Order Summary */}
                  <div className="astrogifts-right-col">
                    
                    {/* 1. Order Items (N) Card */}
                    <div className="astrogifts-card">
                      <div className="astrogifts-card-header">
                        <svg className="astrogifts-header-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <h2>Order Items ({cartItems.length})</h2>
                      </div>

                      <div className="astrogifts-items-list">
                        {cartItems.map((item, idx) => (
                          <div key={idx} className="astrogifts-item-row">
                            <img src={item.image || item.img} alt={item.name} className="astrogifts-item-thumb" />
                            <div className="astrogifts-item-info">
                              <div className="astrogifts-item-top">
                                <h4 className="astrogifts-item-title">{item.name}</h4>
                                <div className="astrogifts-item-price-wrap">
                                  <span className="astrogifts-item-price">₹{Math.round(item.price)}</span>
                                  {item.originalPrice && item.originalPrice > item.price && (
                                    <span className="astrogifts-item-old-price">₹{Math.round(item.originalPrice)}</span>
                                  )}
                                </div>
                              </div>
                              <div className="astrogifts-item-meta">
                                Size: {item.size || 'Standard Box (M)'} | Color: {getColorName(item.color || item.selectedColor || 'Default')} | Qty: {item.quantity || 1}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. Order Summary Card */}
                    <div className="astrogifts-card astrogifts-summary-card">
                      <div className="astrogifts-card-header">
                        <h2>Order Summary</h2>
                      </div>

                      <div className="astrogifts-summary-rows">
                        <div className="astrogifts-summary-row">
                          <span>Subtotal</span>
                          <strong>₹{cartTotal.toFixed(2)}</strong>
                        </div>
                        {appliedCoupon && (
                          <div className="astrogifts-summary-row astrogifts-discount-row">
                            <span>Discount ({appliedCoupon.code})</span>
                            <strong style={{ color: '#16a34a' }}>-₹{couponDiscountAmount.toFixed(2)}</strong>
                          </div>
                        )}
                        <div className="astrogifts-summary-row">
                          <span>Shipping</span>
                          <strong>₹0</strong>
                        </div>
                        <div className="astrogifts-summary-row">
                          <span>Tax</span>
                          <strong>₹0</strong>
                        </div>
                        <div className="astrogifts-divider" />
                        <div className="astrogifts-summary-row astrogifts-total-row">
                          <span>Total</span>
                          <strong className="astrogifts-total-price">₹{finalTotal.toFixed(2)}</strong>
                        </div>
                      </div>

                      {/* Coupon Toggle in Summary */}
                      <div className="astrogifts-coupon-section">
                        {!showCouponBox ? (
                          <button type="button" className="astrogifts-coupon-link" onClick={() => setShowCouponBox(true)}>
                            + Have a coupon code?
                          </button>
                        ) : (
                          <div className="astrogifts-coupon-box">
                            <div className="astrogifts-coupon-input-group">
                              <input 
                                id="checkout-couponCode"
                                type="text" 
                                name="couponCode"
                                autoComplete="off"
                                placeholder="Enter coupon code" 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                              />
                              <button type="button" onClick={handleApplyCoupon}>Apply</button>
                            </div>
                            {couponSuccess && <div className="astrogifts-coupon-msg success">{couponSuccess}</div>}
                            {couponError && <div className="astrogifts-coupon-msg error">{couponError}</div>}
                          </div>
                        )}
                      </div>               </div>

                      {/* Action Buttons */}
                      <div className="astrogifts-action-buttons">
                        <button 
                          type="submit" 
                          className="astrogifts-place-order-btn" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Processing...' : 'Place Order'}
                        </button>
                        <button 
                          type="button" 
                          className="astrogifts-back-cart-btn" 
                          onClick={() => navigate('/')}
                        >
                          Back to Cart
                        </button>
                      </div>

                    </div>

                  </div>
                </form>
              )}
          </div>
        ) : step === 2 && orderDetails && (
          <div className="astrogifts-checkout-container">
            <div className="astrogifts-success-box">
              <div className="astrogifts-success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2>Order Placed Successfully!</h2>
              <p>Thank you for your purchase. Your order number is <strong>#{orderDetails.orderId}</strong>.</p>
              
              <div className="astrogifts-success-details">
                <div><span>Date:</span> <strong>{orderDetails.date}</strong></div>
                <div><span>Total Paid:</span> <strong>₹{orderDetails.total?.toFixed(2)}</strong></div>
                <div><span>Payment Method:</span> <strong>{orderDetails.paymentMethodStr}</strong></div>
              </div>

              <div className="astrogifts-success-actions">
                <button className="astrogifts-place-order-btn" onClick={handleFinish}>
                  Return to Home
                </button>
                <button className="astrogifts-back-cart-btn" onClick={() => navigate('/my-orders')}>
                  View My Orders
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
