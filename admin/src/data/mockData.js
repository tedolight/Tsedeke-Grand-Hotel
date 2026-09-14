// ─── Mock Data for Prototype ────────────────────────────────────────────────

export const stats = [
  { id: 'occupancy', label: 'Occupancy Rate',   value: 75,     suffix: '%',    delta: '+6%',  deltaUp: true,  icon: 'home',      color: 'forest'  },
  { id: 'checkins',  label: 'Check-ins Today',  value: 5,                      delta: '+2',   deltaUp: true,  icon: 'calendar',  color: 'brass'   },
  { id: 'checkouts', label: 'Check-outs Today', value: 3,                      delta: '−1',   deltaUp: false, icon: 'clock',     color: 'crimson' },
  { id: 'revenue',   label: 'Revenue (MTD)',     value: 486200, prefix: 'ETB ', delta: '+12%', deltaUp: true,  icon: 'chart',     color: 'brass'   },
]

export const reservations = [
  { id: 1,  guest: 'Amanuel Getachew', initials: 'AG', room: 'Wachemo Room', checkIn: '2026-08-25', checkOut: '2026-08-27', nights: 2, status: 'confirmed', amount: 5600,  paid: true  },
  { id: 2,  guest: 'Sara Bekele',      initials: 'SB', room: 'Boyaa Suite',  checkIn: '2026-08-26', checkOut: '2026-08-29', nights: 3, status: 'confirmed', amount: 19500, paid: true  },
  { id: 3,  guest: 'Daniel Wolde',     initials: 'DW', room: 'Bilate Suite', checkIn: '2026-08-25', checkOut: '2026-08-26', nights: 1, status: 'pending',   amount: 4200,  paid: false },
  { id: 4,  guest: 'Liya Tesfaye',     initials: 'LT', room: 'Wachemo Room', checkIn: '2026-08-27', checkOut: '2026-08-30', nights: 3, status: 'confirmed', amount: 8400,  paid: true  },
  { id: 5,  guest: 'Robel Fikru',      initials: 'RF', room: 'Bilate Suite', checkIn: '2026-08-24', checkOut: '2026-08-25', nights: 1, status: 'cancelled', amount: 4200,  paid: false },
  { id: 6,  guest: 'Martha Ashenafi',  initials: 'MA', room: 'Boyaa Suite',  checkIn: '2026-08-28', checkOut: '2026-08-31', nights: 3, status: 'pending',   amount: 19500, paid: false },
  { id: 7,  guest: 'Tigist Haile',     initials: 'TH', room: 'Wachemo Room', checkIn: '2026-08-30', checkOut: '2026-09-01', nights: 2, status: 'confirmed', amount: 5600,  paid: true  },
  { id: 8,  guest: 'Berhane Tsega',    initials: 'BT', room: 'Bilate Suite', checkIn: '2026-09-01', checkOut: '2026-09-04', nights: 3, status: 'confirmed', amount: 12600, paid: false },
  { id: 9,  guest: 'Hana Mekonnen',    initials: 'HM', room: 'Boyaa Suite',  checkIn: '2026-09-05', checkOut: '2026-09-08', nights: 3, status: 'pending',   amount: 19500, paid: false },
  { id: 10, guest: 'Dawit Kebede',     initials: 'DK', room: 'Wachemo Room', checkIn: '2026-09-10', checkOut: '2026-09-12', nights: 2, status: 'confirmed', amount: 5600,  paid: true  },
]

export const rooms = [
  {
    id: 1, name: 'Wachemo Room', type: 'Standard', capacity: 2, pricePerNight: 2800,
    status: 'occupied', amenities: ['King Bed', 'Lake View', 'Wi-Fi', 'AC', 'En-suite Bathroom'],
    description: 'Named after the Wachemo highlands, these rooms offer serene lake views with locally crafted wooden furniture and hand-woven textile accents.',
    floor: 1, roomNumber: '101–110', totalRooms: 10, occupied: 8,
  },
  {
    id: 2, name: 'Bilate Suite', type: 'Suite', capacity: 3, pricePerNight: 4200,
    status: 'occupied', amenities: ['King Bed', 'Living Area', 'Lake View', 'Wi-Fi', 'AC', 'Kitchenette', 'Terrace'],
    description: 'Inspired by the Bilate river valley, these suites feature a generous living area, private terrace, and traditional Ethiopian décor elements.',
    floor: 2, roomNumber: '201–206', totalRooms: 6, occupied: 4,
  },
  {
    id: 3, name: 'Boyaa Suite', type: 'Premium Suite', capacity: 4, pricePerNight: 6500,
    status: 'available', amenities: ['2 King Beds', 'Panoramic View', 'Wi-Fi', 'AC', 'Jacuzzi', 'Private Terrace', 'Butler Service'],
    description: 'Our most prestigious offering — Boyaa Suites provide panoramic lake panoramas, jacuzzi bathrooms, private terraces, and personalised butler service.',
    floor: 3, roomNumber: '301–304', totalRooms: 4, occupied: 3,
  },
]

