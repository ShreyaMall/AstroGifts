import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../services/api';
import { getColorName, getHexColor } from '../utils/colorUtils';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
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
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    country: 'India',
    state: 'Delhi',
    city: '',
    address: '',
    pinCode: '',
    notes: '',
    // Shipping fields
    shippingFirstName: '',
    shippingLastName: '',
    shippingPhone: '',
    shippingEmail: '',
    shippingCountry: 'India',
    shippingState: 'Delhi',
    shippingCity: '',
    shippingAddress: '',
    shippingPinCode: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'shippingPhone') {
      // Only allow numbers
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear errors when user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));

    if ((name === 'pinCode' || name === 'shippingPinCode') && value.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data && data[0]?.Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          const cityField = name === 'pinCode' ? 'city' : 'shippingCity';
          const stateField = name === 'pinCode' ? 'state' : 'shippingState';
          
          setFormData(prev => ({
            ...prev,
            [cityField]: postOffice.District,
            [stateField]: postOffice.State
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
    if (cartItems.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    setIsSubmitting(true);

    const billName = `${formData.firstName} ${formData.lastName}`.trim();
    const shipName = shipToDifferent ? `${formData.shippingFirstName} ${formData.shippingLastName}`.trim() : billName;

    const payload = {
      customer_name: shipName,
      email: shipToDifferent ? formData.shippingEmail : formData.email,
      phone: (shipToDifferent ? formData.shippingPhone : formData.phone).replace(/[^0-9]/g, '').slice(-10),
      shipping_address: shipToDifferent ? formData.shippingAddress : formData.address,
      city: shipToDifferent ? formData.shippingCity : formData.city,
      state: shipToDifferent ? (formData.shippingState || 'Delhi') : (formData.state || 'Delhi'),
      zip: shipToDifferent ? formData.shippingPinCode : formData.pinCode,
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

    /* ── helper: persist order to localStorage ── */
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
          name: item.name,
          qty: item.quantity || 1,
          price: item.price,
          image: typeof item.image === 'string' ? item.image : null,
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
        const total   = order?.total ?? finalTotal;
        const paymentMethodStr = paymentMethod === 'cod' ? 'Cash on delivery' : 'Razorpay';
        saveOrderLocally(orderId, total);
        setOrderDetails({ orderId, total, date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), paymentMethodStr });
        clearCart();
        setIsSubmitting(false);
        setStep(2);
      } catch (err) {
        // Offline fallback
        const generatedOrderId = 'WM-' + Math.floor(100000 + Math.random() * 900000);
        const paymentMethodStr = paymentMethod === 'cod' ? 'Cash on delivery' : 'Razorpay';
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
        amount: finalTotal * 100, // paise
        currency: 'INR',
        name: 'AstroGifts',
        description: 'Test Transaction',
        handler: function (response) {
          processOrderSuccess(response.razorpay_payment_id);
        },
        prefill: {
          name: billName,
          email: formData.email,
          contact: formData.phone
        },
        theme: { color: '#d96b27' },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
          }
        }
      };
      
      try {
        if (options.key === 'rzp_test_dummykey12345' || !options.key.startsWith('rzp_')) {
          // Simulate Razorpay flow since the dummy key will cause the real SDK to silently fail or alert without triggering ondismiss
          setTimeout(() => {
            if (window.confirm("Razorpay Integration is ready! (This is a mock dialog because you are using a dummy key).\n\nClick OK to simulate a successful payment, or Cancel to simulate failure.")) {
              processOrderSuccess('pay_mock_' + Math.floor(Math.random() * 1000000));
            } else {
              setIsSubmitting(false);
            }
          }, 500);
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
        alert('Razorpay initialization failed. Order will be processed as COD for demo.');
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
      <div className="wm-checkout-page">
        {step === 1 ? (
          <div className="wm-checkout-container">
            <h1 className="wm-checkout-page-title">Checkout</h1>
            <div className="wm-checkout-top-links">
              <p>
                Have a coupon?{' '}
                <button
                  type="button"
                  className="wm-coupon-toggle-btn"
                  onClick={() => setShowCouponBox(!showCouponBox)}
                >
                  Click here to enter your code
                </button>
              </p>

              {showCouponBox && (
                <div className="wm-checkout-coupon-box">
                  <p className="wm-coupon-box-desc">
                    If you have a coupon code, please apply it below.
                  </p>
                  {appliedCoupon ? (
                    <div className="wm-applied-coupon-info">
                      <span className="wm-applied-coupon-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg> <strong>{appliedCoupon.code}</strong> Applied ({appliedCoupon.type === 'percent' ? `${appliedCoupon.value}% OFF` : `₹${appliedCoupon.value} OFF`})
                      </span>
                      <button type="button" className="wm-remove-coupon-btn" onClick={handleRemoveCoupon}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="wm-coupon-input-group">
                      <input
                        type="text"
                        className="wm-coupon-input"
                        placeholder="Enter coupon code (e.g. ASTROGIFTS10, SAVE20, FLAT500)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="wm-apply-coupon-btn"
                        onClick={handleApplyCoupon}
                      >
                        Apply coupon
                      </button>
                    </div>
                  )}

                  {couponError && <div className="wm-coupon-msg wm-coupon-error">{couponError}</div>}
                  {couponSuccess && <div className="wm-coupon-msg wm-coupon-success">{couponSuccess}</div>}
                </div>
              )}
            </div>

            {cartItems.length === 0 ? (
                <div style={{textAlign: 'center', padding: '50px 0'}}>
                    <h2>Your cart is empty.</h2>
                    <button className="wm-return-shop-btn" onClick={() => navigate('/')} style={{marginTop: '20px'}}>Return to Shop</button>
                </div>
            ) : (
            <form className="wm-checkout-form" onSubmit={handlePlaceOrder}>
              <div className="wm-checkout-main-grid">
                
                {/* LEFT COLUMN: Billing Details & Payment */}
                <div className="wm-checkout-left-col">
                  
                  {/* 1. BILLING DETAILS */}
                  <div className="wm-checkout-section-wrap">
                    <h3 className="wm-checkout-section-title">
                      <span className="wm-step-badge">1</span> Billing Details
                    </h3>
                    
                    <div className="wm-checkout-grid">
                      <div className="wm-form-group">
                        <label>First name <span>*</span></label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                      </div>
                      <div className="wm-form-group">
                        <label>Last name <span>*</span></label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                      </div>
                      <div className="wm-form-group">
                        <label>Phone <span>*</span></label>
                        <input type="tel" name="phone" placeholder="10-digit mobile number" maxLength="10" pattern="[0-9]{10}" value={formData.phone} onChange={handleInputChange} required />
                      </div>
                      <div className="wm-form-group">
                        <label>Email address <span>*</span></label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                      </div>
                      <div className="wm-form-group">
                        <label>Country / Region <span>*</span></label>
                        <select name="country" value={formData.country} onChange={handleInputChange} required>
                          <option value="India">India</option>
                        </select>
                      </div>
                      <div className="wm-form-group">
                        <label>State <span>*</span></label>
                        <input type="text" name="state" placeholder="State (e.g. Delhi, Maharashtra)" value={formData.state} onChange={handleInputChange} required />
                      </div>
                      <div className="wm-form-group">
                        <label>Town / City <span>*</span></label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                      </div>
                      <div className="wm-form-group">
                        <label>PIN Code <span>*</span></label>
                        <input type="text" name="pinCode" placeholder="6-digit PIN Code" maxLength="6" pattern="[0-9]{6}" value={formData.pinCode} onChange={handleInputChange} required />
                      </div>
                      <div className="wm-form-group wm-full-width">
                        <label>Street address <span>*</span></label>
                        <input type="text" name="address" placeholder="House number and street name (min 10 characters)" value={formData.address} onChange={handleInputChange} required minLength="5" />
                      </div>
                    </div>

                    <div className="wm-checkbox-group">
                      <label>
                        <input type="checkbox" checked={shipToDifferent} onChange={(e) => setShipToDifferent(e.target.checked)} /> 
                        Ship to a different address?
                      </label>
                    </div>

                    {shipToDifferent && (
                      <div className="wm-checkout-shipping-wrap">
                        <h4 style={{ margin: '15px 0 10px', fontSize: '16px', fontWeight: 'bold' }}>Shipping Details</h4>
                        <div className="wm-checkout-grid">
                          <div className="wm-form-group">
                            <label>First name <span>*</span></label>
                            <input type="text" name="shippingFirstName" value={formData.shippingFirstName} onChange={handleInputChange} required />
                          </div>
                          <div className="wm-form-group">
                            <label>Last name <span>*</span></label>
                            <input type="text" name="shippingLastName" value={formData.shippingLastName} onChange={handleInputChange} required />
                          </div>
                          <div className="wm-form-group">
                            <label>Phone <span>*</span></label>
                            <input type="tel" name="shippingPhone" placeholder="10-digit mobile number" maxLength="10" pattern="[0-9]{10}" value={formData.shippingPhone} onChange={handleInputChange} required />
                          </div>
                          <div className="wm-form-group">
                            <label>Email address <span>*</span></label>
                            <input type="email" name="shippingEmail" value={formData.shippingEmail} onChange={handleInputChange} required />
                          </div>
                          <div className="wm-form-group">
                            <label>Country / Region <span>*</span></label>
                            <select name="shippingCountry" value={formData.shippingCountry} onChange={handleInputChange} required>
                              <option value="India">India</option>
                            </select>
                          </div>
                          <div className="wm-form-group">
                            <label>State <span>*</span></label>
                            <input type="text" name="shippingState" placeholder="State (e.g. Delhi, Maharashtra)" value={formData.shippingState} onChange={handleInputChange} required />
                          </div>
                          <div className="wm-form-group">
                            <label>Town / City <span>*</span></label>
                            <input type="text" name="shippingCity" value={formData.shippingCity} onChange={handleInputChange} required />
                          </div>
                          <div className="wm-form-group">
                            <label>PIN Code <span>*</span></label>
                            <input type="text" name="shippingPinCode" placeholder="6-digit PIN Code" maxLength="6" pattern="[0-9]{6}" value={formData.shippingPinCode} onChange={handleInputChange} required />
                          </div>
                          <div className="wm-form-group wm-full-width">
                            <label>Street address <span>*</span></label>
                            <input type="text" name="shippingAddress" placeholder="House number and street name (min 10 characters)" value={formData.shippingAddress} onChange={handleInputChange} required minLength="5" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="wm-form-group wm-full-width" style={{ marginTop: '15px' }}>
                      <label>Order notes <span>(optional)</span></label>
                      <textarea name="notes" placeholder="Notes about your order, e.g. special notes for delivery." value={formData.notes} onChange={handleInputChange} rows="2"></textarea>
                    </div>
                  </div>

                  {/* 2. PAYMENT INFORMATION */}
                  <div className="wm-checkout-section-wrap wm-payment-wrap">
                    <h3 className="wm-checkout-section-title">
                      <span className="wm-step-badge">2</span> Payment Method
                    </h3>

                    <div className="wm-payment-methods">
                      <label className="wm-payment-label">
                        <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                        Credit Card / Debit Card / UPI / NetBanking (Razorpay)
                      </label>
                      <label className="wm-payment-label">
                        <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                        Cash on delivery
                      </label>
                    </div>

                    <div className="wm-payment-desc">
                      {paymentMethod === 'razorpay' ? 'Pay securely via Razorpay using Cards, UPI, or NetBanking.' : 'Pay with cash upon delivery.'}
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Order Summary (Sticky Sidebar) */}
                <div className="wm-checkout-right-col">
                  <div className="wm-checkout-summary-box">
                    <h3 className="wm-checkout-section-title">Your Order</h3>
                    
                    <table className="wm-order-table">
                      <thead>
                        <tr>
                          <th>PRODUCT</th>
                          <th>SUBTOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="wm-order-item-desc">
                                <span className="wm-item-remove" onClick={() => removeFromCart(item.id)} title="Remove item">×</span>
                                <img src={item.image} alt={item.name} className="wm-order-item-img" />
                                <div className="wm-item-meta">
                                  <span className="wm-item-name">{item.name}</span>
                                  {item.color && (
                                    <div className="wm-item-color" style={{ fontSize: '11px', color: '#666', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <span>Color: <strong>{getColorName(item.color)}</strong></span>
                                      <span
                                        style={{
                                          width: '10px',
                                          height: '10px',
                                          borderRadius: '50%',
                                          backgroundColor: getHexColor(item.color),
                                          display: 'inline-block',
                                          border: '1px solid #ccc',
                                          flexShrink: 0
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div className="wm-qty-control">
                                    <span onClick={() => updateQuantity(item.id, -1)} style={{cursor: 'pointer'}}>-</span>
                                    <span>{item.quantity || 1}</span>
                                    <span onClick={() => updateQuantity(item.id, 1)} style={{cursor: 'pointer'}}>+</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="wm-subtotal-price">₹{(item.price * (item.quantity || 1)).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th>Subtotal</th>
                          <td className="wm-subtotal-price">₹{cartTotal.toLocaleString()}</td>
                        </tr>
                        {appliedCoupon && (
                          <tr className="wm-discount-row">
                            <th>
                              Discount <span className="wm-discount-code">({appliedCoupon.code})</span>
                            </th>
                            <td className="wm-discount-price">-₹{couponDiscountAmount.toLocaleString()}</td>
                          </tr>
                        )}
                        <tr className="wm-total-row">
                          <th>Total</th>
                          <td className="wm-total-price">₹{finalTotal.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>

                    <div className="wm-warehouse-notice">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f79051" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                      Expected warehouse dispatch: 1-3 business days.
                    </div>

                    <button type="submit" className={`wm-place-order-btn${paymentMethod === 'razorpay' ? ' wm-pay-now-btn' : ''}`} disabled={isSubmitting}>
                      {isSubmitting
                        ? 'Processing...'
                        : paymentMethod === 'razorpay'
                          ? <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                              </svg>
                              Pay Now — ₹{finalTotal.toLocaleString()}
                            </>
                          : <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                              </svg>
                              Place Order — ₹{finalTotal.toLocaleString()}
                            </>
                      }
                    </button>
                  </div>
                </div>

              </div>
            </form>
            )}
          </div>
        ) : step === 2 && orderDetails && (
          <div className="wm-checkout-container">
            <div className="wm-order-complete">
              
              <div className="wm-order-complete-msg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Thank you. Your order has been received.</span>
              </div>

              <ul className="wm-order-complete-overview">
                <li>
                  <span>Order number:</span>
                  <strong>{orderDetails.orderId}</strong>
                </li>
                <li>
                  <span>Date:</span>
                  <strong>{orderDetails.date}</strong>
                </li>
                <li>
                  <span>Total:</span>
                  <strong style={{ color: '#d96b27' }}>₹{orderDetails.total?.toLocaleString()}</strong>
                </li>
                <li>
                  <span>Payment method:</span>
                  <strong>{orderDetails.paymentMethodStr}</strong>
                </li>
              </ul>

              <p className="wm-order-complete-pay-desc">
                {paymentMethod === 'cod' ? 'Pay with cash upon delivery.' : paymentMethod === 'bacs' ? 'Make your payment directly into our bank account.' : 'Please send a check to Store Name.'}
              </p>

              <h2 className="wm-order-details-title">Order details</h2>

              <table className="wm-order-details-table">
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {item.image && (
                            <img src={item.image} alt={item.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee', flexShrink: 0 }} />
                          )}
                          <div>
                            <div style={{ fontWeight: '600', color: '#111', fontSize: '14px' }}>
                              {item.name} <span style={{ color: '#888', fontWeight: '500' }}>× {item.quantity || 1}</span>
                            </div>
                            {(item.size || item.selected_color) && (
                              <div style={{ fontSize: '12px', color: '#888', marginTop: '3px', display: 'flex', gap: '10px' }}>
                                {item.size && <span>Size: <strong style={{ color: '#555' }}>{item.size}</strong></span>}
                                {item.selected_color && <span>Color: <strong style={{ color: '#555' }}>{item.selected_color}</strong></span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="wm-color-orange">₹{((item.price * (item.quantity || 1))).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th>Subtotal:</th>
                    <td className="wm-color-orange">₹{cartTotal.toLocaleString()}</td>
                  </tr>
                  {appliedCoupon && (
                    <tr>
                      <th>Discount ({appliedCoupon.code}):</th>
                      <td style={{ color: '#16a34a', fontWeight: '600' }}>-₹{couponDiscountAmount.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr>
                    <th>Payment method:</th>
                    <td>{orderDetails.paymentMethodStr}</td>
                  </tr>
                  <tr>
                    <th>Total:</th>
                    <td className="wm-color-orange" style={{ fontSize: '17px' }}>₹{orderDetails.total?.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="wm-order-addresses">
                <div className="wm-address-col">
                  <h3 className="wm-address-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Billing address
                  </h3>
                  <address>
                    <strong style={{ color: '#111', display: 'block', marginBottom: '3px' }}>{formData.firstName} {formData.lastName}</strong>
                    {formData.address}<br />
                    {formData.city} {formData.pinCode}<br />
                    {formData.country}<br />
                    {formData.phone && (
                      <span className="wm-address-contact" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {formData.phone}
                      </span>
                    )}
                    {formData.email && (
                      <span className="wm-address-contact" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        {formData.email}
                      </span>
                    )}
                  </address>
                </div>
                <div className="wm-address-col">
                  <h3 className="wm-address-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    Shipping address
                  </h3>
                  <address>
                    <strong style={{ color: '#111', display: 'block', marginBottom: '3px' }}>
                      {shipToDifferent ? formData.shippingFirstName : formData.firstName} {shipToDifferent ? formData.shippingLastName : formData.lastName}
                    </strong>
                    {shipToDifferent ? formData.shippingAddress : formData.address}<br />
                    {shipToDifferent ? formData.shippingCity : formData.city} {shipToDifferent ? formData.shippingPinCode : formData.pinCode}<br />
                    {shipToDifferent ? formData.shippingCountry : formData.country}<br />
                    {(shipToDifferent ? formData.shippingPhone : formData.phone) && (
                      <span className="wm-address-contact" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {shipToDifferent ? formData.shippingPhone : formData.phone}
                      </span>
                    )}
                    {(shipToDifferent ? formData.shippingEmail : formData.email) && (
                      <span className="wm-address-contact" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        {shipToDifferent ? formData.shippingEmail : formData.email}
                      </span>
                    )}
                  </address>
                </div>
              </div>

              <div className="wm-order-complete-actions">
                <button className="wm-return-shop-btn" onClick={handleFinish}>
                  ← Return to Shop
                </button>
                <button className="wm-view-orders-btn" onClick={() => { clearCart(); navigate('/my-orders'); }}>
                  View My Orders →
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
