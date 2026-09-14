import api from '../api/api.js';

export const settingsService = {
  getSettings: async (key) => {
    const res = await api.get(`/admin/settings/${key}`);
    return res.data?.data || res.data;
  },

  updateSettings: async (key, value) => {
    const res = await api.put(`/admin/settings/${key}`, value);
    return res.data?.data || res.data;
  },
};

export default settingsService;
