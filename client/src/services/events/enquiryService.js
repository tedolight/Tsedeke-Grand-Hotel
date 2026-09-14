import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const enquiryService = {
  submit: (data) => api.post(ENDPOINTS.EVENTS.ENQUIRIES, data),
};

export default enquiryService;
