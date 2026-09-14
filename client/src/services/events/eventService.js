import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const eventService = {
  getAll: () => api.get(ENDPOINTS.EVENTS.BASE),
  getById: (id) => api.get(ENDPOINTS.EVENTS.DETAIL(id)),
  getPackages: () => api.get(ENDPOINTS.EVENTS.PACKAGES),
};

export default eventService;
