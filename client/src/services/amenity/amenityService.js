import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const amenityService = {
  getAmenities: async () => {
    const res = await api.get(ENDPOINTS.AMENITIES.BASE);
    return res.data;
  },
};

export default amenityService;
