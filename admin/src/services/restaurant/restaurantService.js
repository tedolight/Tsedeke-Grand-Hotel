import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const restaurantService = {
  // Menu Items
  getMenuItems: async () => {
    const res = await api.get(ENDPOINTS.MENU_ITEMS);
    return res.data;
  },

  createMenuItem: async (itemData) => {
    const res = await api.post(ENDPOINTS.MENU_ITEMS, itemData);
    return res.data;
  },

  updateMenuItem: async (id, itemData) => {
    const res = await api.put(ENDPOINTS.MENU_ITEM_BY_ID(id), itemData);
    return res.data;
  },

  deleteMenuItem: async (id) => {
    const res = await api.delete(ENDPOINTS.MENU_ITEM_BY_ID(id));
    return res.data;
  },

  // Categories
  getMenuCategories: async () => {
    const res = await api.get(ENDPOINTS.MENU_CATEGORIES);
    return res.data;
  },

  createMenuCategory: async (categoryData) => {
    const res = await api.post(ENDPOINTS.MENU_CATEGORIES, categoryData);
    return res.data;
  },

  deleteMenuCategory: async (id) => {
    const res = await api.delete(`${ENDPOINTS.MENU_CATEGORIES}/${id}`);
    return res.data;
  },

  // Table Reservations
  getTableReservations: async () => {
    const res = await api.get(ENDPOINTS.TABLE_RESERVATIONS);
    return res.data;
  },

  createTableReservation: async (reservationData) => {
    const res = await api.post(ENDPOINTS.TABLE_RESERVATIONS, reservationData);
    return res.data;
  },

  updateReservationStatus: async (id, status) => {
    const res = await api.put(`${ENDPOINTS.TABLE_RESERVATIONS}/${id}/status`, { status });
    return res.data;
  },

  deleteReservation: async (id) => {
    const res = await api.delete(`${ENDPOINTS.TABLE_RESERVATIONS}/${id}`);
    return res.data;
  },
};

export default restaurantService;
