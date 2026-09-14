import Booking from '../../models/booking/Booking.js';
import Room from '../../models/room/Room.js';
import Contact from '../../models/contact/Contact.js';
import EventEnquiry from '../../models/event/EventEnquiry.js';
import Event from '../../models/event/Event.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Get dashboard metrics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const totalRooms = await Room.countDocuments() || 47; // fallback to default total
  
  // Count active / booked rooms (confirmed or checked-in)
  const bookedCount = await Booking.countDocuments({ status: { $in: ['confirmed', 'checked-in'] } });
  const checkedInCount = await Booking.countDocuments({ status: 'checked-in' });
  const pendingCount = await Booking.countDocuments({ status: 'pending' });
  const confirmedCount = await Booking.countDocuments({ status: 'confirmed' });
  const cancelledCount = await Booking.countDocuments({ status: 'cancelled' });

  // Count unread messages
  const unreadMessagesCount = await Contact.countDocuments({ status: 'new' });

  // Calculate occupancy rate
  const occupancyRate = totalRooms > 0 ? Math.round((bookedCount / totalRooms) * 100) : 0;

  // Calculate MTD Revenue (Month to Date)
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const mtdBookings = await Booking.find({
    status: { $nin: ['cancelled', 'pending'] },
    checkIn: { $gte: startOfMonth }
  });
  const mtdRevenue = mtdBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  // Get recent registrations
  const recentBookingsRaw = await Booking.find()
    .sort('-createdAt')
    .limit(5)
    .populate('room');

  const recentBookings = recentBookingsRaw.map(b => {
    const initials = b.fullName ? b.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'GS';
    return {
      id: b._id,
      name: b.fullName,
      email: b.email,
      room: b.room ? `${b.room.name} (${b.room.type})` : 'N/A',
      date: new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: b.status === 'pending' ? 'Pending' : b.status === 'confirmed' ? 'Confirmed' : b.status === 'checked-in' ? 'Checked In' : b.status === 'checked-out' ? 'Checked Out' : 'Cancelled',
      initials
    };
  });

  // Build live activity feed from latest database events
  const liveActivities = [];

  // 1. Recent bookings
  const latestBookings = await Booking.find().sort('-createdAt').limit(3);
  latestBookings.forEach(b => {
    const checkInStr = new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const checkOutStr = new Date(b.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    liveActivities.push({
      icon: b.status === 'cancelled' ? 'fas fa-times-circle' : 'fas fa-calendar-plus',
      color: b.status === 'cancelled' ? 'text-danger bg-danger/10 border-danger/20' : 'text-gold bg-gold-glow border-gold/20',
      text: b.status === 'cancelled' 
        ? `Booking for ${b.fullName} was cancelled`
        : `New booking from ${b.fullName} for ${checkInStr}–${checkOutStr}`,
      time: getRelativeTime(b.createdAt),
      createdAt: b.createdAt
    });
  });

  // 2. Recent contact messages
  const latestContacts = await Contact.find().sort('-createdAt').limit(2);
  latestContacts.forEach(c => {
    liveActivities.push({
      icon: 'fas fa-envelope',
      color: 'text-info bg-info/10 border-info/20',
      text: `Received enquiry from ${c.name}: "${c.subject}"`,
      time: getRelativeTime(c.createdAt),
      createdAt: c.createdAt
    });
  });

  // 3. Recent event enquiries
  const latestEventEnquiries = await EventEnquiry.find().sort('-createdAt').limit(2);
  latestEventEnquiries.forEach(ee => {
    liveActivities.push({
      icon: 'fas fa-calendar-check',
      color: 'text-success bg-success/10 border-success/20',
      text: `New event enquiry from ${ee.fullName} for ${ee.eventType}`,
      time: getRelativeTime(ee.createdAt),
      createdAt: ee.createdAt
    });
  });

  // 4. Recent event venues added
  const latestVenues = await Event.find().sort('-createdAt').limit(2);
  latestVenues.forEach(v => {
    liveActivities.push({
      icon: 'fas fa-hotel',
      color: 'text-info bg-info/10 border-info/20',
      text: `New event space added: "${v.name}"`,
      time: getRelativeTime(v.createdAt),
      createdAt: v.createdAt
    });
  });

  // Sort activities by date descending
  liveActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // If no activities, add default fallback
  if (liveActivities.length === 0) {
    liveActivities.push({
      icon: 'fas fa-info-circle',
      color: 'text-gold bg-gold-glow border-gold/20',
      text: 'System started and ready.',
      time: 'Just now',
      createdAt: new Date()
    });
  }

  sendSuccess(res, 200, 'Dashboard statistics retrieved', {
    occupancyRate: `${occupancyRate}%`,
    roomsBooked: `${bookedCount} / ${totalRooms}`,
    revenueMtd: `ETB ${(mtdRevenue / 1000).toFixed(1)}K`,
    pendingBookings: `${pendingCount}`,
    occupancyVal: occupancyRate,
    roomsVal: Math.round((bookedCount / totalRooms) * 100),
    revenueVal: Math.min(Math.round((mtdRevenue / 200000) * 100), 100), // percentage against target
    pendingVal: Math.min(pendingCount * 10, 100),
    unreadMessagesCount,
    recentBookings,
    liveActivities: liveActivities.slice(0, 5)
  });
});

