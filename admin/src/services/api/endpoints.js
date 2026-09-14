const BASE = '';

export const ENDPOINTS = {
  // Auth
  LOGIN: `${BASE}/auth/login`,
  ME: `${BASE}/auth/me`,
  LOGOUT: `${BASE}/auth/logout`,
  FORGOT_PASSWORD: `${BASE}/auth/forgot-password`,
  RESET_PASSWORD: `${BASE}/auth/reset-password`,

  // Dashboard
  DASHBOARD_STATS: `${BASE}/admin/dashboard/stats`,
  DASHBOARD_REVENUE: `${BASE}/admin/dashboard/revenue`,
  DASHBOARD_OCCUPANCY: `${BASE}/admin/dashboard/occupancy`,

  // Bookings
  BOOKINGS: `${BASE}/bookings`,
  BOOKING_BY_ID: (id) => `${BASE}/bookings/${id}`,
  BOOKING_UPDATE_STATUS: (id) => `${BASE}/bookings/${id}/status`,
  BOOKING_CANCEL: (id) => `${BASE}/bookings/${id}/cancel`,
  BOOKING_MESSAGE: (id) => `${BASE}/bookings/${id}/message`,

  // Rooms
  ROOMS: `${BASE}/rooms`,
  ROOM_UPLOAD: `${BASE}/rooms/upload`,
  ROOM_BY_ID: (id) => `${BASE}/rooms/${id}`,
  ROOM_CREATE: `${BASE}/rooms`,
  ROOM_UPDATE: (id) => `${BASE}/rooms/${id}`,
  ROOM_DELETE: (id) => `${BASE}/rooms/${id}`,

  // Restaurant / Menu
  MENU_ITEMS: `${BASE}/restaurant/items`,
  MENU_ITEM_BY_ID: (id) => `${BASE}/restaurant/items/${id}`,
  MENU_CATEGORIES: `${BASE}/restaurant/categories`,
  TABLE_RESERVATIONS: `${BASE}/restaurant/reservations`,

  // Events
  EVENTS: `${BASE}/events`,
  EVENT_UPLOAD: `${BASE}/events/upload`,
  EVENT_BY_ID: (id) => `${BASE}/events/${id}`,
  EVENT_ENQUIRIES: `${BASE}/events/enquiries`,
  EVENT_PACKAGES: `${BASE}/events/packages`,

  // Gallery
  GALLERY: `${BASE}/gallery`,
  GALLERY_UPLOAD: `${BASE}/gallery/upload`,
  GALLERY_UPDATE: (id) => `${BASE}/gallery/${id}`,
  GALLERY_DELETE: (id) => `${BASE}/gallery/${id}`,

  // Amenities
  AMENITIES: `${BASE}/amenities`,
  AMENITIES_UPLOAD: `${BASE}/amenities/upload`,
  AMENITIES_UPDATE: (id) => `${BASE}/amenities/${id}`,
  AMENITIES_DELETE: (id) => `${BASE}/amenities/${id}`,

  // Messages
  MESSAGES: `${BASE}/messages`,
  MESSAGE_BY_ID: (id) => `${BASE}/messages/${id}`,
  MESSAGE_REPLY: (id) => `${BASE}/messages/${id}/reply`,
  MESSAGE_MARK_READ: (id) => `${BASE}/messages/${id}/read`,

  // Users
  USERS: `${BASE}/users`,
  USER_BY_ID: (id) => `${BASE}/users/${id}`,
  USER_UPDATE_ROLE: (id) => `${BASE}/users/${id}/role`,

  // Settings
  HOTEL_SETTINGS: `${BASE}/admin/settings/hotel`,
  PRICING_SETTINGS: `${BASE}/admin/settings/pricing`,
  NOTIFICATION_SETTINGS: `${BASE}/admin/settings/notifications`,

  // Reports
  REPORTS_REVENUE: `${BASE}/admin/reports/revenue`,
  REPORTS_OCCUPANCY: `${BASE}/admin/reports/occupancy`,
  REPORTS_BOOKINGS: `${BASE}/admin/reports/bookings`,
};

export default ENDPOINTS;
