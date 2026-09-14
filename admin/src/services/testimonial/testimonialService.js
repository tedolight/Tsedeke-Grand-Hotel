import api from '../api/api.js';

export const testimonialService = {
  getTestimonials: async () => {
    const res = await api.get('/testimonials/admin');
    return res.data;
  },

  createTestimonial: async (testimonialData) => {
    const res = await api.post('/testimonials', testimonialData);
    return res.data;
  },

  updateTestimonial: async (id, testimonialData) => {
    const res = await api.put(`/testimonials/${id}`, testimonialData);
    return res.data;
  },

  deleteTestimonial: async (id) => {
    const res = await api.delete(`/testimonials/${id}`);
    return res.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/testimonials/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};

export default testimonialService;
