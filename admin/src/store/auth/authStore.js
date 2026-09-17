import { create } from 'zustand';
import api from '../../services/api/api.js';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('admin_token') || null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });

      // res is response.data (raw) since admin api.js does not transform (res) => res.data
      const token = res.data?.token || res.token;
      const user = res.data?.data || res.data;

      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized as an admin');
      }

      localStorage.setItem('admin_token', token);
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      set({ error: msg, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    });
  },

  loadUser: async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    set({ loading: true });
    try {
      const res = await api.get('/auth/me');
      // admin api interceptor returns res (full response), so data is res.data
      const user = res.data?.data || res.data || res;
      if (!user || user.role !== 'admin') {
        localStorage.removeItem('admin_token');
        set({ user: null, token: null, isAuthenticated: false, loading: false });
        return;
      }

      set({
        user,
        isAuthenticated: true,
        loading: false
      });
    } catch (err) {
      localStorage.removeItem('admin_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: err.message
      });
    }
  }
}));

export default useAuthStore;
