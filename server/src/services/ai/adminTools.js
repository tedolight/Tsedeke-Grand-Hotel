import Booking from '../../models/booking/Booking.js';
import Room from '../../models/room/Room.js';
import Contact from '../../models/contact/Contact.js';
import EventEnquiry from '../../models/event/EventEnquiry.js';
import TableReservation from '../../models/restaurant/TableReservation.js';

/**
 * OpenAI Tool Definitions (JSON Schema) for the Operations Admin AI Copilot
 */
export const adminToolsSchema = [
  {
    type: 'function',
    function: {
      name: 'getLiveHotelAnalytics',
      description: 'Get operational KPIs including occupancy rate, month-to-date (MTD) revenue, total rooms, active check-ins, and pending bookings.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getRecentBookings',
      description: 'Fetch the latest room bookings with optional status filtering (pending, confirmed, checked-in, cancelled).',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['all', 'pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
            description: 'Filter bookings by status'
          },
          limit: {
            type: 'number',
            description: 'Number of recent bookings to fetch (default: 10)'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getRoomInventoryOverview',
      description: 'Get an inventory snapshot of all hotel rooms grouped by room type and current operational status (Available, Occupied, Reserved, Cleaning, Maintenance).',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'searchGuestBookings',
      description: 'Search bookings across the system by guest name, email, or phone number.',
      parameters: {
        type: 'object',
        properties: {
          keyword: {
            type: 'string',
            description: 'Guest name, email address, or phone number substring'
          }
        },
        required: ['keyword']
      }
    }
  }
];

/**
 * Execute Admin Tool Calls against MongoDB
 */
export const executeAdminTool = async (name, args) => {
  switch (name) {
    case 'getLiveHotelAnalytics': {
      const totalRooms = (await Room.countDocuments()) || 47;
      const bookedCount = await Booking.countDocuments({ status: { $in: ['confirmed', 'checked-in'] } });
      const checkedInCount = await Booking.countDocuments({ status: 'checked-in' });
      const pendingCount = await Booking.countDocuments({ status: 'pending' });
      const confirmedCount = await Booking.countDocuments({ status: 'confirmed' });
      const cancelledCount = await Booking.countDocuments({ status: 'cancelled' });
      const unreadMessages = await Contact.countDocuments({ status: 'new' });
      const pendingEventEnquiries = await EventEnquiry.countDocuments({ status: 'pending' });
      const pendingTableReservations = await TableReservation.countDocuments({ status: 'pending' });

      const occupancyRate = totalRooms > 0 ? Math.round((bookedCount / totalRooms) * 100) : 0;

      // Month-to-date revenue
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const mtdBookings = await Booking.find({
        status: { $nin: ['cancelled', 'pending'] },
        checkIn: { $gte: startOfMonth }
      }).select('totalPrice');

      const mtdRevenueETB = mtdBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      return {
        totalRooms,
        occupancyRate: `${occupancyRate}%`,
        activeGuestsCheckedIn: checkedInCount,
        confirmedUpcomingBookings: confirmedCount,
        pendingBookingsRequiringAction: pendingCount,
        cancelledBookings: cancelledCount,
        mtdRevenueETB: mtdRevenueETB.toLocaleString(),
        unreadInquiries: unreadMessages,
        pendingEventEnquiries,
        pendingTableReservations
      };
    }

    case 'getRecentBookings': {
      const { status = 'all', limit = 10 } = args;
      const query = {};
      if (status !== 'all') {
        query.status = status;
      }

      const bookings = await Booking.find(query)
        .sort('-createdAt')
        .limit(Math.min(limit, 25))
        .populate('room', 'name roomNumber type price')
        .lean();

      return {
        count: bookings.length,
        filterApplied: status,
        bookings: bookings.map(b => ({
          id: b._id,
          guestName: b.fullName,
          phone: b.phone,
          email: b.email,
          room: b.room ? `${b.room.name} (#${b.room.roomNumber})` : 'Unassigned',
          checkIn: new Date(b.checkIn).toISOString().split('T')[0],
          checkOut: new Date(b.checkOut).toISOString().split('T')[0],
          totalPriceETB: b.totalPrice,
          status: b.status,
          paymentStatus: b.paymentStatus,
          bookingSource: b.bookingSource
        }))
      };
    }

    case 'getRoomInventoryOverview': {
      const rooms = await Room.find().select('roomNumber name type price status isAvailable').lean();

      const statusBreakdown = {
        Available: 0,
        Occupied: 0,
        Reserved: 0,
        Cleaning: 0,
        Maintenance: 0
      };

      const typeBreakdown = {};

      rooms.forEach(r => {
        const st = r.status || (r.isAvailable ? 'Available' : 'Occupied');
        statusBreakdown[st] = (statusBreakdown[st] || 0) + 1;

        typeBreakdown[r.type] = (typeBreakdown[r.type] || 0) + 1;
      });

      return {
        totalRooms: rooms.length,
        byStatus: statusBreakdown,
        byType: typeBreakdown,
        sampleRooms: rooms.slice(0, 10).map(r => ({
          roomNumber: r.roomNumber,
          name: r.name,
          type: r.type,
          priceETB: r.price,
          status: r.status
        }))
      };
    }

    case 'searchGuestBookings': {
      const { keyword } = args;
      if (!keyword || !keyword.trim()) {
        return { error: 'Please specify a search keyword.' };
      }

      const regex = new RegExp(keyword.trim(), 'i');
      const bookings = await Booking.find({
        $or: [
          { fullName: regex },
          { email: regex },
          { phone: regex }
        ]
      })
        .sort('-createdAt')
        .limit(10)
        .populate('room', 'name roomNumber type')
        .lean();

      return {
        foundCount: bookings.length,
        bookings: bookings.map(b => ({
          id: b._id,
          guestName: b.fullName,
          phone: b.phone,
          email: b.email,
          room: b.room ? `${b.room.name} (#${b.room.roomNumber})` : 'N/A',
          checkIn: new Date(b.checkIn).toISOString().split('T')[0],
          checkOut: new Date(b.checkOut).toISOString().split('T')[0],
          status: b.status,
          paymentStatus: b.paymentStatus,
          totalPriceETB: b.totalPrice
        }))
      };
    }

    default:
      throw new Error(`Unrecognized admin tool: ${name}`);
  }
};
