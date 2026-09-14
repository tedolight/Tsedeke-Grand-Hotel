import { create } from 'zustand';
import api from '../../services/api/api.js';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.token);
      set({
        user: res.data,
        token: res.token,
        isAuthenticated: true,
        loading: false,
      });
      return true;
    } catch (err) {
      set({ error: err.message || 'Registration failed', loading: false });
      return false;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.token);
      set({
        user: res.data,
        token: res.token,
        isAuthenticated: true,
        loading: false,
      });
      return true;
    } catch (err) {
      set({ error: err.message || 'Login failed', loading: false });
      return false;
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ loading: true });
    try {
      const res = await api.get('/auth/me');
      set({
        user: res.data,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      await api.post('/auth/forgot-password', { email });
      set({ loading: false });
      return true;
    } catch (err) {
      set({ error: err.message || 'Failed to send reset email', loading: false });
      return false;
    }
  },

  resetPassword: async (token, password) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      set({ loading: false });
      return true;
    } catch (err) {
      set({ error: err.message || 'Failed to reset password', loading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
