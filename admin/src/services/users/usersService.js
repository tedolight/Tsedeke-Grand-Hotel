import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const usersService = {
  getUsers: async () => {
    const res = await api.get(ENDPOINTS.USERS);
    return res.data;
  },

  getUserById: async (id) => {
    const res = await api.get(ENDPOINTS.USER_BY_ID(id));
    return res.data;
  },

  createUser: async (userData) => {
    const res = await api.post(ENDPOINTS.USERS, userData);
    return res.data;
  },

  updateUserRole: async (id, role) => {
    const res = await api.put(ENDPOINTS.USER_UPDATE_ROLE(id), { role });
    return res.data;
  },

  updateUser: async (id, userData) => {
    const res = await api.put(ENDPOINTS.USER_BY_ID(id), userData);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(ENDPOINTS.USER_BY_ID(id));
    return res.data;
  },
};

export default usersService;
