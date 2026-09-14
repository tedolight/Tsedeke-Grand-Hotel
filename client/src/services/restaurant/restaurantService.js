import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const restaurantService = {
  getMenuItems: (category) => api.get(ENDPOINTS.RESTAURANT.ITEMS, { params: category ? { category } : {} }),
  getMenuItem: (id) => api.get(ENDPOINTS.RESTAURANT.ITEM(id)),
  getCategories: () => api.get(ENDPOINTS.RESTAURANT.CATEGORIES),
};

export default restaurantService;
