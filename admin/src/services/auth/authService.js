import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const authService = {
  login: async (email, password) => {
    const res = await api.post(ENDPOINTS.LOGIN, { email, password });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get(ENDPOINTS.ME);
    return res.data;
  },

  getLoginStats: async () => {
    const res = await api.get('/auth/login-stats');
    return res.data;
  },

  logout: async () => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch {}
    localStorage.removeItem('admin_token');
  },

  forgotPassword: async (email) => {
    const res = await api.post(ENDPOINTS.FORGOT_PASSWORD, { email });
    return res.data;
  },

  resetPassword: async (token, password) => {
    const res = await api.put(`/auth/reset-password/${token}`, { password });
    return res.data;
  },
};

export default authService;
