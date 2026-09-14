import { create } from 'zustand';
import api from '../../services/api/api.js';
import { unwrapData } from '../../utils/apiHelpers.js';

export const DEFAULT_HOTEL_SETTINGS = {
  hotelName: 'Tsedeke Grand Hotel & Suites',
  tradingName: 'Tsedeke Grand Hotel',
  starRating: 4,
  hotelType: 'Boutique Hotel',
  description: 'Tsedeke Grand Hotel & Suites is a premier luxury property offering exceptional comfort and elegance in the heart of Hossana City, Ethiopia. With world-class amenities and personalized service, we redefine the luxury hospitality experience.',
  establishedYear: 2024,
  totalRooms: 38,
  // Branding
  primaryColor: '#C9A84C',
  accentColor: '#8B6914',
  websiteUrl: 'https://tsedekegrandhotel.com',
  logoName: 'Tsedeke Grand',
  logoUrl: '',
  faviconUrl: '',
  bannerUrl: '',
  // Location
  streetAddress: 'Hadiya Zone, Kebele 03',
  city: 'Hossana',
  subCity: 'Hossana',
  country: 'Ethiopia',
  postalCode: '1000',
  latitude: '7.55',
  longitude: '37.85',
  // Contact
  mainPhone: '+251 90 951 7777',
  reservationsPhone: '+251 90 951 7777',
  generalEmail: 'tsedekegrandhotel@gmail.com',
  reservationsEmail: 'tsedekegrandhotel@gmail.com',
  whatsapp: '+251 90 951 7777',
  fax: '',
  facebook: 'https://facebook.com/tsedekegrandhotel',
  instagram: 'https://instagram.com/tsedekegrandhotel',
  twitter: '',
  tiktok: 'https://www.tiktok.com/@grandtsedekehotelresort',
  // Bank details
  bankName: 'Commercial Bank of Ethiopia (CBE)',
  bankAccountNo: '100023456789',
  bankAccountName: 'Tsedeke Grand Hotel',
  // Team members
  team: [
    { name: 'Ahmed Suleiman', role: 'General Manager', bio: '15 years in luxury hospitality across East Africa.', img: '/images/custom/unnamed_3.png' },
    { name: 'Tigist Bekele', role: 'Executive Chef', bio: 'Award-winning chef blending Ethiopian and international culinary arts.', img: '/images/custom/unnamed_6.png' },
    { name: 'Meron Haile', role: 'Events Manager', bio: 'Orchestrating unforgettable weddings and conferences since 2016.', img: '/images/custom/unnamed_7.png' },
    { name: 'Dawit Girma', role: 'Guest Relations', bio: 'Your first smile and last farewell, dedicated to your comfort.', img: '/images/custom/1.jpg' }
  ],
  // Amenities
  amenities: [
    'wifi', 'pool', 'gym', 'restaurant', 'bar', 'spa', 'parking', 'shuttle', 'concierge', 'breakfast', 'business', 'hall'
  ],
  checkIn: '14:00',
  checkOut: '12:00',
  earlyCheckIn: '10:00',
  lateCheckOut: '16:00',
  breakfastStart: '06:00',
  breakfastEnd: '10:30',
  lunchStart: '12:00',
  lunchEnd: '15:00',
  dinnerStart: '18:30',
  dinnerEnd: '22:30',
  poolOpen: '07:00',
  poolClose: '21:00',
  spaOpen: '08:00',
  spaClose: '20:00',
  cancellationPolicy: 'Free cancellation up to 48h',
  minAge: 18,
  cancellationDetails: "Guests may cancel free of charge up to 48 hours before arrival. Cancellations within 48 hours will incur a charge equivalent to one night's stay. No-shows will be charged in full.",
  houseRules: "No parties or events in guest rooms. Quiet hours from 22:00 to 07:00. No smoking in non-smoking areas. Pets are not permitted unless otherwise arranged in advance.",
  petsAllowed: false,
  childrenWelcome: true,
  accessibleRooms: true
};

