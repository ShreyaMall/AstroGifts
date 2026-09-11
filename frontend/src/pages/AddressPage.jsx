import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addressesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const NAV = [
  { label: 'User Info', icon: '👤', to: '/profile' },
  { label: 'Wishlist',  icon: '🤍', to: '/wishlist' },
  { label: 'Orders',    icon: '📦', to: '/my-orders' },
  { label: 'Address',   icon: '📍', to: '/address', active: true },
];

export default function AddressPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', pincode: '', locality: '',
    address_line: '', city: '', state: '', is_default: false
  });
  const [editingId, setEditingId] = useState(null);

  const fetchAddresses = () => {
    setLoading(true);
    addressesApi.getUserAddresses()
      .then(res => setAddresses(res || []))
      .catch(err => console.error("Failed to load addresses", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchAddresses();
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await addressesApi.updateAddress(editingId, formData);
      } else {
        await addressesApi.addAddress(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '', phone: '', pincode: '', locality: '',
        address_line: '', city: '', state: '', is_default: false
      });
      fetchAddresses();
    } catch (err) {
      alert("Error saving address: " + (err.data?.message || err.message));
    }
  };

  const handleEdit = (addr) => {
    setFormData({
      name: addr.name || '',
      phone: addr.phone || '',
      pincode: addr.pincode || '',
      locality: addr.locality || '',
      address_line: addr.address_line || '',
      city: addr.city || '',
      state: addr.state || '',
      is_default: !!addr.is_default
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await addressesApi.deleteAddress(id);
      fetchAddresses();
    } catch (err) {
      alert("Error deleting address");
    }
  };

  return (
    <>
      <Header />
      <div style={{ minHeight: 'calc(100vh - 400px)', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 20px 80px', display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

          {/* ── Sidebar ── */}
          <aside style={{ width: '200px', flexShrink: 0, background: '#fff', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', padding: '24px 0', position: 'sticky', top: '100px' }}>
            <div style={{ padding: '0 20px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: '700', fontSize: '15px', color: '#111' }}>
              User Profile
            </div>
            <nav style={{ padding: '10px 0' }}>
              {NAV.map(item => (
                <Link key={item.label} to={item.to} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 20px', textDecoration: 'none', fontSize: '14px',
                  fontWeight: item.active ? '600' : '400',
                  color: item.active ? '#d96b27' : '#444',
                  background: item.active ? '#fff7f0' : 'transparent',
                  borderLeft: item.active ? '3px solid #d96b27' : '3px solid transparent',
                }}>
                  <span>{item.icon}</span>{item.label}
                </Link>
              ))}
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 20px', width: '100%', textAlign: 'left',
                fontSize: '14px', color: '#e53e3e', background: 'none',
                border: 'none', borderLeft: '3px solid transparent', cursor: 'pointer',
              }}>
                🚪 Logout
              </button>
            </nav>
          </aside>

          {/* ── Main Content ── */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px', color: '#111' }}>My Addresses</h1>
                <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>Manage your shipping addresses</p>
              </div>
              {!showForm && (
                <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({name: '', phone: '', pincode: '', locality: '', address_line: '', city: '', state: '', is_default: false}); }} style={{ padding: '10px 20px', background: '#d96b27', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                  + Add New Address
                </button>
              )}
            </div>

            {showForm ? (
              <div style={{ background: '#fff', padding: '28px', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: '18px' }}>{editingId ? 'Edit Address' : 'Add New Address'}</h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Full Name *</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Phone Number *</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Pincode *</label>
                    <input name="pincode" value={formData.pincode} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Address Line (House No, Building, Street) *</label>
                    <input name="address_line" value={formData.address_line} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Locality / Area</label>
                    <input name="locality" value={formData.locality} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>City / District *</label>
                    <input name="city" value={formData.city} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>State *</label>
                    <input name="state" value={formData.state} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <input type="checkbox" name="is_default" id="is_default" checked={formData.is_default} onChange={handleInputChange} />
                    <label htmlFor="is_default" style={{ fontSize: '14px' }}>Make this my default address</label>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button type="submit" style={{ padding: '10px 24px', background: '#d96b27', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                      Save Address
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 24px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div style={{ background: '#fff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>No addresses found.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {addresses.map(addr => (
                  <div key={addr.id} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', position: 'relative', border: addr.is_default ? '2px solid #d96b27' : '2px solid transparent' }}>
                    {addr.is_default && (
                      <span style={{ position: 'absolute', top: '16px', right: '16px', background: '#fff7f0', color: '#d96b27', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>DEFAULT</span>
                    )}
                    <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: '600', paddingRight: '60px' }}>{addr.name}</h3>
                    <div style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', marginBottom: '16px' }}>
                      <div>{addr.address_line}</div>
                      {addr.locality && <div>{addr.locality}</div>}
                      <div>{addr.city}, {addr.state} - {addr.pincode}</div>
                      <div style={{ marginTop: '8px' }}>Phone: <span style={{ fontWeight: '500' }}>{addr.phone}</span></div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                      <button onClick={() => handleEdit(addr)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '600', fontSize: '13px', cursor: 'pointer', padding: 0 }}>Edit</button>
                      <button onClick={() => handleDelete(addr.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '600', fontSize: '13px', cursor: 'pointer', padding: 0 }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
