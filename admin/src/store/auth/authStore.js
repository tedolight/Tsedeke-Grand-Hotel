import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('admin_token') || null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      const { token, data } = res.data;
      
      if (data.role !== 'admin') {
        throw new Error('Not authorized as an admin');
      }

      localStorage.setItem('admin_token', token);
      set({
        user: data,
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
      const res = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const user = res.data.data || res.data;
      if (user.role !== 'admin') {
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