export const guests = [
  { id: 1,  name: 'Amanuel Getachew', initials: 'AG', email: 'amanuel@example.com',  phone: '+251 911 234 567', nationality: 'Ethiopian',  stays: 3, totalSpent: 16800, lastStay: '2026-08-25', status: 'in-house'  },
  { id: 2,  name: 'Sara Bekele',      initials: 'SB', email: 'sara.bekele@mail.com',  phone: '+251 912 345 678', nationality: 'Ethiopian',  stays: 5, totalSpent: 97500, lastStay: '2026-08-26', status: 'in-house'  },
  { id: 3,  name: 'Daniel Wolde',     initials: 'DW', email: 'daniel.w@inbox.et',     phone: '+251 913 456 789', nationality: 'Ethiopian',  stays: 1, totalSpent: 4200,  lastStay: '2026-08-25', status: 'pending'   },
  { id: 4,  name: 'Liya Tesfaye',     initials: 'LT', email: 'liya.tesfaye@gmail.com',phone: '+251 914 567 890', nationality: 'Ethiopian',  stays: 2, totalSpent: 16800, lastStay: '2026-08-27', status: 'upcoming'  },
  { id: 5,  name: 'Helen Getu',       initials: 'HG', email: 'helen.getu@corp.com',   phone: '+251 915 678 901', nationality: 'Ethiopian',  stays: 7, totalSpent: 68600, lastStay: '2026-07-12', status: 'checked-out'},
  { id: 6,  name: 'Firaol Tadesse',   initials: 'FT', email: 'firaol.t@ethiotel.com', phone: '+251 916 789 012', nationality: 'Ethiopian',  stays: 2, totalSpent: 9400,  lastStay: '2026-06-05', status: 'checked-out'},
  { id: 7,  name: 'James Okonkwo',    initials: 'JO', email: 'j.okonkwo@agency.ng',   phone: '+234 803 123 456', nationality: 'Nigerian',   stays: 1, totalSpent: 19500, lastStay: '2026-05-20', status: 'checked-out'},
  { id: 8,  name: 'Marie Dupont',     initials: 'MD', email: 'marie.d@hotmail.fr',    phone: '+33 6 12 34 56 78',nationality: 'French',     stays: 3, totalSpent: 58500, lastStay: '2026-04-18', status: 'checked-out'},
  { id: 9,  name: 'Tigist Haile',     initials: 'TH', email: 'tigist.h@workneh.com',  phone: '+251 917 890 123', nationality: 'Ethiopian',  stays: 4, totalSpent: 22400, lastStay: '2026-08-30', status: 'upcoming'  },
  { id: 10, name: 'Dawit Kebede',     initials: 'DK', email: 'dawit.k@habesha.net',   phone: '+251 918 901 234', nationality: 'Ethiopian',  stays: 6, totalSpent: 33600, lastStay: '2026-09-10', status: 'upcoming'  },
]

export const messages = [
  { id: 1,  name: 'Firaol Tadesse',  initials: 'FT', subject: 'Boyaa Suite rate for September',        tag: 'Rate inquiry',      time: '2h ago',    unread: true,  priority: 'normal', body: 'Hello, I would like to know the room rate for the Boyaa Suite for a 3-night stay in September. Are there any early-bird discounts available? We are a group of 2 adults.' },
  { id: 2,  name: 'Helen Getu',      initials: 'HG', subject: 'Event hall for November wedding',       tag: 'Event booking',     time: '5h ago',    unread: true,  priority: 'high',   body: 'Good morning, we are looking to host a wedding reception for approximately 80 guests in November. Could you please share the event hall capacity, catering options, and available dates?' },
  { id: 3,  name: 'Yonas Mulu',      initials: 'YM', subject: 'Airport transfer from Addis Ababa',    tag: 'General',           time: 'Yesterday', unread: true,  priority: 'normal', body: 'Hi, is airport transfer service available from Addis Ababa Bole Airport? If yes, what are the costs and how do we book?' },
  { id: 4,  name: 'James Okonkwo',   initials: 'JO', subject: 'Confirmed reservation #SHB-2026-007',  tag: 'Booking confirmation', time: '2 days ago', unread: false, priority: 'normal', body: 'Dear team, please confirm that my reservation for the Wachemo Room (Aug 30–Sep 1) has been processed. Booking reference: SHB-2026-007.' },
  { id: 5,  name: 'Marie Dupont',    initials: 'MD', subject: 'Special dietary requirements',         tag: 'Special request',   time: '3 days ago', unread: false, priority: 'normal', body: 'Bonjour, I will be arriving on September 5. I have a severe nut allergy and am vegetarian. Could you please flag this for your kitchen team? Merci.' },
  { id: 6,  name: 'Dawit Kebede',    initials: 'DK', subject: 'Lake fishing activity inquiry',        tag: 'Activity',          time: '4 days ago', unread: false, priority: 'low',    body: 'Hello! We are very excited about our upcoming stay. Does the hotel offer guided lake fishing trips? My partner and I are very interested.' },
]

