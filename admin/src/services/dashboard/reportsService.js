import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const reportsService = {
  getRevenueReport: async (startDate, endDate) => {
    const res = await api.get(ENDPOINTS.REPORTS_REVENUE, { params: { startDate, endDate } });
    return res.data;
  },

  getOccupancyReport: async (month, year) => {
    const res = await api.get(ENDPOINTS.REPORTS_OCCUPANCY, { params: { month, year } });
    return res.data;
  },

  getBookingsReport: async (params = {}) => {
    const res = await api.get(ENDPOINTS.REPORTS_BOOKINGS, { params });
    return res.data;
  },

  exportReport: async (type, format = 'csv') => {
    const res = await api.get(`/api/admin/reports/${type}/export`, {
      params: { format },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export default reportsService;
