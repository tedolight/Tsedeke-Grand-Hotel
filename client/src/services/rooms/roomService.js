import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const roomService = {
  getAll: (params) => api.get(ENDPOINTS.ROOMS.BASE, { params }),
  getById: (id) => api.get(ENDPOINTS.ROOMS.DETAIL(id)),
};

export default roomService;
