import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const amenityService = {
  getAmenities: async () => {
    const res = await api.get(ENDPOINTS.AMENITIES);
    return res.data;
  },

  uploadImage: async (formData) => {
    const res = await api.post(ENDPOINTS.AMENITIES_UPLOAD, formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return res.data;
  },

  createAmenity: async (itemData) => {
    const res = await api.post(ENDPOINTS.AMENITIES, itemData);
    return res.data;
  },

  updateAmenity: async (id, itemData) => {
    const res = await api.put(ENDPOINTS.AMENITIES_UPDATE(id), itemData);
    return res.data;
  },

  deleteAmenity: async (id) => {
    const res = await api.delete(ENDPOINTS.AMENITIES_DELETE(id));
    return res.data;
  },
};

export default amenityService;
