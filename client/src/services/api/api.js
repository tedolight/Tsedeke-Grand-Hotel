import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const sanitizeBranding = (val) => {
  if (typeof val === 'string') {
    // Keep Cloudinary image URLs intact
    if (val.includes('res.cloudinary.com') || val.startsWith('data:image')) {
      return val;
    }
    return val
      .replace(/Adila\s*Hotel\s*&\s*Suites/gi, 'Tsedeke Grand Hotel & Suites')
      .replace(/Shembelella\s*Hotel\s*&\s*Suites/gi, 'Tsedeke Grand Hotel & Suites')
      .replace(/Adila\s*Hotel/gi, 'Tsedeke Grand Hotel')
      .replace(/Shembelella\s*Hotel/gi, 'Tsedeke Grand Hotel')
      .replace(/Adila/g, 'Tsedeke Grand')
      .replace(/ADILA/g, 'TSEDEKE GRAND')
      .replace(/adila/gi, 'tsedeke grand')
      .replace(/Shembelella/g, 'Tsedeke Grand')
      .replace(/SHEMBELELLA/g, 'TSEDEKE GRAND')
      .replace(/shembelella/gi, 'tsedeke grand');
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeBranding);
  }
  if (val !== null && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = sanitizeBranding(v);
    }
    return out;
  }
  return val;
};

// Response interceptor to handle global errors (e.g. 401 unauth)
api.interceptors.response.use(
  (response) => {
    return sanitizeBranding(response.data);
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    const data = error.response?.data;
    const message =
      (typeof data === 'object' && data?.message) ||
      error.message ||
      'Network error';
    const err = new Error(message);
    if (data) err.responseData = data;
    return Promise.reject(err);
  }
);

export default api;
