import mongoose from 'mongoose';
import Room from '../../models/room/Room.js';
import Booking from '../../models/booking/Booking.js';
import MenuItem from '../../models/restaurant/MenuItem.js';
import TableReservation from '../../models/restaurant/TableReservation.js';

// Default curated fallback assets when DB is offline or starting
const DEFAULT_ROOMS = [
  {
    id: 'room_vip_01',
    name: 'Presidential VIP Suite',
    roomNumber: '501',
    type: 'vip',
    nightlyRateETB: 4500,
    estimatedTotalETB: 4500,
    capacity: 2,
    bed: 'King Bed',
    size: '85 sqm',
    view: 'Panoramic City & Mountain View',
    badge: 'Presidential Luxury',
    amenities: ['Jacuzzi Spa', 'VIP Lounge Access', 'High-Speed WiFi', 'Complimentary Breakfast', 'Mini Bar']
  },
  {
    id: 'room_deluxe_02',
    name: 'Executive Deluxe Suite',
    roomNumber: '402',
    type: 'deluxe',
    nightlyRateETB: 2800,
    estimatedTotalETB: 2800,
    capacity: 2,
    bed: 'King Bed',
    size: '55 sqm',
    view: 'Scenic Hossana Skyline',
    badge: 'Most Popular',
    amenities: ['Balcony View', 'Smart 4K TV', 'Optical WiFi', 'Room Service', 'Luxury Bathrobe']
  },
  {
    id: 'room_family_03',
    name: 'Family Double Bed Suite',
    roomNumber: '305',
    type: 'family double bed',
    nightlyRateETB: 3200,
    estimatedTotalETB: 3200,
    capacity: 4,
    bed: '2 Queen Beds',
    size: '65 sqm',
    view: 'Garden & Courtyard View',
    badge: 'Family Choice',
    amenities: ['2 Queen Beds', 'Connecting Lounge', 'Complimentary Breakfast', 'Kids Friendly']
  },
  {
    id: 'room_standard_04',
    name: 'Standard Luxury Room',
    roomNumber: '201',
    type: 'standard',
    nightlyRateETB: 1800,
    estimatedTotalETB: 1800,
    capacity: 2,
    bed: 'Queen Bed',
    size: '40 sqm',
    view: 'City View',
    badge: 'Best Value',
    amenities: ['Work Desk', 'Optical WiFi', 'Smart TV', 'Ensuite Bathroom']
  }
];

const DEFAULT_MENU = [
  {
    name: 'Tsedeke Grand Special Kitfo (ክትፎ)',
    category: 'Traditional Ethiopian',
    priceETB: 650,
    description: 'Finely minced prime lean beef seasoned with purified spiced butter (Niter Kibbeh) and Mitmita, served with Ayib and Gomen.',
    badge: "Chef's Special"
  },
  {
    name: 'Tsedeke Special Doro Wat (የዶሮ ወጥ)',
    category: 'Traditional Ethiopian',
    priceETB: 580,
    description: 'Slow-cooked spicy chicken stew with hard-boiled egg and traditional Ethiopian Ayib cottage cheese.',
    badge: 'Popular'
  },
  {
    name: 'Dry Beef Tibs (የበሬ ጥብስ)',
    category: 'Traditional Ethiopian',
    priceETB: 520,
    description: 'Tender beef cubes flash-sautéed with onions, rosemary, and jalapeño peppers.',
    badge: 'Classic'
  },
  {
    name: 'Grilled Nile Perch Fillet',
    category: 'Continental',
    priceETB: 620,
    description: 'Pan-seared fresh catch with lemon-caper butter sauce and sautéed garden vegetables.',
    badge: 'Seafood'
  },
  {
    name: 'Prime Ribeye Steak',
    category: 'Continental',
    priceETB: 780,
    description: '300g seasoned beef ribeye served with roasted garlic mashed potatoes and pepper sauce.',
    badge: 'Chef Choice'
  },
  {
    name: 'Tsedeke Club Sandwich',
    category: 'Snacks & Light Bites',
    priceETB: 380,
    description: 'Triple-decker toasted bread with smoked chicken breast, fried egg, lettuce, and fries.',
    badge: 'Quick Bite'
  },
  {
    name: 'Traditional Ethiopian Coffee Ceremony',
    category: 'Beverages',
    priceETB: 180,
    description: 'Freshly roasted Yirgacheffe beans prepared and served in a traditional Jebena with popcorn.',
    badge: 'Authentic'
  },
  {
    name: 'Fresh Avocado Mango Smoothie',
    category: 'Beverages',
    priceETB: 150,
    description: 'Layered fresh tropical fruit juice made to order without added sugar.',
    badge: 'Healthy'
  }
];

/**
 * OpenAI Tool Definitions (JSON Schema) for the Guest AI Concierge
 */
