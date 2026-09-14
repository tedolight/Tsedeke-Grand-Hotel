// Room types
export const ROOM_TYPES = ['all', 'standard', 'deluxe', 'suite', 'vip'];

// Sort options
export const SORT_OPTIONS = [
  'Price: Low to High',
  'Price: High to Low',
  'Most Popular',
  'Newest First',
];

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
};

// Payment methods
export const PAYMENT_METHODS = [
  { id: 'telebirr', name: 'Telebirr', icon: '📱' },
  { id: 'chapa', name: 'Chapa', icon: '💳' },
  { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
  { id: 'cash', name: 'Cash on Arrival', icon: '💵' },
];

// Event types
export const EVENT_TYPES = [
  'Wedding',
  'Conference',
  'Corporate Meeting',
  'Birthday Party',
  'Graduation',
  'Seminar',
  'Exhibition',
  'Other',
];

// Guest ranges
export const GUEST_RANGES = [
  '1 – 30',
  '31 – 80',
  '81 – 150',
  '151 – 200',
  '201 – 350',
  '351+',
];

// Menu categories
export const MENU_CATEGORIES = [
  'All',
  'Traditional Ethiopian',
  'International',
  'Seafood',
  'Grills & BBQ',
  'Desserts',
  'Beverages',
  'Coffee & Tea',
];

// Gallery categories
export const GALLERY_CATEGORIES = [
  'all',
  'rooms',
  'restaurant',
  'events',
  'exterior',
  'interior',
  'city',
];

// API base URL
export const API_BASE_URL = '/api';

// Social media links
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/tsedekegrandhotel',
  instagram: 'https://instagram.com/tsedekegrandhotel',
  twitter: 'https://twitter.com/tsedekegrandhotel',
  tiktok: 'https://www.tiktok.com/@grandtsedekehotelresort',
};

// Contact info
export const CONTACT_INFO = {
  phone: '+251 11 XXX XXXX',
  email: 'info@tsedekegrandhotel.com',
  address: 'Hossana, SNNPR, Ethiopia',
};
