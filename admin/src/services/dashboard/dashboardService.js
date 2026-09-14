import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const dashboardService = {
  getStats: async () => {
    const res = await api.get(ENDPOINTS.DASHBOARD_STATS);
    return res.data;
  },

  getRevenue: async (range = 'week') => {
    const res = await api.get(ENDPOINTS.DASHBOARD_REVENUE, { params: { range } });
    return res.data;
  },

  getOccupancy: async () => {
    const res = await api.get(ENDPOINTS.DASHBOARD_OCCUPANCY);
    return res.data;
  },
};

export default dashboardService;
