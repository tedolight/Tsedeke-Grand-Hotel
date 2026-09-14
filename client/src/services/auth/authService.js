import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const authService = {
  login: (email, password) => api.post(ENDPOINTS.AUTH.LOGIN, { email, password }),
  register: (name, email, password) => api.post(ENDPOINTS.AUTH.REGISTER, { name, email, password }),
  getMe: () => api.get(ENDPOINTS.AUTH.ME),
  getProfile: () => api.get(ENDPOINTS.AUTH.PROFILE),
  updateProfile: (data) => api.put(ENDPOINTS.AUTH.PROFILE, data),
  forgotPassword: (email) => api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  changePassword: (currentPassword, newPassword) => api.put(ENDPOINTS.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword }),
};

export default authService;
