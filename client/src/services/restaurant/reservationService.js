import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const reservationService = {
  create: (data) => api.post(ENDPOINTS.RESTAURANT.RESERVATIONS, data),
};

export default reservationService;
