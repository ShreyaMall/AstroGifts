// ── src/services/api.js ──
// Centralized API Client for Laravel 11/12 Backend with Graceful Offline/Demo Fallback

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

/**
 * Get stored token if any
 */
export const getAuthToken = () => {
  return localStorage.getItem('astrogifts_token') || sessionStorage.getItem('astrogifts_token') || null;
};

/**
 * Set stored auth token
 */
export const setAuthToken = (token, persistent = true) => {
  if (!token) {
    localStorage.removeItem('astrogifts_token');
    sessionStorage.removeItem('astrogifts_token');
    return;
  }
  if (persistent) {
    localStorage.setItem('astrogifts_token', token);
  } else {
    sessionStorage.setItem('astrogifts_token', token);
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
    console.warn(`[AstroGifts API Request to ${endpoint}]:`, err.message);
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

  sendOtp: async (email, password) => {
    return request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  verifyOtp: async (email, otp) => {
    const res = await request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    if (res.token) {
      localStorage.setItem('astrogifts_token', res.token);
    }
    return res;
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

export const reviewsApi = {
  getAll: async () => {
    return request('/reviews');
  },
  submitGeneral: async (data) => {
    return request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getByProduct: async (productId) => {
    return request(`/products/${productId}/reviews`);
  },
  addReview: async (productId, reviewData) => {
    return request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
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

export const commentsApi = {
  getBySlug: async (slug) => {
    return request(`/articles/${slug}/comments`);
  },
  create: async (slug, data) => {
    return request(`/articles/${slug}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  getUserOrders: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.email) query.append('email', params.email);
    if (params.order_numbers) {
      const numbers = Array.isArray(params.order_numbers) 
        ? params.order_numbers.join(',') 
        : params.order_numbers;
      query.append('order_numbers', numbers);
    }
    const qs = query.toString();
    return request(`/user/orders${qs ? '?' + qs : ''}`);
  },

  requestReturn: async (orderNumber, returnData) => {
    return request(`/orders/${orderNumber}/return-request`, {
      method: 'POST',
      body: JSON.stringify(returnData),
    });
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

  updateOrderStatus: async (orderId, statusOrData) => {
    const bodyData = typeof statusOrData === 'object' ? statusOrData : { status: statusOrData };
    return request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(bodyData),
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
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    
    const resData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg = resData.message || (resData.errors ? Object.values(resData.errors).flat().join(', ') : `Image upload failed (HTTP ${response.status})`);
      throw new Error(msg);
    }
    
    return resData;
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

  createCategory: async (data) => {
    return request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory: async (id, data) => {
    return request(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCategory: async (id) => {
    return request(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },

  getSliders: async () => {
    return request('/admin/sliders');
  },

  createSlider: async (data) => {
    return request('/admin/sliders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSlider: async (id, data) => {
    return request(`/admin/sliders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteSlider: async (id) => {
    return request(`/admin/sliders/${id}`, {
      method: 'DELETE',
    });
  },

  getPosts: async () => {
    return request('/admin/posts');
  },

  getUsers: async () => {
    return request('/admin/users');
  },

  getReviews: async () => {
    return request('/admin/reviews');
  },

  addReview: async (data) => {
    return request('/admin/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateReview: async (id, data) => {
    return request(`/admin/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteReview: async (id) => {
    return request(`/admin/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  getSizes: async () => {
    return request('/admin/sizes');
  },

  addSize: async (data) => {
    return request('/admin/sizes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSize: async (id, data) => {
    return request(`/admin/sizes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteSize: async (id) => {
    return request(`/admin/sizes/${id}`, {
      method: 'DELETE',
    });
  },

  getColors: async () => {
    return request('/admin/colors');
  },

  addColor: async (data) => {
    return request('/admin/colors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateColor: async (id, data) => {
    return request(`/admin/colors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteColor: async (id) => {
    return request(`/admin/colors/${id}`, {
      method: 'DELETE',
    });
  },

  getComments: async () => {
    return request('/admin/comments');
  },

  deleteComment: async (id) => {
    return request(`/admin/comments/${id}`, {
      method: 'DELETE',
    });
  },
};

export const contactApi = {
  submit: (data) => request('/contact', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => request('/admin/contacts'),
  delete: (id) => request(`/admin/contacts/${id}`, { method: 'DELETE' }),
};

export const faqApi = {
  getAll: () => request('/faqs'),
  adminCreate: (data) => request('/admin/faqs', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdate: (id, data) => request(`/admin/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDelete: (id) => request(`/admin/faqs/${id}`, { method: 'DELETE' }),
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
  reviews: reviewsApi,
  contact: contactApi,
  faq: faqApi,
};