export const galleryImages = [
  { id: 1,  category: 'exterior', title: 'Main Entrance at Dusk',       tags: ['exterior', 'architecture'], size: '3.2 MB', uploaded: '2026-06-10', featured: true  },
  { id: 2,  category: 'rooms',    title: 'Wachemo Room — Lake View',     tags: ['room', 'view'],             size: '2.8 MB', uploaded: '2026-06-11', featured: true  },
  { id: 3,  category: 'rooms',    title: 'Boyaa Suite — Living Area',    tags: ['suite', 'interior'],        size: '4.1 MB', uploaded: '2026-06-11', featured: false },
  { id: 4,  category: 'dining',   title: 'Restaurant — Terrace Seating', tags: ['dining', 'exterior'],       size: '2.5 MB', uploaded: '2026-06-12', featured: true  },
  { id: 5,  category: 'exterior', title: 'Lake Abijatta Panorama',       tags: ['lake', 'nature'],           size: '5.0 MB', uploaded: '2026-06-13', featured: false },
  { id: 6,  category: 'rooms',    title: 'Bilate Suite — Master Bedroom', tags: ['suite', 'interior'],       size: '3.6 MB', uploaded: '2026-06-14', featured: false },
  { id: 7,  category: 'amenities',title: 'Pool Deck — Sunset',           tags: ['pool', 'leisure'],          size: '2.9 MB', uploaded: '2026-06-15', featured: true  },
  { id: 8,  category: 'dining',   title: 'Ethiopian Coffee Ceremony',    tags: ['culture', 'dining'],        size: '1.8 MB', uploaded: '2026-06-16', featured: false },
  { id: 9,  category: 'amenities',title: 'Spa & Wellness Centre',        tags: ['spa', 'wellness'],          size: '3.3 MB', uploaded: '2026-06-17', featured: false },
  { id: 10, category: 'exterior', title: 'Garden Pathway at Night',      tags: ['garden', 'exterior'],       size: '2.2 MB', uploaded: '2026-06-18', featured: false },
  { id: 11, category: 'rooms',    title: 'Boyaa Suite — Jacuzzi Bathroom',tags: ['suite', 'bathroom'],       size: '3.0 MB', uploaded: '2026-06-19', featured: false },
  { id: 12, category: 'amenities',title: 'Event Hall — Wedding Setup',   tags: ['event', 'interior'],        size: '4.4 MB', uploaded: '2026-06-20', featured: true  },
]

export const monthlyRevenue = [
  { month: 'Mar', revenue: 312000 },
  { month: 'Apr', revenue: 398000 },
  { month: 'May', revenue: 421000 },
  { month: 'Jun', revenue: 510000 },
  { month: 'Jul', revenue: 476000 },
  { month: 'Aug', revenue: 486200 },
]

export const roomAvailability = [
  { id: 1, name: 'Wachemo Room', occupied: 8, total: 10, color: '#3C4A34' },
  { id: 2, name: 'Bilate Suite',  occupied: 4, total: 6,  color: '#8E2438' },
  { id: 3, name: 'Boyaa Suite',   occupied: 3, total: 4,  color: '#B08D4F' },
]

export const inquiries = [
  { id: 1, name: 'Firaol Tadesse', initials: 'FT', tag: 'Room & rate inquiry',   time: '2h ago',    message: 'Asking about the Boyaa Suite rate for a 3-night stay in September.' },
  { id: 2, name: 'Helen Getu',     initials: 'HG', tag: 'Event or group booking', time: '5h ago',    message: 'Checking event hall availability for a wedding in November.' },
  { id: 3, name: 'Yonas Mulu',     initials: 'YM', tag: 'General question',       time: 'Yesterday', message: 'Asking whether airport transfer is available from Addis Ababa.' },
]

export const weeklyOccupancy = [
  { day: 'Mon', pct: 70, today: false },
  { day: 'Tue', pct: 75, today: true  },
  { day: 'Wed', pct: 82, today: false },
  { day: 'Thu', pct: 88, today: false },
  { day: 'Fri', pct: 91, today: false },
  { day: 'Sat', pct: 95, today: false },
  { day: 'Sun', pct: 80, today: false },
]

export const navItems = [
  {
    group: 'Overview',
    links: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid', badge: null },
    ],
  },
  {
    group: 'Manage',
    links: [
      { id: 'reservations', label: 'Reservations', icon: 'calendar',  badge: 2    },
      { id: 'rooms',        label: 'Rooms',         icon: 'home',      badge: null },
      { id: 'guests',       label: 'Guests',        icon: 'users',     badge: null },
      { id: 'messages',     label: 'Messages',      icon: 'mail',      badge: 3    },
      { id: 'gallery',      label: 'Gallery',       icon: 'image',     badge: null },
    ],
  },
  {
    group: 'System',
    links: [
      { id: 'reports',  label: 'Reports',  icon: 'bar-chart', badge: null },
      { id: 'settings', label: 'Settings', icon: 'settings',  badge: null },
    ],
  },
]