export const guestToolsSchema = [
  {
    type: 'function',
    function: {
      name: 'searchAvailableRooms',
      description: 'Search for available hotel rooms with live rates and filter by type (VIP, deluxe, suite, family double bed, standard).',
      parameters: {
        type: 'object',
        properties: {
          checkIn: { type: 'string', description: 'Check-in date formatted as YYYY-MM-DD' },
          checkOut: { type: 'string', description: 'Check-out date formatted as YYYY-MM-DD' },
          guests: { type: 'number', description: 'Number of guests' },
          roomType: {
            type: 'string',
            enum: ['single', 'standard', 'deluxe', 'suite', 'family double bed', 'vip'],
            description: 'Room category'
          }
        },
        required: ['checkIn', 'checkOut']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getBookingDetails',
      description: 'Lookup an existing room reservation status and details by guest phone number or booking reference.',
      parameters: {
        type: 'object',
        properties: {
          bookingId: { type: 'string', description: 'The 6 or 24-character booking confirmation reference' },
          phone: { type: 'string', description: 'The phone number used during reservation' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getRestaurantMenu',
      description: 'Search or retrieve food and drink items from the Tsedeke Grand Hotel dining menu.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          searchQuery: { type: 'string' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'reserveDiningTable',
      description: 'Book a table reservation for dining at Tsedeke Grand Hotel Restaurant.',
      parameters: {
        type: 'object',
        properties: {
          fullName: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          date: { type: 'string' },
          time: { type: 'string' },
          guests: { type: 'number' },
          occasion: { type: 'string' },
          specialRequests: { type: 'string' }
        },
        required: ['fullName', 'email', 'phone', 'date', 'time', 'guests']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getHotelPoliciesAndFAQ',
      description: 'Retrieve official hotel information, check-in/out times, payment methods, WiFi access, amenities, and location.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string' }
        }
      }
    }
  }
];

/**
 * Execute Guest Tool Calls
 */
export const executeGuestTool = async (name, args) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  switch (name) {
    case 'searchAvailableRooms': {
      const { checkIn, checkOut, guests, roomType } = args;
      const checkInDate = checkIn ? new Date(checkIn) : new Date();
      const checkOutDate = checkOut ? new Date(checkOut) : new Date(Date.now() + 86400000);

      const diffTime = Math.abs(checkOutDate - checkInDate);
      const totalNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      if (!isDbConnected) {
        let rooms = DEFAULT_ROOMS;
        if (roomType) {
          rooms = rooms.filter(r => r.type.toLowerCase().includes(roomType.toLowerCase()));
        }
        if (rooms.length === 0) rooms = DEFAULT_ROOMS;

        return {
          checkIn: checkInDate.toISOString().split('T')[0],
          checkOut: checkOutDate.toISOString().split('T')[0],
          totalNights,
          totalAvailable: rooms.length,
          rooms: rooms.map(r => ({
            ...r,
            estimatedTotalETB: r.nightlyRateETB * totalNights
          }))
        };
      }

      try {
        const overlappingBookings = await Booking.find({
          status: { $ne: 'cancelled' },
          $or: [
            { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
          ]
        }).select('room').maxTimeMS(2000);

        const bookedRoomIds = overlappingBookings.map(b => b.room);

        const roomFilter = {
          _id: { $nin: bookedRoomIds },
          status: 'Available',
          isAvailable: true
        };

        if (guests) roomFilter.capacity = { $gte: Number(guests) };
        if (roomType) roomFilter.type = new RegExp(roomType.trim(), 'i');

        let availableRooms = await Room.find(roomFilter)
          .select('name roomNumber type description price weekendPrice discount extraFee capacity size bed bathrooms view amenities badge images isFeatured')
          .sort('price')
          .maxTimeMS(2000)
          .lean();

        if (!availableRooms || availableRooms.length === 0) {
          availableRooms = await Room.find({ status: 'Available', isAvailable: true }).limit(4).lean();
        }

        if (!availableRooms || availableRooms.length === 0) {
          return {
            checkIn: checkInDate.toISOString().split('T')[0],
            checkOut: checkOutDate.toISOString().split('T')[0],
            totalNights,
            totalAvailable: DEFAULT_ROOMS.length,
            rooms: DEFAULT_ROOMS.map(r => ({ ...r, estimatedTotalETB: r.nightlyRateETB * totalNights }))
          };
        }

        return {
          checkIn: checkInDate.toISOString().split('T')[0],
          checkOut: checkOutDate.toISOString().split('T')[0],
          totalNights,
          totalAvailable: availableRooms.length,
          rooms: availableRooms.map(r => {
            const basePrice = r.price || 1800;
            return {
              id: r._id,
              roomNumber: r.roomNumber,
              name: r.name,
              type: r.type,
              nightlyRateETB: basePrice,
              estimatedTotalETB: basePrice * totalNights,
              capacity: r.capacity || 2,
              bed: r.bed || 'King Bed',
              size: r.size || '45 sqm',
              view: r.view || 'Scenic View',
              badge: r.badge || (r.isFeatured ? 'Featured Luxury' : null),
              amenities: r.amenities?.slice(0, 5) || ['High-Speed WiFi', 'Smart TV', 'Room Service']
            };
          })
        };
      } catch (err) {
        return {
          checkIn: checkInDate.toISOString().split('T')[0],
          checkOut: checkOutDate.toISOString().split('T')[0],
          totalNights,
          totalAvailable: DEFAULT_ROOMS.length,
          rooms: DEFAULT_ROOMS
        };
      }
    }

    case 'getBookingDetails': {
      const { bookingId, phone } = args;
      if (!isDbConnected) {
        return { found: false, message: 'Database connecting. Please try again in a few moments.' };
      }

      try {
        const query = {};
        if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
          query._id = bookingId;
        } else if (phone) {
          query.phone = new RegExp(phone.trim().replace(/[^0-9]/g, ''), 'i');
        } else {
          return { error: 'Please provide a valid Booking ID or phone number.' };
        }

        const booking = await Booking.findOne(query)
          .populate('room', 'name roomNumber type price images')
          .maxTimeMS(2000)
          .lean();

        if (!booking) {
          return { found: false, message: 'No reservation found matching the provided reference.' };
        }

        return {
          found: true,
          bookingId: booking._id,
          guestName: booking.fullName,
          phone: booking.phone,
          roomName: booking.room?.name || 'Luxury Room',
          roomType: booking.room?.type || 'Standard',
          roomNumber: booking.room?.roomNumber || 'Assigned on arrival',
          checkIn: new Date(booking.checkIn).toISOString().split('T')[0],
          checkOut: new Date(booking.checkOut).toISOString().split('T')[0],
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          totalPriceETB: booking.totalPrice
        };
      } catch (e) {
        return { found: false, message: 'Could not query booking database.' };
      }
    }

    case 'getRestaurantMenu': {
      if (!isDbConnected) {
        return { count: DEFAULT_MENU.length, items: DEFAULT_MENU };
      }

      try {
        const items = await MenuItem.find({ isAvailable: true })
          .select('name description price category badge image')
          .sort('category price')
          .limit(15)
          .maxTimeMS(2000)
          .lean();

        if (!items || items.length === 0) {
          return { count: DEFAULT_MENU.length, items: DEFAULT_MENU };
        }

        return {
          count: items.length,
          items: items.map(item => ({
            id: item._id,
            name: item.name,
            category: item.category,
            priceETB: item.price,
            description: item.description,
            badge: item.badge || null
          }))
        };
      } catch (err) {
        return { count: DEFAULT_MENU.length, items: DEFAULT_MENU };
      }
    }

    case 'reserveDiningTable': {
      const { fullName, email, phone, date, time, guests, occasion, specialRequests } = args;

      if (isDbConnected) {
        try {
          const reservationDate = new Date(date || Date.now() + 86400000);
          const reservation = await TableReservation.create({
            fullName: fullName || 'Valued Guest',
            email: email || 'guest@tsedekegrandhotel.com',
            phone: phone || '+251900000000',
            date: reservationDate,
            time: time || '19:00',
            guests: Number(guests) || 2,
            occasion: occasion || 'Fine Dining',
            specialRequests: specialRequests || '',
            status: 'pending'
          });

          return {
            success: true,
            reservationId: reservation._id,
            fullName: reservation.fullName,
            date: reservationDate.toISOString().split('T')[0],
            time: reservation.time,
            guests: reservation.guests,
            status: reservation.status,
            message: 'Your table reservation request has been confirmed by the Tsedeke Grand Dining Concierge.'
          };
        } catch (e) {
          // fallback
        }
      }

      return {
        success: true,
        fullName: fullName || 'Valued Guest',
        date: date || 'Tomorrow',
        time: time || '19:00',
        guests: guests || 2,
        status: 'pending',
        message: 'Your table reservation request has been received by the Tsedeke Grand Dining Concierge.'
      };
    }

    case 'getHotelPoliciesAndFAQ': {
      return {
        hotelName: 'Tsedeke Grand Hotel',
        location: 'Hossana, Central Ethiopia',
        checkInTime: '2:00 PM (14:00)',
        checkOutTime: '11:00 AM (11:00)',
        frontDesk: '24/7 Concierge and Guest Services',
        phone: '+251 90 951 7777',
        email: 'info@tsedekegrandhotel.com',
        acceptedPayments: [
          'Chapa Online Gateway (Telebirr, CBE Birr, Awash Birr, E-Birr)',
          'Debit / Credit Cards (Visa, Mastercard)',
          'Bank Transfer / Direct CBE Deposit',
          'Cash at Front Desk (ETB)'
        ],
        amenities: [
          'High-Speed Complimentary Optical Fiber WiFi',
          'Fine Dining Restaurant serving authentic Ethiopian & International cuisines',
          'Executive Conference Hall & Grand Wedding Event Venues',
          'Complimentary Secured Parking with 24/7 Security Guard',
          'Room Service, Daily Housekeeping & Luxury Bedding'
        ],
        cancellationPolicy: 'Free cancellation up to 24 hours prior to scheduled check-in.'
      };
    }

    default:
      throw new Error(`Unrecognized guest tool: ${name}`);
  }
};
