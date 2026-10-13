import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressesApi, authApi, getAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { customConfirm } from '../utils/confirmModal';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProfileSidebar from '../components/layout/ProfileSidebar';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default function AddressPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pincode: '',
    line1: '',
    line2: '',
    landmark: '',
    city: '',
    state: 'Delhi',
    country: 'India',
    label: 'Home',
    is_default: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const fetchAddresses = () => {
    setLoading(true);
    addressesApi.getUserAddresses()
      .then(res => {
        setAddresses(Array.isArray(res) ? res : []);
      })
      .catch(err => {
        console.error("Failed to load addresses", err);
        setPageError('Unable to load saved addresses. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchAddresses();
  }, []);

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const cleanValue = type === 'checkbox' ? checked : value;

    if (name === 'phone') {
      const numeric = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: numeric }));
      if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
      return;
    }

    if (name === 'pincode') {
      const numericPin = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, pincode: numericPin }));
      if (formErrors.pincode) setFormErrors(prev => ({ ...prev, pincode: '' }));

      if (numericPin.length === 6) {
        setPincodeLoading(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${numericPin}`);
          const data = await res.json();
          if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              city: postOffice.District || prev.city,
              state: postOffice.State || prev.state,
            }));
          }
        } catch (err) {
          console.error('Error fetching postal details', err);
        } finally {
          setPincodeLoading(false);
        }
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: cleanValue }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      errors.pincode = 'Please enter a valid 6-digit PIN code.';
    }

    if (!formData.line1.trim()) {
      errors.line1 = 'Address line 1 (house/flat no., building, street) is required.';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      errors.state = 'Please select a state.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddForm = () => {
    setPageError('');
    setPageSuccess('');
    setEditingId(null);
    setFormData({
      name: user?.name || '',
      phone: user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : '',
      pincode: '',
      line1: '',
      line2: '',
      landmark: '',
      city: '',
      state: 'Delhi',
      country: 'India',
      label: 'Home',
      is_default: addresses.length === 0,
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleEdit = (addr) => {
    setPageError('');
    setPageSuccess('');
    setEditingId(addr.id);
    setFormData({
      name: addr.full_name || addr.name || '',
      phone: (addr.phone || '').replace(/\D/g, '').slice(-10),
      pincode: (addr.pincode || '').replace(/\D/g, '').slice(0, 6),
      line1: addr.line1 || addr.address_line || '',
      line2: addr.line2 || '',
      landmark: addr.landmark || addr.locality || '',
      city: addr.city || '',
      state: addr.state || 'Delhi',
      country: addr.country || 'India',
      label: addr.label || 'Home',
      is_default: !!addr.is_default,
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    setPageError('');
    setPageSuccess('');

    const payload = {
      full_name: formData.name.trim(),
      name: formData.name.trim(),
      phone: formData.phone.replace(/\D/g, ''),
      pincode: formData.pincode.replace(/\D/g, ''),
      line1: formData.line1.trim(),
      address_line: formData.line1.trim(),
      line2: formData.line2 ? formData.line2.trim() : null,
      landmark: formData.landmark ? formData.landmark.trim() : null,
      locality: formData.landmark ? formData.landmark.trim() : null,
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim() || 'India',
      label: formData.label || 'Home',
      is_default: formData.is_default,
    };

    try {
      if (editingId) {
        await addressesApi.updateAddress(editingId, payload);
        setPageSuccess('Address updated successfully.');
      } else {
        await addressesApi.addAddress(payload);
        setPageSuccess('New address added successfully.');
      }

      // Auto-sync profile name if empty
      if ((!user?.name || user.name.trim() === '' || /^User \d+$/i.test(user.name.trim())) && payload.full_name) {
        try {
          const updateRes = await authApi.updateProfile({ name: payload.full_name });
          if (updateRes && updateRes.user) {
            login(updateRes.user.role || 'customer', getAuthToken(), updateRes.user, true);
          }
        } catch (e) {
          console.warn('Auto profile name update failed:', e);
        }
      }

      setShowForm(false);
      setEditingId(null);
      fetchAddresses();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Error saving address. Please check fields.';
      setPageError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setPageError('');
    setPageSuccess('');
    const confirmed = await customConfirm('Are you sure you want to delete this address?');
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await addressesApi.deleteAddress(id);
      setPageSuccess('Address deleted successfully.');
      fetchAddresses();
    } catch (err) {
      setPageError(err.data?.message || 'Error deleting address. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    setPageError('');
    setPageSuccess('');
    setActionLoading(true);
    try {
      await addressesApi.setDefault(id);
      setPageSuccess('Default address updated.');
      fetchAddresses();
    } catch (err) {
      setPageError(err.data?.message || 'Unable to update default address.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .profile-layout-container {
          max-width: 1120px;
          margin: 0 auto;
          padding: 40px 20px 80px;
          display: flex;
          gap: 28px;
          align-items: flex-start;
        }
        .profile-sidebar {
          width: 220px;
          flex-shrink: 0;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 1px 8px rgba(0,0,0,0.07);
          padding: 24px 0;
          position: sticky;
          top: 100px;
        }
        .profile-main {
          flex: 1;
          min-width: 0;
        }
        .address-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .address-item-card {
          background: #fff;
          border-radius: 12px;
          padding: 22px;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1.5px solid transparent;
          transition: all 0.2s ease;
        }
        .address-item-card--default {
          border-color: var(--brand-primary, #704832);
          background: #fffdfb;
        }
        .address-action-btn {
          min-height: 44px;
          min-width: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 14px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          border: none;
          background: none;
          transition: background 0.15s ease;
        }
        .address-form-input, .address-form-select {
          width: 100%;
          min-height: 44px;
          padding: 10px 14px;
          font-size: 16px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          outline: none;
          background: #fff;
          font-family: inherit;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .address-form-input:focus, .address-form-select:focus {
          border-color: var(--brand-primary, #704832);
          box-shadow: 0 0 0 3px rgba(112, 72, 50, 0.12);
        }
        .address-form-input--error {
          border-color: #ef4444 !important;
          background-color: #fffaf0;
        }
        .address-field-error {
          color: #dc2626;
          font-size: 13px;
          margin-top: 4px;
          display: block;
        }
        @media (max-width: 768px) {
          .profile-layout-container {
            flex-direction: column;
            padding: 20px 16px 60px;
          }
          .profile-sidebar {
            width: 100%;
            position: static;
            top: auto;
            margin-bottom: 16px;
          }
          .profile-main {
            width: 100%;
          }
          .address-card-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Header />

      <div style={{ minHeight: 'calc(100vh - 150px)', background: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
        <div className="profile-layout-container">
          <ProfileSidebar activeTab="address" />

          <div className="profile-main">
            {/* Header row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px', color: '#111827' }}>My Addresses</h1>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Manage and reuse delivery addresses for faster checkout</p>
              </div>
              {!showForm && (
                <button
                  type="button"
                  id="btn-add-address"
                  onClick={handleOpenAddForm}
                  style={{
                    minHeight: '44px',
                    padding: '10px 22px',
                    background: 'var(--brand-primary, #704832)',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  <span>+</span> Add New Address
                </button>
              )}
            </div>

            {/* Alert / Feedback messages */}
            {pageError && (
              <div role="alert" aria-live="polite" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                {pageError}
              </div>
            )}
            {pageSuccess && (
              <div role="status" aria-live="polite" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                {pageSuccess}
              </div>
            )}

            {/* Add / Edit Form */}
            {showForm ? (
              <div style={{ background: '#fff', padding: '28px', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '14px', borderBottom: '1px solid #f3f4f6' }}>
                  <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '700', color: '#111827' }}>
                    {editingId ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: '18px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  {/* Full Name */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="address-form-name" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="address-form-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`address-form-input ${formErrors.name ? 'address-form-input--error' : ''}`}
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                    {formErrors.name && <span className="address-field-error" role="alert">{formErrors.name}</span>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="address-form-phone" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="address-form-phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`address-form-input ${formErrors.phone ? 'address-form-input--error' : ''}`}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      required
                    />
                    {formErrors.phone && <span className="address-field-error" role="alert">{formErrors.phone}</span>}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label htmlFor="address-form-pincode" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      PIN Code <span style={{ color: '#ef4444' }}>*</span> {pincodeLoading && <span style={{ fontSize: '12px', color: '#6b7280' }}>(fetching city/state...)</span>}
                    </label>
                    <input
                      id="address-form-pincode"
                      name="pincode"
                      type="text"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={`address-form-input ${formErrors.pincode ? 'address-form-input--error' : ''}`}
                      placeholder="6-digit PIN code"
                      maxLength={6}
                      required
                    />
                    {formErrors.pincode && <span className="address-field-error" role="alert">{formErrors.pincode}</span>}
                  </div>

                  {/* Line 1 */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="address-form-line1" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Address Line 1 (House No., Building, Street) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="address-form-line1"
                      name="line1"
                      type="text"
                      value={formData.line1}
                      onChange={handleInputChange}
                      className={`address-form-input ${formErrors.line1 ? 'address-form-input--error' : ''}`}
                      placeholder="Flat / House no., Apartment name, Street name"
                      required
                    />
                    {formErrors.line1 && <span className="address-field-error" role="alert">{formErrors.line1}</span>}
                  </div>

                  {/* Line 2 (Optional) */}
                  <div>
                    <label htmlFor="address-form-line2" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Address Line 2 <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>(Optional)</span>
                    </label>
                    <input
                      id="address-form-line2"
                      name="line2"
                      type="text"
                      value={formData.line2}
                      onChange={handleInputChange}
                      className="address-form-input"
                      placeholder="Sector, Phase, Area"
                    />
                  </div>

                  {/* Landmark (Optional) */}
                  <div>
                    <label htmlFor="address-form-landmark" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Landmark <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>(Optional)</span>
                    </label>
                    <input
                      id="address-form-landmark"
                      name="landmark"
                      type="text"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      className="address-form-input"
                      placeholder="e.g. Near Metro Station"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="address-form-city" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      City / District <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="address-form-city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`address-form-input ${formErrors.city ? 'address-form-input--error' : ''}`}
                      placeholder="City or District"
                      required
                    />
                    {formErrors.city && <span className="address-field-error" role="alert">{formErrors.city}</span>}
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor="address-form-state" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      State <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      id="address-form-state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`address-form-select ${formErrors.state ? 'address-form-input--error' : ''}`}
                      required
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    {formErrors.state && <span className="address-field-error" role="alert">{formErrors.state}</span>}
                  </div>

                  {/* Label (Home / Work / Other) */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
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

                  {/* Make Default Checkbox */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <input
                      type="checkbox"
                      id="address-form-default"
                      name="is_default"
                      checked={formData.is_default}
                      onChange={handleInputChange}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: 'var(--brand-primary, #704832)',
                      }}
                    />
                    <label htmlFor="address-form-default" style={{ fontSize: '15px', color: '#374151', cursor: 'pointer', userSelect: 'none' }}>
                      Set as default delivery address
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '14px', marginTop: '16px' }}>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      style={{
                        minHeight: '44px',
                        padding: '10px 28px',
                        background: 'var(--brand-primary, #704832)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '15px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        opacity: actionLoading ? 0.7 : 1,
                      }}
                    >
                      {actionLoading ? 'Saving...' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      style={{
                        minHeight: '44px',
                        padding: '10px 24px',
                        background: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '15px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '15px' }}>
                Loading saved addresses...
              </div>
            ) : addresses.length === 0 ? (
              /* Empty state */
              <div style={{ background: '#fff', padding: '60px 24px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', background: '#fdf8f4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary, #704832)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>No saved addresses found</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px', maxWidth: '380px', marginInline: 'auto' }}>
                  Add your home or office address now to speed up future orders and checkout seamlessly.
                </p>
                <button
                  type="button"
                  id="btn-empty-add-address"
                  onClick={handleOpenAddForm}
                  style={{
                    minHeight: '44px',
                    padding: '10px 26px',
                    background: 'var(--brand-primary, #704832)',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                >
                  + Add Address
                </button>
              </div>
            ) : (
              /* Address Cards List */
              <div className="address-card-grid">
                {addresses.map(addr => {
                  const displayName = addr.full_name || addr.name;
                  const displayLine1 = addr.line1 || addr.address_line;
                  const displayLandmark = addr.landmark || addr.locality;
                  const displayLabel = addr.label || 'Home';
                  const isDefault = !!addr.is_default;

                  return (
                    <div
                      key={addr.id}
                      className={`address-item-card ${isDefault ? 'address-item-card--default' : ''}`}
                    >
                      <div>
                        {/* Top row with name, label, default badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '16px', color: '#111827' }}>{displayName}</strong>
                            {displayLabel && (
                              <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, background: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '4px' }}>
                                {displayLabel}
                              </span>
                            )}
                          </div>
                          {isDefault && (
                            <span style={{ fontSize: '11px', fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                              DEFAULT
                            </span>
                          )}
                        </div>

                        {/* Address details */}
                        <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.55', marginBottom: '16px' }}>
                          <div>{displayLine1}</div>
                          {addr.line2 && <div>{addr.line2}</div>}
                          {displayLandmark && <div>Landmark: {displayLandmark}</div>}
                          <div>{addr.city}, {addr.state} - {addr.pincode}</div>
                          <div>{addr.country || 'India'}</div>
                          <div style={{ marginTop: '8px', fontWeight: 500, color: '#1f2937' }}>
                            Phone: +91 {addr.phone}
                          </div>
                        </div>
                      </div>

                      {/* Card actions */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
                        {!isDefault && (
                          <button
                            type="button"
                            className="address-action-btn"
                            onClick={() => handleSetDefault(addr.id)}
                            disabled={actionLoading}
                            style={{ color: '#4b5563', background: '#f9fafb', border: '1px solid #e5e7eb', fontSize: '13px' }}
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          type="button"
                          className="address-action-btn"
                          onClick={() => handleEdit(addr)}
                          style={{ color: '#2563eb', fontSize: '13px' }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="address-action-btn"
                          onClick={() => handleDelete(addr.id)}
                          disabled={actionLoading}
                          style={{ color: '#dc2626', fontSize: '13px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
