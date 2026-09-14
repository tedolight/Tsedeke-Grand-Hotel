import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const contactService = {
  submit: (data) => api.post(ENDPOINTS.CONTACT.BASE, data),
};

export default contactService;
