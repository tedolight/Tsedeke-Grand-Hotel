import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const bookingService = {
  create: (data) => api.post(ENDPOINTS.BOOKINGS.BASE, data),
  getMyBookings: () => api.get(ENDPOINTS.BOOKINGS.MY),
  getBooking: (id) => api.get(ENDPOINTS.BOOKINGS.DETAIL(id)),
  cancel: (id) => api.put(ENDPOINTS.BOOKINGS.CANCEL(id)),
  checkAvailability: (roomId, checkIn, checkOut) => api.post(ENDPOINTS.BOOKINGS.AVAILABILITY(roomId), { checkIn, checkOut }),
};

export default bookingService;
