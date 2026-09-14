/** API endpoint constants. */
export const ENDPOINTS = {
  AUTH: { LOGIN: '/auth/login', REGISTER: '/auth/register', ME: '/auth/me', PROFILE: '/auth/profile', FORGOT_PASSWORD: '/auth/forgot-password', CHANGE_PASSWORD: '/auth/change-password' },
  ROOMS: { BASE: '/rooms', DETAIL: (id) => `/rooms/${id}`, AVAILABILITY: (id) => `/rooms/${id}/availability` },
  BOOKINGS: { BASE: '/bookings', DETAIL: (id) => `/bookings/${id}`, MY: '/bookings/my-bookings', AVAILABILITY: (roomId) => `/bookings/availability/${roomId}`, CANCEL: (id) => `/bookings/${id}/cancel`, STATUS: (id) => `/bookings/${id}/status` },
  PAYMENTS: { BASE: '/payments', DETAIL: (id) => `/payments/${id}` },
  EVENTS: { BASE: '/events', DETAIL: (id) => `/events/${id}`, PACKAGES: '/events/packages', ENQUIRIES: '/events/enquiries' },
  RESTAURANT: { ITEMS: '/restaurant/items', ITEM: (id) => `/restaurant/items/${id}`, CATEGORIES: '/restaurant/categories', RESERVATIONS: '/restaurant/reservations' },
  GALLERY: { BASE: '/gallery', CATEGORIES: '/gallery/categories' },
  CONTACT: { BASE: '/contact' },
  AMENITIES: { BASE: '/amenities' },
};

export default ENDPOINTS;
