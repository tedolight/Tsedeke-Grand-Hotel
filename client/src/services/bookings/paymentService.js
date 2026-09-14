import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const paymentService = {
  processPayment: (bookingId, paymentMethod, amount) => api.post(ENDPOINTS.PAYMENTS.BASE, { bookingId, paymentMethod, amount }),
  getPayment: (id) => api.get(ENDPOINTS.PAYMENTS.DETAIL(id)),
};

export default paymentService;
