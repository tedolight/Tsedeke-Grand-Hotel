import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const bookingsService = {
  getBookings: async () => {
    const res = await api.get(ENDPOINTS.BOOKINGS);
    return res.data;
  },

  createBooking: async (bookingData) => {
    const res = await api.post(ENDPOINTS.BOOKINGS, bookingData);
    return res.data;
  },

  updateStatus: async (id, status, paymentStatus) => {
    const res = await api.put(ENDPOINTS.BOOKING_UPDATE_STATUS(id), { status, paymentStatus });
    return res.data;
  },

  cancelBooking: async (id) => {
    const res = await api.put(ENDPOINTS.BOOKING_CANCEL(id));
    return res.data;
  },
  
  sendMessage: async (id, messageData) => {
    const res = await api.post(ENDPOINTS.BOOKING_MESSAGE(id), messageData);
    return res.data;
  },
};

export default bookingsService;
