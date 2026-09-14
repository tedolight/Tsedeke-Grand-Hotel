import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const eventsService = {
  // Venues / Events
  getEvents: async () => {
    const res = await api.get(ENDPOINTS.EVENTS);
    return res.data;
  },

  createEvent: async (eventData) => {
    const res = await api.post(ENDPOINTS.EVENTS, eventData);
    return res.data;
  },

  updateEvent: async (id, eventData) => {
    const res = await api.put(ENDPOINTS.EVENT_BY_ID(id), eventData);
    return res.data;
  },

  deleteEvent: async (id) => {
    const res = await api.delete(ENDPOINTS.EVENT_BY_ID(id));
    return res.data;
  },

  // Packages
  getPackages: async () => {
    const res = await api.get(ENDPOINTS.EVENT_PACKAGES);
    return res.data;
  },

  createPackage: async (packageData) => {
    const res = await api.post(ENDPOINTS.EVENT_PACKAGES, packageData);
    return res.data;
  },

  updatePackage: async (id, packageData) => {
    const res = await api.put(`${ENDPOINTS.EVENT_PACKAGES}/${id}`, packageData);
    return res.data;
  },

  deletePackage: async (id) => {
    const res = await api.delete(`${ENDPOINTS.EVENT_PACKAGES}/${id}`);
    return res.data;
  },

  // Enquiries
  getEnquiries: async () => {
    const res = await api.get(ENDPOINTS.EVENT_ENQUIRIES);
    return res.data;
  },

  updateEnquiryStatus: async (id, status) => {
    const res = await api.put(`${ENDPOINTS.EVENT_ENQUIRIES}/${id}/status`, { status });
    return res.data;
  },

  // Image upload
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post(ENDPOINTS.EVENT_UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data; // { success, data: cloudinaryUrl }
  },
};

export default eventsService;