export const DEFAULT_PRICING_SETTINGS = {
  primaryCurrency: 'ETB - Ethiopian Birr',
  displayCurrency: 'Same as primary (ETB)',
  symbolPosition: 'Prefix (ETB 1,200)',
  decimalPlaces: '2 (1,200.00)',
  taxInclusive: true,
  multiCurrency: false,
  rates: [
    { key: 'standard', name: 'Standard Room', weekday: 2800, weekend: 3200, extraGuest: 500, minStay: 1, icon: 'fas fa-bed' },
    { key: 'deluxe', name: 'Deluxe Room', weekday: 4200, weekend: 4800, extraGuest: 700, minStay: 1, icon: 'fas fa-star' },
    { key: 'junior', name: 'Junior Suite', weekday: 6500, weekend: 7200, extraGuest: 900, minStay: 2, icon: 'fas fa-crown' },
    { key: 'presidential', name: 'Presidential Suite', weekday: 14000, weekend: 16000, extraGuest: 1200, minStay: 3, icon: 'fas fa-gem' }
  ],
  seasons: [
    { id: 'enkutatash', name: 'Ethiopian New Year (Enkutatash)', type: 'Peak', from: '2025-09-08', to: '2025-09-18', adjustment: 35 },
    { id: 'christmas', name: 'Christmas & New Year', type: 'Peak', from: '2024-12-20', to: '2025-01-07', adjustment: 50 },
    { id: 'lowseason', name: 'Low Season — June / July', type: 'Off-Peak', from: '2025-06-01', to: '2025-07-31', adjustment: 20 }
  ],
  extras: [
    { id: 'transfer', name: 'Airport Transfer (one-way)', price: 800, per: 'Per trip', active: true },
    { id: 'breakfast', name: 'Breakfast Buffet', price: 450, per: 'Per person', active: true },
    { id: 'spa', name: 'Spa Day Pass', price: 1200, per: 'Per person', active: true },
    { id: 'checkout', name: 'Late Check-out (until 4pm)', price: 600, per: 'Per trip', active: true },
    { id: 'parking', name: 'Parking (per day)', price: 0, per: 'Per night', active: false }
  ],
  discounts: [
    { id: 'longstay', name: 'Long Stay Discount', desc: 'Automatically applied for bookings of 7 nights or more', val: '15% off', percent: 15, active: true, icon: 'fas fa-moon' },
    { id: 'earlybird', name: 'Early Bird Discount', desc: 'Book 30+ days in advance to receive a discount', val: '10% off', percent: 10, active: true, icon: 'fas fa-calendar-check' },
    { id: 'corporate', name: 'Corporate Rate', desc: 'For verified corporate accounts and loyalty members', val: '20% off', percent: 20, active: true, icon: 'fas fa-user-tie' },
    { id: 'promo_tsedeke20', name: 'Promo Code: TSEDEKE20', desc: 'Limited-time promotional code — expires Dec 31, 2025', val: '20% off', percent: 20, active: false, icon: 'fas fa-tag' }
  ],
  taxes: [
    { id: 'vat', name: 'VAT (Value Added Tax)', desc: 'Applied to all charges', rate: 15, per: 'All charges', active: true, isPercent: true },
    { id: 'levy', name: 'Tourism Development Levy', desc: 'Per room per night', rate: 50, per: 'Per night', active: true, isPercent: false },
    { id: 'service', name: 'Service Charge', desc: 'Restaurant & bar bills', rate: 10, per: 'F&B only', active: true, isPercent: true },
    { id: 'citytax', name: 'City Tax', desc: 'Per person per night', rate: 30, per: 'Per night', active: false, isPercent: false }
  ]
};

const useSettingsStore = create((set, get) => ({
  hotelSettings: DEFAULT_HOTEL_SETTINGS,
  pricingSettings: DEFAULT_PRICING_SETTINGS,
  loading: false,
  loaded: false,

  fetchSettings: async () => {
    if (get().loaded) return;
    set({ loading: true });
    try {
      const [hotelRes, pricingRes] = await Promise.all([
        api.get('/admin/settings/hotel'),
        api.get('/admin/settings/pricing')
      ]);

      const hotelData = unwrapData(hotelRes);
      const pricingData = unwrapData(pricingRes);

      const mergedHotel = hotelData && Object.keys(hotelData).length > 0
        ? { ...DEFAULT_HOTEL_SETTINGS, ...hotelData }
        : DEFAULT_HOTEL_SETTINGS;

      // Sanitize legacy Adila / Shembelella branding that may still exist in DB
      if (mergedHotel.logoName && /adila|shembelella/i.test(mergedHotel.logoName)) {
        mergedHotel.logoName = DEFAULT_HOTEL_SETTINGS.logoName; // 'Tsedeke Grand'
      }
      if (mergedHotel.hotelName && /adila|shembelella/i.test(mergedHotel.hotelName)) {
        mergedHotel.hotelName = DEFAULT_HOTEL_SETTINGS.hotelName;
      }
      if (mergedHotel.tradingName && /adila|shembelella/i.test(mergedHotel.tradingName)) {
        mergedHotel.tradingName = DEFAULT_HOTEL_SETTINGS.tradingName;
      }
      if (mergedHotel.streetAddress && /adila|shembelella/i.test(mergedHotel.streetAddress)) {
        mergedHotel.streetAddress = mergedHotel.streetAddress.replace(/(adila|shembelella)\s*hotel/gi, 'Tsedeke Grand Hotel').replace(/adila|shembelella/gi, 'Tsedeke Grand');
      }
      if (mergedHotel.description && /adila|shembelella/i.test(mergedHotel.description)) {
        mergedHotel.description = mergedHotel.description.replace(/(adila|shembelella)\s*hotel/gi, 'Tsedeke Grand Hotel').replace(/adila|shembelella/gi, 'Tsedeke Grand');
      }
      if (Array.isArray(mergedHotel.team)) {
        mergedHotel.team = mergedHotel.team.map((m) => ({
          ...m,
          name: m.name ? m.name.replace(/(adila|shembelella)\s*hotel/gi, 'Tsedeke Grand Hotel').replace(/adila|shembelella/gi, 'Tsedeke Grand') : m.name,
          bio: m.bio ? m.bio.replace(/(adila|shembelella)\s*hotel/gi, 'Tsedeke Grand Hotel').replace(/adila|shembelella/gi, 'Tsedeke Grand') : m.bio,
        }));
      }

      const mergedPricing = pricingData && Object.keys(pricingData).length > 0
        ? { ...DEFAULT_PRICING_SETTINGS, ...pricingData }
        : DEFAULT_PRICING_SETTINGS;

      set({
        hotelSettings: mergedHotel,
        pricingSettings: mergedPricing,
        loaded: true
      });

      // Apply dynamic colors
      if (mergedHotel.primaryColor) {
        document.documentElement.style.setProperty('--gold', mergedHotel.primaryColor);
        document.documentElement.style.setProperty('--gold-border', `${mergedHotel.primaryColor}38`);
        document.documentElement.style.setProperty('--gold-border-mid', `${mergedHotel.primaryColor}66`);
      }
      if (mergedHotel.accentColor) {
        document.documentElement.style.setProperty('--gold-dark', mergedHotel.accentColor);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      set({ loading: false });
    }
  }
}));

export default useSettingsStore;
