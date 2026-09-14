import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const galleryService = {
  getGalleryItems: async (category) => {
    const params = category ? { category } : {};
    const res = await api.get(ENDPOINTS.GALLERY, { params });
    return res.data;
  },

  uploadImage: async (formData) => {
    const res = await api.post(ENDPOINTS.GALLERY_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  createGalleryItem: async (itemData) => {
    const res = await api.post(ENDPOINTS.GALLERY, itemData);
    return res.data;
  },

  updateGalleryItem: async (id, itemData) => {
    const res = await api.put(ENDPOINTS.GALLERY_UPDATE(id), itemData);
    return res.data;
  },

  deleteGalleryItem: async (id) => {
    const res = await api.delete(ENDPOINTS.GALLERY_DELETE(id));
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get(`${ENDPOINTS.GALLERY}/categories`);
    return res.data;
  },

  createCategory: async (categoryData) => {
    const res = await api.post(`${ENDPOINTS.GALLERY}/categories`, categoryData);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await api.delete(`${ENDPOINTS.GALLERY}/categories/${id}`);
    return res.data;
  },
};

export default galleryService;