// @desc    Get dashboard revenue breakdown
// @route   GET /api/admin/dashboard/revenue
// @access  Private/Admin
export const getDashboardRevenue = asyncHandler(async (req, res, next) => {
  const { range = 'week' } = req.query;
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const chartData = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  let totalRevenue = 0;

  if (range === 'month') {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day, 0, 0, 0);
      const nextDate = new Date(year, month, day + 1, 0, 0, 0);

      const bookings = await Booking.find({
        status: { $nin: ['cancelled', 'pending'] },
        checkIn: { $gte: date, $lt: nextDate }
      });

      const dayRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      totalRevenue += dayRevenue;

      chartData.push({
        day: `${day}`,
        val: dayRevenue,
        height: '0%'
      });
    }
  } else {
    const numDays = range === 'today' ? 1 : 7;
    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const bookings = await Booking.find({
        status: { $nin: ['cancelled', 'pending'] },
        checkIn: { $gte: date, $lt: nextDate }
      });

      const dayRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      totalRevenue += dayRevenue;

      chartData.push({
        day: daysOfWeek[date.getDay()],
        val: dayRevenue,
        height: '0%'
      });
    }
  }

  // Calculate relative heights
  const maxVal = Math.max(...chartData.map(d => d.val)) || 1;
  chartData.forEach(d => {
    d.height = `${Math.max(Math.round((d.val / maxVal) * 100), 10)}%`;
  });

  sendSuccess(res, 200, 'Dashboard revenue retrieved', {
    totalRevenue,
    chartData
  });
});

// @desc    Get dashboard occupancy split
// @route   GET /api/admin/dashboard/occupancy
// @access  Private/Admin
export const getDashboardOccupancy = asyncHandler(async (req, res, next) => {
  const totalRooms = await Room.countDocuments() || 1;
  const occupied = await Booking.countDocuments({ status: { $in: ['confirmed', 'checked-in'] } });
  const maintenance = await Room.countDocuments({ isAvailable: false });
  const free = Math.max(totalRooms - occupied - maintenance, 0);

  const occupiedPct = Math.round((occupied / totalRooms) * 100);
  const maintenancePct = Math.round((maintenance / totalRooms) * 100);
  const freePct = Math.max(100 - occupiedPct - maintenancePct, 0);

  sendSuccess(res, 200, 'Dashboard occupancy split retrieved', {
    occupied: occupiedPct,
    maintenance: maintenancePct,
    free: freePct,
    occupiedCount: occupied,
    maintenanceCount: maintenance,
    freeCount: free
  });
});

// Helper: relative time formatter
function getRelativeTime(date) {
  const diff = new Date() - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
