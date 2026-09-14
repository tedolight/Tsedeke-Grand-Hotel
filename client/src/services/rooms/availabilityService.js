import api from '../api/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

export const availabilityService = {
  check: (roomId, checkIn, checkOut) => api.post(ENDPOINTS.BOOKINGS.AVAILABILITY(roomId), { checkIn, checkOut }),
  getCalendar: (roomId, days = 30) => api.get(`${ENDPOINTS.ROOMS.AVAILABILITY(roomId)}/calendar`, { params: { days } }),
};

export default availabilityService;
