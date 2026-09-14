import { create } from 'zustand';
import api from '../../services/api/api.js';
import { unwrapData, getErrorMessage } from '../../utils/apiHelpers.js';

const useRoomStore = create((set) => ({
  rooms: [],
  room: null,
  loading: false,
  error: null,

  fetchRooms: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.sort) {
        if (filters.sort === 'Price: Low to High') params.append('sort', 'price');
        else if (filters.sort === 'Price: High to Low') params.append('sort', '-price');
        else params.append('sort', filters.sort);
      }
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.isFeatured !== undefined) params.append('isFeatured', String(filters.isFeatured));
      params.append('_t', String(Date.now()));

      const res = await api.get(`/rooms?${params.toString()}`);
      set({ rooms: unwrapData(res) || [], loading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to fetch rooms'), loading: false });
    }
  },

  fetchAvailableRooms: async (checkIn, checkOut, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      params.append('checkIn', checkIn);
      params.append('checkOut', checkOut);

      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.sort) {
        if (filters.sort === 'Price: Low to High') params.append('sort', 'price');
        if (filters.sort === 'Price: High to Low') params.append('sort', '-price');
      }
      if (filters.limit) params.append('limit', String(filters.limit));
      params.append('_t', String(Date.now()));

      const res = await api.get(`/rooms/available?${params.toString()}`);
      set({ rooms: unwrapData(res) || [], loading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to fetch available rooms'), loading: false });
    }
  },

  fetchRoomById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/rooms/${id}?_t=${Date.now()}`);
      set({ room: unwrapData(res), loading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to fetch room details'), loading: false });
    }
  },
}));

export default useRoomStore;
