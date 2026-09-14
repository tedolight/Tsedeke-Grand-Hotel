import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const galleryService = {
  getAll: (category) => api.get(ENDPOINTS.GALLERY.BASE, { params: category ? { category } : {} }),
  getCategories: () => api.get(ENDPOINTS.GALLERY.CATEGORIES),
};

export default galleryService;
