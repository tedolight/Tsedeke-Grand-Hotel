import { create } from 'zustand';
import api from '../../services/api/api.js';
import { unwrapData, getErrorMessage } from '../../utils/apiHelpers.js';

const useBookingStore = create((set) => ({
  myBookings: [],
  currentBooking: null,
  availability: null, // { roomId, isAvailable }
  loading: false,
  error: null,

  checkAvailability: async (roomId, checkIn, checkOut) => {
    set({ loading: true, error: null, availability: null });
    try {
      const res = await api.post(`/bookings/availability/${roomId}`, { checkIn, checkOut });
      const data = unwrapData(res);
      set({ availability: data, loading: false });
      return data?.isAvailable ?? false;
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to check availability'), loading: false });
      return false;
    }
  },

  createBooking: async (bookingData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/bookings', bookingData);
      const booking = unwrapData(res);
      set({ currentBooking: booking, loading: false });
      return booking;
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to create booking'), loading: false });
      return null;
    }
  },

  processPayment: async (paymentData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/payments', paymentData);
      const payment = unwrapData(res);
      set({ loading: false });
      return payment;
    } catch (err) {
      set({ error: getErrorMessage(err, 'Payment failed'), loading: false });
      return null;
    }
  },

  verifyChapaPayment: async (txRef) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/payments/verify/${txRef}`);
      const result = unwrapData(res);
      set({ loading: false });
      return result;
    } catch (err) {
      set({ error: getErrorMessage(err, 'Payment verification failed'), loading: false });
      return null;
    }
  },

  fetchMyBookings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/bookings/my-bookings');
      set({ myBookings: unwrapData(res) || [], loading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load bookings'), loading: false });
    }
  },

  cancelBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/bookings/${id}/cancel`);
      const updated = unwrapData(res);
      set((state) => ({
        myBookings: state.myBookings.map((b) => (b._id === id ? updated || b : b)),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to cancel booking'), loading: false });
      return false;
    }
  },
}));

export default useBookingStore;
