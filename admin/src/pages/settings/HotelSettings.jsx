import React, { useState, useEffect, useRef } from 'react';
import settingsService from '../../services/settings/settingsService.js';
import galleryService from '../../services/gallery/galleryService.js';

const DEFAULT_HOTEL_SETTINGS = {
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
  tiktok: 'https://tiktok.com/@grandtsedekehotelresort',
  // Bank details
  bankName: 'Commercial Bank of Ethiopia (CBE)',
  bankAccountNo: '100023456789',
  bankAccountName: 'Tsedeke Grand Hotel',
  // Team members
  team: [
    { name: 'Ahmed Suleiman', role: 'General Manager', bio: '15 years in luxury hospitality across East Africa.', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' },
    { name: 'Tigist Bekele', role: 'Executive Chef', bio: 'Award-winning chef blending Ethiopian and international culinary arts.', img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80' },
    { name: 'Meron Haile', role: 'Events Manager', bio: 'Orchestrating unforgettable weddings and conferences since 2016.', img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80' },
    { name: 'Dawit Girma', role: 'Guest Relations', bio: 'Your first smile and last farewell — dedicated to your comfort.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' }
  ],
  // Amenities (list of selected IDs)
  amenities: [
    'wifi', 'pool', 'gym', 'restaurant', 'bar', 'spa', 'parking', 'shuttle', 'concierge', 'breakfast', 'business', 'hall'
  ],
  // Operating hours
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
  // Policies
  cancellationPolicy: 'Free cancellation up to 48h',
  minAge: 18,
  cancellationDetails: "Guests may cancel free of charge up to 48 hours before arrival. Cancellations within 48 hours will incur a charge equivalent to one night's stay. No-shows will be charged in full.",
  houseRules: "No parties or events in guest rooms. Quiet hours from 22:00 to 07:00. No smoking in non-smoking areas. Pets are not permitted unless otherwise arranged in advance.",
  petsAllowed: false,
  childrenWelcome: true,
  accessibleRooms: true
};

const HotelSettings = () => {
  const [toast, setToast] = useState({ show: false, message: '' });
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(DEFAULT_HOTEL_SETTINGS);

  const [previews, setPreviews] = useState({
    logo: null,
    favicon: null,
    banner: null
  });

  const fileInputRefs = {
    logo: useRef(null),
    favicon: useRef(null),
    banner: useRef(null)
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getSettings('hotel');
        if (data && Object.keys(data).length > 0) {
          const merged = { ...DEFAULT_HOTEL_SETTINGS, ...data };
          setSettings(merged);
          setPreviews({
            logo: merged.logoUrl || null,
            favicon: merged.faviconUrl || null,
            banner: merged.bannerUrl || null
          });
        } else {
          setSettings(DEFAULT_HOTEL_SETTINGS);
        }
      } catch (err) {
        console.error('Error fetching hotel settings:', err);
        showToast('Error loading hotel settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const sections = [
    { id: 'general', label: 'General Info', icon: 'fas fa-info-circle' },
    { id: 'branding', label: 'Branding & Logo', icon: 'fas fa-palette' },
    { id: 'location', label: 'Location & Map', icon: 'fas fa-map-marker-alt' },
    { id: 'contact', label: 'Contact Details', icon: 'fas fa-phone' },
    { id: 'billing', label: 'Bank & Billing', icon: 'fas fa-university' },
    { id: 'team', label: 'Team Management', icon: 'fas fa-users-cog' },
    { id: 'amenities', label: 'Amenities', icon: 'fas fa-concierge-bell' },
    { id: 'hours', label: 'Operating Hours', icon: 'fas fa-clock' },
    { id: 'policies', label: 'Policies', icon: 'fas fa-file-alt' },
    { id: 'danger', label: 'Danger Zone', icon: 'fas fa-exclamation-triangle', isDanger: true }
  ];

  const amenityOptions = [
    { id: 'wifi', label: 'Free WiFi', icon: 'fas fa-wifi' },
    { id: 'pool', label: 'Swimming Pool', icon: 'fas fa-swimming-pool' },
    { id: 'gym', label: 'Fitness Centre', icon: 'fas fa-dumbbell' },
    { id: 'restaurant', label: 'Restaurant', icon: 'fas fa-utensils' },
    { id: 'bar', label: 'Bar & Lounge', icon: 'fas fa-glass-martini' },
    { id: 'spa', label: 'Spa & Wellness', icon: 'fas fa-spa' },
    { id: 'parking', label: 'Free Parking', icon: 'fas fa-parking' },
    { id: 'shuttle', label: 'Airport Shuttle', icon: 'fas fa-car' },
    { id: 'concierge', label: '24h Concierge', icon: 'fas fa-concierge-bell' },
    { id: 'breakfast', label: 'Breakfast', icon: 'fas fa-coffee' },
    { id: 'business', label: 'Business Centre', icon: 'fas fa-briefcase' },
    { id: 'hall', label: 'Event Hall', icon: 'fas fa-users' },
    { id: 'kids', label: 'Kids Club', icon: 'fas fa-baby' },
    { id: 'golf', label: 'Golf Course', icon: 'fas fa-golf-ball' },
    { id: 'pets', label: 'Pet Friendly', icon: 'fas fa-dog' },
    { id: 'bikes', label: 'Bike Rental', icon: 'fas fa-bicycle' },
    { id: 'laundry', label: 'Laundry', icon: 'fas fa-tshirt' },
    { id: 'nosmoking', label: 'Non-Smoking', icon: 'fas fa-smoking-ban' }
  ];

  // Handle setting updates
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (id) => {
    setSettings(prev => {
      const amenities = prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id];
      return { ...prev, amenities };
    });
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleSave = async (sectionName) => {
    try {
      await settingsService.updateSettings('hotel', settings);
      showToast(`${sectionName} saved successfully`);
    } catch (err) {
      console.error('Error saving hotel settings:', err);
      showToast('Error saving settings', 'warning');
    }
  };

  // Scrollspy & click navigation
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      let current = 'general';
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerUpload = (type) => {
    fileInputRefs[type].current.click();
  };

  const handleFileChange = async (type, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size exceeds 5MB limit', 'warning');
        return;
      }
      const formData = new FormData();
      formData.append('image', file);
      try {
        const uploadRes = await galleryService.uploadImage(formData);
        const url = uploadRes.data.url;
        setPreviews(prev => ({ ...prev, [type]: url }));
        const urlField = type === 'logo' ? 'logoUrl' : type === 'favicon' ? 'faviconUrl' : 'bannerUrl';
        setSettings(prev => ({ ...prev, [urlField]: url }));
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);
      } catch (err) {
        console.error(`Error uploading ${type}:`, err);
        showToast(`Failed to upload ${type}`, 'warning');
      }
    }
  };

  const handleResetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all hotel settings to factory defaults?')) {
      try {
        await settingsService.updateSettings('hotel', DEFAULT_HOTEL_SETTINGS);
        setSettings(DEFAULT_HOTEL_SETTINGS);
        setPreviews({
          logo: null,
          favicon: null,
          banner: null
        });
        showToast('Settings reset to factory defaults');
      } catch (err) {
        console.error('Error resetting hotel settings:', err);
        showToast('Failed to reset settings', 'warning');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gold font-mono text-xs uppercase tracking-widest animate-pulse">
          <i className="fas fa-spinner fa-spin mr-2" /> Loading hotel settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="font-cormorant text-2xl font-bold text-white">Hotel Settings</div>
          <div className="font-mono text-[9.5px] text-text-muted tracking-[0.15em] uppercase mt-1">
            Manage property information, branding & facilities
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9.5px] text-text-muted tracking-[0.1em] uppercase">
          <a href="#" className="hover:text-gold transition-colors">Dashboard</a>
          <span className="text-gold/40">›</span>
          <span className="text-gold">Hotel Settings</span>
        </div>
      </div>

      {/* Main Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
        {/* Left Navigation Sidebar */}
        <div className="bg-dark-2 border border-border-gold-soft py-2 sticky top-[64px] sm:top-[88px] flex flex-row overflow-x-auto lg:flex-col gap-0.5 z-10 max-w-full">
          {sections.map(sec => (
            <div
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`flex items-center gap-2.5 py-2.5 px-4 lg:py-3 lg:px-5 text-xs lg:text-[13px] whitespace-nowrap cursor-pointer transition-all border-b-2 lg:border-b-0 lg:border-l-2 ${activeSection === sec.id
                ? 'text-gold bg-gold/5 border-b-gold lg:border-l-gold font-semibold'
                : 'text-text-muted border-b-transparent lg:border-l-transparent hover:text-white hover:bg-gold/5'
                }`}
              style={sec.isDanger ? { color: '#eb5757' } : undefined}
            >
              <i className={`${sec.icon} w-3.5 text-center text-[0.8rem]`} /> {sec.label}
            </div>
          ))}
        </div>

        {/* Right Content Panels */}
        <div className="space-y-5">
          {/* General Information */}
          <div className="bg-dark-2 border border-border-gold-soft" id="general">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">General Information</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Basic hotel profile details
                </div>
              </div>
              <i className="fas fa-info-circle text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-[18px]">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">
                    Hotel Name <span className="text-gold">*</span>
                  </label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="text"
                    value={settings.hotelName}
                    onChange={(e) => updateSetting('hotelName', e.target.value)}
                    placeholder="Hotel name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Trading Name</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="text"
                    value={settings.tradingName}
                    onChange={(e) => updateSetting('tradingName', e.target.value)}
                    placeholder="e.g. shorter display name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Star Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <div
                        key={star}
                        className={`w-9 h-9 border flex items-center justify-center cursor-pointer text-[14.5px] transition-all bg-dark-3 ${settings.starRating === star
                          ? 'border-gold text-gold bg-gold/10'
                          : 'border-border-gold-soft text-text-muted hover:border-gold hover:text-gold hover:bg-gold/10'
                          }`}
                        onClick={() => updateSetting('starRating', star)}
                      >
                        <i className="fas fa-star" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Hotel Type</label>
                  <select
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer appearance-none bg-no-repeat bg-right-3.5"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239A9080' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundPosition: 'right 14px center' }}
                    value={settings.hotelType}
                    onChange={(e) => updateSetting('hotelType', e.target.value)}
                  >
                    <option value="Boutique Hotel">Boutique Hotel</option>
                    <option value="Business Hotel">Business Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Luxury Hotel">Luxury Hotel</option>
                    <option value="Airport Hotel">Airport Hotel</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 col-span-full">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Short Description</label>
                  <textarea
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full resize-y min-h-[90px] leading-relaxed"
                    value={settings.description}
                    onChange={(e) => updateSetting('description', e.target.value)}
                    placeholder="Brief description of the hotel (shown on booking confirmations and emails)"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Year Established</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="number"
                    value={settings.establishedYear}
                    onChange={(e) => updateSetting('establishedYear', parseInt(e.target.value) || '')}
                    placeholder="e.g. 2015"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Total Rooms</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="number"
                    value={settings.totalRooms}
                    onChange={(e) => updateSetting('totalRooms', parseInt(e.target.value) || '')}
                    placeholder="Total number of rooms"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft">
                <button
                  className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold"
                  onClick={() => handleSave('General Info')}
                >
                  <i className="fas fa-save mr-2" />Save Changes
                </button>
                <button
                  className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white"
                  onClick={() => window.location.reload()}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Branding & Logo */}
          <div className="bg-dark-2 border border-border-gold-soft" id="branding">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Branding & Logo</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Visual identity used across the system
                </div>
              </div>
              <i className="fas fa-palette text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-5">
                <div>
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase mb-2 block">Hotel Logo</label>
                  <div
                    className="border border-dashed border-gold/30 p-8 flex flex-col items-center gap-3 cursor-pointer transition-all bg-dark-3 hover:border-gold hover:bg-gold/5"
                    onClick={() => triggerUpload('logo')}
                  >
                    {previews.logo ? (
                      <img src={previews.logo} alt="Logo" className="max-h-[60px] object-contain" />
                    ) : (
                      <div className="w-full max-w-[200px] h-20 bg-dark-4 border border-border-gold-soft flex items-center justify-center font-cormorant text-[1.2rem] font-bold text-gold">
                        {settings.logoName}
                      </div>
                    )}
                    <div className="text-[13px] text-text-muted text-center">
                      <strong className="text-gold block text-[13.5px] mb-0.5">Click to upload new logo</strong>
                      PNG, SVG, WEBP — max 5MB
                    </div>
                  </div>
                  <input
                    ref={fileInputRefs.logo}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange('logo', e)}
                  />
                </div>
                <div>
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase mb-2 block">Favicon</label>
                  <div
                    className="border border-dashed border-gold/30 p-8 flex flex-col items-center gap-3 cursor-pointer transition-all bg-dark-3 hover:border-gold hover:bg-gold/5 h-[calc(100%-28px)] justify-center"
                    onClick={() => triggerUpload('favicon')}
                  >
                    {previews.favicon ? (
                      <img src={previews.favicon} alt="Favicon" className="max-h-[36px] object-contain" />
                    ) : (
                      <div className="w-14 h-14 border border-border-gold-soft flex items-center justify-center text-[1.4rem] text-gold">
                        <i className="fas fa-star" />
                      </div>
                    )}
                    <div className="text-[13px] text-text-muted text-center">
                      <strong className="text-gold block text-[13.5px] mb-0.5">Upload Favicon</strong>
                      ICO, PNG 32×32 or 64×64
                    </div>
                  </div>
                  <input
                    ref={fileInputRefs.favicon}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange('favicon', e)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Primary Brand Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="w-[44px] h-[42px] bg-dark-3 border border-border-gold cursor-pointer p-[3px]"
                    />
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full flex-1"
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      placeholder="#RRGGBB"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Accent / Secondary Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => updateSetting('accentColor', e.target.value)}
                      className="w-[44px] h-[42px] bg-dark-3 border border-border-gold cursor-pointer p-[3px]"
                    />
                    <input
                      className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full flex-1"
                      type="text"
                      value={settings.accentColor}
                      onChange={(e) => updateSetting('accentColor', e.target.value)}
                      placeholder="#RRGGBB"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Email Header Banner</label>
                  <div
                    className="border border-dashed border-gold/30 p-4.5 flex flex-col items-center gap-3 cursor-pointer transition-all bg-dark-3 hover:border-gold hover:bg-gold/5 justify-center min-h-[90px]"
                    onClick={() => triggerUpload('banner')}
                  >
                    {previews.banner ? (
                      <img src={previews.banner} alt="Banner" className="max-h-[50px] w-full object-cover" />
                    ) : (
                      <>
                        <div className="w-10 h-10 border border-border-gold-soft flex items-center justify-center text-[1rem] text-gold">
                          <i className="fas fa-envelope-open-text" />
                        </div>
                        <div className="text-[12px] text-text-muted text-center">
                          <strong className="text-gold block text-[12.5px] mb-0.5">Upload Banner</strong>
                          1200×300px recommended
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRefs.banner}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange('banner', e)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Logo Name (Navbar Brand Text)</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full font-cinzel tracking-widest"
                    type="text"
                    value={settings.logoName || ''}
                    onChange={(e) => updateSetting('logoName', e.target.value)}
                    placeholder="Tsedeke Grand"
                  />
                  <p className="text-[10.5px] text-text-muted">Text displayed in the navbar when no logo image is uploaded.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Website URL</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="url"
                    value={settings.websiteUrl}
                    onChange={(e) => updateSetting('websiteUrl', e.target.value)}
                    placeholder="https://yourhotel.com"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => handleSave('Branding & Logo')}>
                  <i className="fas fa-save mr-2" />Save Changes
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Location & Map */}
          <div className="bg-dark-2 border border-border-gold-soft" id="location">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Location & Map</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Physical address and map coordinates
                </div>
              </div>
              <i className="fas fa-map-marker-alt text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-[18px]">
                <div className="flex flex-col gap-1.5 col-span-full">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">
                    Street Address <span className="text-gold">*</span>
                  </label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="text"
                    value={settings.streetAddress}
                    onChange={(e) => updateSetting('streetAddress', e.target.value)}
                    placeholder="Full street address"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">
                    City / Town <span className="text-gold">*</span>
                  </label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="text"
                    value={settings.city}
                    onChange={(e) => updateSetting('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Sub-City / District</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="text"
                    value={settings.subCity}
                    onChange={(e) => updateSetting('subCity', e.target.value)}
                    placeholder="Sub-city or district"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">
                    Country <span className="text-gold">*</span>
                  </label>
                  <select
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer appearance-none bg-no-repeat bg-right-3.5"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239A9080' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundPosition: 'right 14px center' }}
                    value={settings.country}
                    onChange={(e) => updateSetting('country', e.target.value)}
                  >
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Postal Code</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="text"
                    value={settings.postalCode}
                    onChange={(e) => updateSetting('postalCode', e.target.value)}
                    placeholder="Postal or ZIP code"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Latitude</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="text"
                    value={settings.latitude}
                    onChange={(e) => updateSetting('latitude', e.target.value)}
                    placeholder="e.g. 9.0107"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Longitude</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="text"
                    value={settings.longitude}
                    onChange={(e) => updateSetting('longitude', e.target.value)}
                    placeholder="e.g. 38.7612"
                  />
                </div>
              </div>
              <div
                className="bg-dark-3 border border-border-gold-soft h-40 flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:border-gold/30 transition-all mb-[18px]"
                onClick={() => showToast("Google Maps configuration API is set to development mode")}
              >
                <i className="fas fa-map-marked-alt text-[2rem] text-gold/30" />
                <span className="font-mono text-[9.5px] text-text-muted tracking-[0.12em] uppercase">Click to preview map location</span>
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => handleSave('Location & Map')}>
                  <i className="fas fa-save mr-2" />Save Changes
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-dark-2 border border-border-gold-soft" id="contact">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Contact Details</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Phone, email and social media accounts
                </div>
              </div>
              <i className="fas fa-phone text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-[18px]">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">
                    Main Phone <span className="text-gold">*</span>
                  </label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="tel"
                    value={settings.mainPhone}
                    onChange={(e) => updateSetting('mainPhone', e.target.value)}
                    placeholder="+251 ..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Reservations Phone</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="tel"
                    value={settings.reservationsPhone}
                    onChange={(e) => updateSetting('reservationsPhone', e.target.value)}
                    placeholder="+251 ..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">
                    General Email <span className="text-gold">*</span>
                  </label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="email"
                    value={settings.generalEmail}
                    onChange={(e) => updateSetting('generalEmail', e.target.value)}
                    placeholder="info@..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Reservations Email</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="email"
                    value={settings.reservationsEmail}
                    onChange={(e) => updateSetting('reservationsEmail', e.target.value)}
                    placeholder="reservations@..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">WhatsApp Number</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="tel"
                    value={settings.whatsapp}
                    onChange={(e) => updateSetting('whatsapp', e.target.value)}
                    placeholder="+251 ..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Fax</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="tel"
                    value={settings.fax}
                    onChange={(e) => updateSetting('fax', e.target.value)}
                    placeholder="+251 ..."
                  />
                </div>
              </div>
              <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase mb-2.5 block">Social Media Links</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-[18px]">
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-0">
                    <div className="w-9 h-9 bg-dark-3 border border-border-gold-soft flex items-center justify-center text-[0.9rem] text-text-muted"><i className="fab fa-facebook-f" /></div>
                    <input
                      className="bg-dark-3 border border-border-gold-soft border-l-0 text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full flex-1"
                      type="url"
                      value={settings.facebook}
                      onChange={(e) => updateSetting('facebook', e.target.value)}
                      placeholder="Facebook URL"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-0">
                    <div className="w-9 h-9 bg-dark-3 border border-border-gold-soft flex items-center justify-center text-[0.9rem] text-text-muted"><i className="fab fa-instagram" /></div>
                    <input
                      className="bg-dark-3 border border-border-gold-soft border-l-0 text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full flex-1"
                      type="url"
                      value={settings.instagram}
                      onChange={(e) => updateSetting('instagram', e.target.value)}
                      placeholder="Instagram URL"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-0">
                    <div className="w-9 h-9 bg-dark-3 border border-border-gold-soft flex items-center justify-center text-[0.9rem] text-text-muted"><i className="fab fa-twitter" /></div>
                    <input
                      className="bg-dark-3 border border-border-gold-soft border-l-0 text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full flex-1"
                      type="url"
                      value={settings.twitter}
                      onChange={(e) => updateSetting('twitter', e.target.value)}
                      placeholder="Twitter / X URL"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-0">
                    <div className="w-9 h-9 bg-dark-3 border border-border-gold-soft flex items-center justify-center text-[0.9rem] text-text-muted"><i className="fab fa-tiktok" /></div>
                    <input
                      className="bg-dark-3 border border-border-gold-soft border-l-0 text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full flex-1"
                      type="url"
                      value={settings.tiktok}
                      onChange={(e) => updateSetting('tiktok', e.target.value)}
                      placeholder="TikTok URL"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => handleSave('Contact Details')}>
                  <i className="fas fa-save mr-2" />Save Changes
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Bank & Billing */}
          <div className="bg-dark-2 border border-border-gold-soft" id="billing">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Bank & Billing Details</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Bank accounts for guest direct transfers
                </div>
              </div>
              <i className="fas fa-university text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-[18px]">
                <div className="flex flex-col gap-1.5 col-span-full">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Bank Name</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="text"
                    value={settings.bankName || ''}
                    onChange={(e) => updateSetting('bankName', e.target.value)}
                    placeholder="e.g. Commercial Bank of Ethiopia (CBE)"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Account Number</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="text"
                    value={settings.bankAccountNo || ''}
                    onChange={(e) => updateSetting('bankAccountNo', e.target.value)}
                    placeholder="e.g. 100023456789"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Account Holder Name</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="text"
                    value={settings.bankAccountName || ''}
                    onChange={(e) => updateSetting('bankAccountName', e.target.value)}
                    placeholder="e.g. Tsedeke Grand Hotel"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => handleSave('Bank Details')}>
                  <i className="fas fa-save mr-2" />Save Changes
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Team Management */}
          <div className="bg-dark-2 border border-border-gold-soft" id="team">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Team Management</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Manage team members shown on the About page
                </div>
              </div>
              <button
                type="button"
                className="bg-transparent text-gold font-mono text-[10px] tracking-[0.14em] uppercase py-2 px-4 border border-gold/40 cursor-pointer transition-all hover:bg-gold/10"
                onClick={() => {
                  const updatedTeam = [...(settings.team || [])];
                  updatedTeam.push({ name: '', role: '', bio: '', img: '' });
                  updateSetting('team', updatedTeam);
                }}
              >
                <i className="fas fa-plus mr-1.5" />Add Member
              </button>
            </div>
            <div className="p-6 space-y-6">
              {(settings.team || []).map((member, idx) => (
                <div key={idx} className="bg-dark-3 border border-border-gold-soft p-4 flex flex-col md:flex-row gap-4 relative">
                  <button
                    type="button"
                    className="absolute top-4 right-4 text-text-muted hover:text-[#eb5757] cursor-pointer"
                    onClick={() => {
                      const updatedTeam = (settings.team || []).filter((_, i) => i !== idx);
                      updateSetting('team', updatedTeam);
                    }}
                  >
                    <i className="fas fa-trash" />
                  </button>
                  <div className="flex flex-col items-center gap-2">
                    {member.img ? (
                      <img
                        src={member.img}
                        alt={member.name || 'Member'}
                        className="w-24 h-24 object-cover border border-border-gold-soft"
                      />
                    ) : (
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(`team-upload-${idx}`).click();
                        }}
                        className="w-24 h-24 bg-dark-4 border border-border-gold-soft border-dashed flex flex-col items-center justify-center text-text-muted hover:border-gold hover:text-gold cursor-pointer transition-all shrink-0"
                      >
                        <i className="fas fa-camera text-xl mb-1 text-gold/60" />
                        <span className="text-[8px] font-mono uppercase tracking-wider">Upload Photo</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      id={`team-upload-${idx}`}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('image', file);
                          try {
                            const uploadRes = await galleryService.uploadImage(formData);
                            const url = uploadRes.data.url;
                            const currentTeam = settings.team || [];
                            const updatedTeam = [...currentTeam];
                            updatedTeam[idx] = { ...updatedTeam[idx], img: url };
                            updateSetting('team', updatedTeam);
                            showToast('Member photo uploaded successfully');
                          } catch (err) {
                            console.error('Error uploading team photo:', err);
                            showToast('Failed to upload photo', 'warning');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="text-gold font-mono text-[9px] uppercase tracking-wider hover:text-white cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(`team-upload-${idx}`).click();
                      }}
                    >
                      {member.img ? 'Change Photo' : 'Upload Photo'}
                    </button>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[9px] text-text-muted uppercase">Full Name</label>
                      <input
                        className="bg-dark-2 border border-border-gold-soft text-white font-sans text-[13px] py-2 px-3 outline-none focus:border-gold/50"
                        type="text"
                        value={member.name || ''}
                        onChange={(e) => {
                          const currentTeam = settings.team || [];
                          const updatedTeam = [...currentTeam];
                          updatedTeam[idx] = { ...updatedTeam[idx], name: e.target.value };
                          updateSetting('team', updatedTeam);
                        }}
                        placeholder="e.g. Dawit Girma"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[9px] text-text-muted uppercase">Role / Title</label>
                      <input
                        className="bg-dark-2 border border-border-gold-soft text-white font-sans text-[13px] py-2 px-3 outline-none focus:border-gold/50"
                        type="text"
                        value={member.role || ''}
                        onChange={(e) => {
                          const currentTeam = settings.team || [];
                          const updatedTeam = [...currentTeam];
                          updatedTeam[idx] = { ...updatedTeam[idx], role: e.target.value };
                          updateSetting('team', updatedTeam);
                        }}
                        placeholder="e.g. General Manager"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 col-span-full">
                      <label className="font-mono text-[9px] text-text-muted uppercase">Short Bio</label>
                      <textarea
                        className="bg-dark-2 border border-border-gold-soft text-white font-sans text-[13.5px] py-2 px-3 outline-none focus:border-gold/50 min-h-[60px] resize-y"
                        value={member.bio || ''}
                        onChange={(e) => {
                          const currentTeam = settings.team || [];
                          const updatedTeam = [...currentTeam];
                          updatedTeam[idx] = { ...updatedTeam[idx], bio: e.target.value };
                          updateSetting('team', updatedTeam);
                        }}
                        placeholder="Brief bio about the team member..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft">
                <button
                  type="button"
                  className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold"
                  onClick={() => handleSave('Team Members')}
                >
                  <i className="fas fa-save mr-2" />Save Team
                </button>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-dark-2 border border-border-gold-soft" id="amenities">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Hotel Amenities</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Select all facilities available at your property
                </div>
              </div>
              <span className="font-mono text-[0.6rem] text-gold">{settings.amenities.length} Selected</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mb-6">
                {amenityOptions.map(opt => {
                  const isSelected = settings.amenities.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2.5 p-3 px-3.5 bg-dark-3 border cursor-pointer transition-all hover:border-gold/30 hover:bg-gold/5 ${isSelected ? 'border-gold/40 bg-gold/5' : 'border-border-gold-soft'
                        }`}
                      onClick={() => toggleAmenity(opt.id)}
                    >
                      <i className={`${opt.icon} text-[14.5px] ${isSelected ? 'text-gold' : 'text-text-muted'}`} />
                      <span className={`text-[0.8rem] ${isSelected ? 'text-white' : 'text-text-muted'}`}>{opt.label}</span>
                      <div className={`ml-auto w-4 h-4 border flex items-center justify-center text-[9px] shrink-0 ${isSelected ? 'bg-gold border-gold text-dark-1' : 'border-border-gold-soft text-gold'
                        }`}>
                        {isSelected && <i className="fas fa-check" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => handleSave('Amenities')}>
                  <i className="fas fa-save mr-2" />Save Amenities
                </button>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-dark-2 border border-border-gold-soft" id="hours">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Operating Hours</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Reception, restaurant, bar & spa schedules
                </div>
              </div>
              <i className="fas fa-clock text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase mb-3.5 block">Check-In / Check-Out</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-6">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Standard Check-In</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.checkIn}
                    onChange={(e) => updateSetting('checkIn', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Standard Check-Out</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.checkOut}
                    onChange={(e) => updateSetting('checkOut', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Early Check-In (if available)</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.earlyCheckIn}
                    onChange={(e) => updateSetting('earlyCheckIn', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Late Check-Out (if available)</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.lateCheckOut}
                    onChange={(e) => updateSetting('lateCheckOut', e.target.value)}
                  />
                </div>
              </div>

              <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase mb-3.5 block">Restaurant Hours</label>
              <div className="grid gap-2.5 mb-6">
                <div className="grid grid-cols-[120px_1fr_1fr_auto] gap-3 items-center">
                  <div className="text-[13.5px] text-white font-mono text-[9.5px] text-text-muted tracking-[1px] uppercase">Breakfast</div>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.breakfastStart}
                    onChange={(e) => updateSetting('breakfastStart', e.target.value)}
                  />
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.breakfastEnd}
                    onChange={(e) => updateSetting('breakfastEnd', e.target.value)}
                  />
                  <div />
                </div>
                <div className="grid grid-cols-[120px_1fr_1fr_auto] gap-3 items-center">
                  <div className="text-[13.5px] text-white font-mono text-[9.5px] text-text-muted tracking-[1px] uppercase">Lunch</div>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.lunchStart}
                    onChange={(e) => updateSetting('lunchStart', e.target.value)}
                  />
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.lunchEnd}
                    onChange={(e) => updateSetting('lunchEnd', e.target.value)}
                  />
                  <div />
                </div>
                <div className="grid grid-cols-[120px_1fr_1fr_auto] gap-3 items-center">
                  <div className="text-[13.5px] text-white font-mono text-[9.5px] text-text-muted tracking-[1px] uppercase">Dinner</div>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.dinnerStart}
                    onChange={(e) => updateSetting('dinnerStart', e.target.value)}
                  />
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.dinnerEnd}
                    onChange={(e) => updateSetting('dinnerEnd', e.target.value)}
                  />
                  <div />
                </div>
              </div>

              <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase mb-3.5 block">Spa & Pool Hours</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-[18px]">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Pool Opens</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.poolOpen}
                    onChange={(e) => updateSetting('poolOpen', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Pool Closes</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.poolClose}
                    onChange={(e) => updateSetting('poolClose', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Spa Opens</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.spaOpen}
                    onChange={(e) => updateSetting('spaOpen', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Spa Closes</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="time"
                    value={settings.spaClose}
                    onChange={(e) => updateSetting('spaClose', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => handleSave('Operating Hours')}>
                  <i className="fas fa-save mr-2" />Save Hours
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="bg-dark-2 border border-border-gold-soft" id="policies">
            <div className="py-5 px-6 border-b border-border-gold-soft flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-white">Hotel Policies</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Cancellation, payment and guest policies
                </div>
              </div>
              <i className="fas fa-file-alt text-gold/25 text-[1.2rem]" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-[18px]">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Cancellation Policy</label>
                  <select
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full cursor-pointer appearance-none bg-no-repeat bg-right-3.5"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239A9080' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundPosition: 'right 14px center' }}
                    value={settings.cancellationPolicy}
                    onChange={(e) => updateSetting('cancellationPolicy', e.target.value)}
                  >
                    <option value="Free cancellation up to 48h">Free cancellation up to 48h</option>
                    <option value="Free cancellation up to 24h">Free cancellation up to 24h</option>
                    <option value="Free cancellation up to 72h">Free cancellation up to 72h</option>
                    <option value="Non-refundable">Non-refundable</option>
                    <option value="Custom policy">Custom policy</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Minimum Age (Check-in)</label>
                  <input
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full"
                    type="number"
                    value={settings.minAge}
                    onChange={(e) => updateSetting('minAge', parseInt(e.target.value) || '')}
                    placeholder="Years"
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-full">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">Cancellation Policy Details</label>
                  <textarea
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full resize-y min-h-[90px] leading-relaxed"
                    value={settings.cancellationDetails}
                    onChange={(e) => updateSetting('cancellationDetails', e.target.value)}
                    placeholder="Detailed cancellation policy text..."
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-full">
                  <label className="font-mono text-[9.5px] text-text-muted tracking-[0.14em] uppercase">House Rules</label>
                  <textarea
                    className="bg-dark-3 border border-border-gold-soft text-white font-sans text-[13.5px] py-2.5 px-3.5 outline-none transition-all focus:border-gold/50 w-full resize-y min-h-[90px] leading-relaxed"
                    value={settings.houseRules}
                    onChange={(e) => updateSetting('houseRules', e.target.value)}
                    placeholder="General house rules..."
                  />
                </div>
              </div>

              <div className="mb-[18px]">
                <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                  <div className="flex-1 pr-5">
                    <div className="text-[13.5px] text-white font-medium">Pet Policy — Pets Allowed</div>
                    <div className="text-[12px] text-text-muted mt-0.75">Allow guests to bring pets on request (additional charges may apply)</div>
                  </div>
                  <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.petsAllowed}
                      onChange={(e) => updateSetting('petsAllowed', e.target.checked)}
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                  </label>
                </div>
                <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                  <div className="flex-1 pr-5">
                    <div className="text-[13.5px] text-white font-medium">Children Welcome</div>
                    <div className="text-[12px] text-text-muted mt-0.75">Specify children are welcome at the property</div>
                  </div>
                  <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.childrenWelcome}
                      onChange={(e) => updateSetting('childrenWelcome', e.target.checked)}
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                  </label>
                </div>
                <div className="flex items-center justify-between py-3.5 border-b border-border-gold-soft/30 last:border-b-0">
                  <div className="flex-1 pr-5">
                    <div className="text-[13.5px] text-white font-medium">Accessible Rooms Available</div>
                    <div className="text-[12px] text-text-muted mt-0.75">Property has rooms accessible for guests with disabilities</div>
                  </div>
                  <label className="relative w-11 h-6 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.accessibleRooms}
                      onChange={(e) => updateSetting('accessibleRooms', e.target.checked)}
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-dark-3 border border-border-gold-soft cursor-pointer transition-all duration-300 rounded-full peer-checked:bg-gold/15 peer-checked:border-gold before:content-[''] before:absolute before:w-4 before:h-4 before:left-[3px] before:top-[3px] before:bg-text-muted before:transition-all before:duration-300 before:rounded-full peer-checked:before:translate-x-5 peer-checked:before:bg-gold" />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-border-gold-soft">
                <button className="bg-gold hover:bg-gold-light text-dark-1 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 cursor-pointer transition-all font-bold" onClick={() => handleSave('Hotel Policies')}>
                  <i className="fas fa-save mr-2" />Save Policies
                </button>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white" onClick={() => window.location.reload()}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-dark-2 border border-[#eb5757]/20" id="danger">
            <div className="py-5 px-6 border-b border-[#eb5757]/15 flex items-center justify-between">
              <div>
                <div className="font-cormorant text-[1.1rem] font-bold text-[#eb5757]">Danger Zone</div>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.12em] uppercase mt-0.75">
                  Irreversible actions — proceed with caution
                </div>
              </div>
              <i className="fas fa-exclamation-triangle text-[#eb5757]/40 text-[1.2rem]" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3.5 py-3 border-b border-border-gold-soft/30 last:border-b-0">
                <div className="w-8.5 h-8.5 bg-[#eb5757]/5 border border-[#eb5757]/15 flex items-center justify-center text-[13px] text-[#eb5757] shrink-0">
                  <i className="fas fa-download" />
                </div>
                <div>
                  <div className="text-[13.5px] text-white font-medium">Export All Hotel Data</div>
                  <div className="text-[12px] text-text-muted mt-0.5">Download a full backup of all settings, bookings and guest records</div>
                </div>
                <button className="bg-transparent text-text-muted font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-border-gold-soft cursor-pointer transition-all hover:border-gold hover:text-white ml-auto" onClick={() => showToast('Export backup triggered')}>Export</button>
              </div>
              <div className="flex items-center gap-3.5 py-3 border-b border-border-gold-soft/30 last:border-b-0">
                <div className="w-8.5 h-8.5 bg-[#eb5757]/5 border border-[#eb5757]/15 flex items-center justify-center text-[13px] text-[#eb5757] shrink-0">
                  <i className="fas fa-undo" />
                </div>
                <div>
                  <div className="text-[13.5px] text-white font-medium">Reset to Default Settings</div>
                  <div className="text-[12px] text-text-muted mt-0.5">Restore all hotel settings to factory defaults — does not affect bookings</div>
                </div>
                <button className="bg-transparent text-[#eb5757] font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-[#eb5757]/35 cursor-pointer transition-all hover:bg-[#eb5757]/10 ml-auto" onClick={handleResetSettings}>Reset</button>
              </div>
              <div className="flex items-center gap-3.5 py-3 border-b border-border-gold-soft/30 last:border-b-0 opacity-60" style={{ borderBottom: 'none' }}>
                <div className="w-8.5 h-8.5 bg-[#eb5757]/5 border border-[#eb5757]/15 flex items-center justify-center text-[13px] text-[#eb5757] shrink-0">
                  <i className="fas fa-trash" />
                </div>
                <div>
                  <div className="text-[13.5px] text-white font-medium">Delete Hotel Account</div>
                  <div className="text-[12px] text-text-muted mt-0.5">Permanently delete this hotel profile and all associated data (Disabled)</div>
                </div>
                <button
                  disabled
                  title="Account deletion is disabled"
                  className="bg-transparent text-[#eb5757]/40 font-mono text-[10px] tracking-[0.14em] uppercase py-3 px-6 border border-[#eb5757]/20 cursor-not-allowed ml-auto opacity-50 select-none"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Global Toast Alert */}
      <div className={`fixed bottom-7 right-7 bg-dark-2 border border-border-gold-soft py-3.5 px-4.5 flex items-center gap-3 text-[13px] text-white z-[999] transition-all duration-300 pointer-events-none min-w-[260px] ${toast.show ? 'opacity-100 translate-y-0 pointer-events-auto shadow-xl' : 'opacity-0 translate-y-3'
        }`}>
        <div className="w-[3px] h-full absolute left-0 top-0 bottom-0 bg-gold" />
        <i className="fas fa-check-circle text-gold" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default HotelSettings;
