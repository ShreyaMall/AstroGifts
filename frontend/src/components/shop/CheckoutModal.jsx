import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { ordersApi, couponsApi } from '../../services/api';
import './CheckoutModal.css';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    closeCheckout,
    cartItems,
    cartTotal,
    clearCart
  } = useCart();

  const [step, setStep] = useState(1); // 1: Form, 2: Success
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingMethod, setShippingMethod] = useState('flat_rate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const initialFormState = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    country: 'India',
    city: '',
    address: '',
    pinCode: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  if (!isCheckoutOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const finalTotal = cartTotal + (shippingMethod === 'flat_rate' ? 150 : 0);

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
    setIsSubmitting(true);

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const payload = {
      customer_name: fullName,
      email: formData.email,
      phone: formData.phone,
      shipping_address: formData.address,
      city: formData.city,
      state: '',
      zip: formData.pinCode,
      payment_method: paymentMethod,
      items: cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        selected_color: item.selectedColor || null,
        image: typeof item.image === 'string' ? item.image : null,
      })),
      total: finalTotal
    };

    /* ── helper: persist order to localStorage ── */
    const saveOrderLocally = (orderId, total) => {
      const newOrder = {
        order_number: orderId,
        customer_name: fullName,
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
      const existing = JSON.parse(localStorage.getItem('woodmart_user_orders') || '[]');
      localStorage.setItem('woodmart_user_orders', JSON.stringify([newOrder, ...existing]));
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
        setIsSubmitting(false);
        setStep(2);
      } catch (err) {
        // Offline fallback
        const generatedOrderId = 'WM-' + Math.floor(100000 + Math.random() * 900000);
        const paymentMethodStr = paymentMethod === 'cod' ? 'Cash on delivery' : 'Razorpay';
        saveOrderLocally(generatedOrderId, finalTotal);
        setOrderDetails({ orderId: generatedOrderId, total: finalTotal, date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), paymentMethodStr });
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
        name: 'Homewood Decor',
        description: 'Test Transaction',
        handler: function (response) {
          processOrderSuccess(response.razorpay_payment_id);
        },
        prefill: {
          name: fullName,
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
    closeCheckout();
  };

  return (
    <div className="wm-checkout-overlay" onClick={closeCheckout}>
      <div className="wm-checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="wm-checkout-close" onClick={closeCheckout}>✕</button>

        {step === 1 ? (
          <div className="wm-checkout-container">
            <div className="wm-checkout-top-links">
              <p>Returning customer? <a href="#">Click here to login</a></p>
              <p>Have a coupon? <a href="#">Click here to enter your code</a></p>
            </div>

            <form className="wm-checkout-form" onSubmit={handlePlaceOrder}>
              
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
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
                  </div>
                  <div className="wm-form-group">
                    <label>Email address <span>*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="wm-form-group">
                    <label>Country / Region <span>*</span></label>
                    <select name="country" value={formData.country} onChange={handleInputChange} required>
                      <option value="India">India</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </div>
                  <div className="wm-form-group">
                    <label>Town / City <span>*</span></label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div className="wm-form-group">
                    <label>Street address <span>*</span></label>
                    <input type="text" name="address" placeholder="House number and street name" value={formData.address} onChange={handleInputChange} required />
                  </div>
                  <div className="wm-form-group">
                    <label>PIN Code <span>*</span></label>
                    <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="wm-checkbox-group">
                  <label><input type="checkbox" /> Create an account?</label>
                  <label><input type="checkbox" /> Ship to a different address?</label>
                </div>

                <div className="wm-form-group wm-full-width">
                  <label>Order notes <span>(optional)</span></label>
                  <textarea name="notes" placeholder="Notes about your order, e.g. special notes for delivery." value={formData.notes} onChange={handleInputChange} rows="3"></textarea>
                </div>
              </div>

              {/* 2. YOUR ORDER */}
              <div className="wm-checkout-section-wrap">
                <h3 className="wm-checkout-section-title">
                  <span className="wm-step-badge">2</span> Your Order
                </h3>
                
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
                            <span className="wm-item-remove">×</span>
                            <img src={item.image} alt={item.name} className="wm-order-item-img" />
                            <div className="wm-item-meta">
                              <span className="wm-item-name">{item.name}</span>
                              <div className="wm-qty-control">
                                <span>-</span>
                                <span>{item.quantity || 1}</span>
                                <span>+</span>
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
                    <tr>
                      <th>Shipment</th>
                      <td className="wm-shipment-options">
                        <label>
                          Flat rate <input type="radio" name="shipping" value="flat_rate" checked={shippingMethod === 'flat_rate'} onChange={(e) => setShippingMethod(e.target.value)} />
                        </label>
                        <label>
                          Free shipping <input type="radio" name="shipping" value="free" checked={shippingMethod === 'free'} onChange={(e) => setShippingMethod(e.target.value)} />
                        </label>
                        <label>
                          Local pickup <input type="radio" name="shipping" value="pickup" checked={shippingMethod === 'pickup'} onChange={(e) => setShippingMethod(e.target.value)} />
                        </label>
                      </td>
                    </tr>
                    <tr className="wm-total-row">
                      <th>Total</th>
                      <td className="wm-total-price">₹{finalTotal.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>



                <div className="wm-warehouse-notice">
                  Your order is expected to leave our warehouse within 1-7 days.
                </div>
              </div>

              {/* 3. PAYMENT INFORMATION */}
              <div className="wm-checkout-section-wrap wm-payment-wrap">
                <h3 className="wm-checkout-section-title">
                  <span className="wm-step-badge">3</span> Payment Information
                </h3>

                <div className="wm-payment-methods">
                  <label className="wm-payment-label">
                    <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    Credit Card / Debit Card / NetBanking (Razorpay)
                  </label>
                  <label className="wm-payment-label">
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    Cash on delivery
                  </label>
                </div>

                <div className="wm-payment-desc">
                  {paymentMethod === 'razorpay' ? 'Pay securely via Razorpay using Cards, UPI, or NetBanking.' : 'Pay with cash upon delivery.'}
                </div>

                <button type="submit" className="wm-place-order-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Place order'}
                </button>
              </div>

            </form>
          </div>
        ) : step === 2 && orderDetails && (
          <div className="wm-order-complete">
            
            <div className="wm-order-complete-msg">
              Thank you. Your order has been received.
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
                <strong>₹{orderDetails.total?.toLocaleString()}</strong>
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
                      {item.name} <strong>× {item.quantity || 1}</strong>
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
                <tr>
                  <th>Shipping:</th>
                  <td>{shippingMethod === 'flat_rate' ? 'Flat rate' : shippingMethod === 'free' ? 'Free shipping' : 'Local pickup'}</td>
                </tr>
                <tr>
                  <th>Payment method:</th>
                  <td>{orderDetails.paymentMethodStr}</td>
                </tr>
                <tr>
                  <th>Total:</th>
                  <td className="wm-color-orange">₹{orderDetails.total?.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <div className="wm-order-addresses">
              <div className="wm-address-col">
                <h3 className="wm-address-title">Billing address</h3>
                <address>
                  {formData.firstName} {formData.lastName}<br />
                  {formData.address}<br />
                  {formData.city} {formData.pinCode}<br />
                  {formData.country}<br />
                  <span className="wm-address-contact">{formData.phone}</span><br />
                  <span className="wm-address-contact">{formData.email}</span>
                </address>
              </div>
              <div className="wm-address-col">
                <h3 className="wm-address-title">Shipping address</h3>
                <address>
                  {formData.firstName} {formData.lastName}<br />
                  {formData.address}<br />
                  {formData.city} {formData.pinCode}<br />
                  {formData.country}<br />
                  <span className="wm-address-contact">{formData.phone}</span><br />
                  <span className="wm-address-contact">{formData.email}</span>
                </address>
              </div>
            </div>

            <div className="wm-order-complete-actions">
              <button className="wm-return-shop-btn" onClick={handleFinish}>Return to Shop</button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
