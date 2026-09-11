// ── src/services/api.js ──
// Centralized API Client for Laravel 11/12 Backend with Graceful Offline/Demo Fallback

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

/**
 * Get stored token if any
 */
export const getAuthToken = () => {
  return localStorage.getItem('woodmart_token') || sessionStorage.getItem('woodmart_token') || null;
};

/**
 * Set stored auth token
 */
export const setAuthToken = (token, persistent = true) => {
  if (!token) {
    localStorage.removeItem('woodmart_token');
    sessionStorage.removeItem('woodmart_token');
    return;
  }
  if (persistent) {
    localStorage.setItem('woodmart_token', token);
  } else {
    sessionStorage.setItem('woodmart_token', token);
  }
};

/**
 * Generic Fetch Wrapper with JSON handling & Bearer Auth
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || data.error || `HTTP Error ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.warn(`[WoodMart API Request to ${endpoint}]:`, err.message);
    throw err;
  }
}

/* ══════════════════════════════════════════════════
   1. AUTHENTICATION APIs
══════════════════════════════════════════════════ */
export const authApi = {
  login: async (email, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  adminLogin: async (email, password) => {
    return request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name, email, password) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  me: async () => {
    return request('/auth/me');
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },
};

/* ══════════════════════════════════════════════════
   2. CATEGORIES & PRODUCTS APIs
══════════════════════════════════════════════════ */
export const categoriesApi = {
  getAll: async () => {
    return request('/categories');
  },
  getBySlug: async (slug) => {
    return request(`/categories/${slug}`);
  },
};

export const productsApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const qs = query.toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },

  getBestsellers: async () => {
    return request('/products/bestsellers');
  },

  getFeatured: async () => {
    return request('/products/featured');
  },

  getById: async (identifier) => {
    return request(`/products/${identifier}`);
  },
};

/**
 * Addresses API (Requires Auth)
 */
export const addressesApi = {
  getUserAddresses: async () => {
    return request('/addresses');
  },
  addAddress: async (addressData) => {
    return request('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  },
  updateAddress: async (id, addressData) => {
    return request(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData)
    });
  },
  deleteAddress: async (id) => {
    return request(`/addresses/${id}`, {
      method: 'DELETE'
    });
  }
};

/* ══════════════════════════════════════════════════
   3. SLIDERS & ARTICLES
══════════════════════════════════════════════════ */
export const slidersApi = {
  getAll: async () => {
    return request('/sliders');
  },
};

export const articlesApi = {
  getAll: async () => {
    return request('/articles');
  },
  getBySlug: async (slug) => {
    return request(`/articles/${slug}`);
  },
};

/* ══════════════════════════════════════════════════
   4. CHECKOUT, ORDERS & COUPONS
══════════════════════════════════════════════════ */
export const couponsApi = {
  validate: async (code, subtotal) => {
    return request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  },
};

export const ordersApi = {
  create: async (orderData) => {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  track: async (orderNumber) => {
    return request(`/orders/${orderNumber}`);
  },

  getUserOrders: async () => {
    return request('/user/orders');
  },
};

/* ══════════════════════════════════════════════════
   5. ADMIN DASHBOARD APIs
══════════════════════════════════════════════════ */
export const adminApi = {
  getStats: async () => {
    return request('/admin/stats');
  },

  getOrders: async (status = 'All', search = '') => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);
    return request(`/admin/orders?${params.toString()}`);
  },

  updateOrderStatus: async (orderId, status) => {
    return request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getProducts: async (search = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    return request(`/admin/products?${params.toString()}`);
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    // Use raw fetch because request wrapper stringifies body
    const token = getAuthToken();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'}/admin/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Image upload failed');
    }
    
    return response.json();
  },

  createProduct: async (productData) => {
    return request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: async (id, productData) => {
    return request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  deleteProduct: async (id) => {
    return request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  getCategories: async () => {
    return request('/admin/categories');
  },

  getSliders: async () => {
    return request('/admin/sliders');
  },

  getPosts: async () => {
    return request('/admin/posts');
  },

  getUsers: async () => {
    return request('/admin/users');
  },
};

export default {
  auth: authApi,
  categories: categoriesApi,
  products: productsApi,
  sliders: slidersApi,
  articles: articlesApi,
  coupons: couponsApi,
  orders: ordersApi,
  admin: adminApi,
};
