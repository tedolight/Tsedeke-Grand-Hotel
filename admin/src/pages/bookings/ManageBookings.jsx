import React, { useState, useEffect, useMemo } from 'react';
import bookingsService from '../../services/bookings/bookingsService.js';
import roomsService from '../../services/rooms/roomsService.js';
import BookingCalendar from './BookingCalendar.jsx';
import useUiStore from '../../store/ui/uiStore.js';

const ManageBookings = () => {
  const { addToast } = useUiStore();
  const [activeTab, setActiveTab] = useState('manage');
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [roomTypeFilter, setRoomTypeFilter] = useState('All Room Types');
  const [monthFilter, setMonthFilter] = useState('June 2026');

  // Form State for New Booking
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassport, setFormPassport] = useState('');
  const [formRoomType, setFormRoomType] = useState('Single');
  const [formRoomNumber, setFormRoomNumber] = useState('');
  const [formCheckIn, setFormCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [formCheckOut, setFormCheckOut] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [formAdults, setFormAdults] = useState(2);
  const [formChildren, setFormChildren] = useState(0);
  const [formRequests, setFormRequests] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Cash');
  const [formBookingSource, setFormBookingSource] = useState('Walk-In');

  // Staff Note inputs
  const [newStaffNote, setNewStaffNote] = useState('');

  // Messaging modal states
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgChannel, setMsgChannel] = useState('email');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await roomsService.getRooms();
      setRooms(res.data || res);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingsService.getBookings();
      const bookingsData = res.data || res;
      const mapped = (Array.isArray(bookingsData) ? bookingsData : []).map(b => {
        const rawCheckIn = b.checkIn || b.checkin || new Date().toISOString();
        const rawCheckOut = b.checkOut || b.checkout || new Date(Date.now() + 86400000).toISOString();
        const checkInDate = new Date(rawCheckIn);
        const checkOutDate = new Date(rawCheckOut);
        const nights = Math.ceil(Math.abs(checkOutDate - checkInDate) / (1000 * 3600 * 24)) || 1;
        const initials = b.fullName ? b.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'GS';
        const rawId = String(b._id || b.id || '1001');
        
        return {
          _id: rawId,
          id: `#SH-${rawId.padStart(5, '0').slice(-5).toUpperCase()}`,
          name: b.fullName || 'Guest',
          phone: b.phone || '',
          email: b.email || '',
          room: b.room ? `${b.room.name || ''} ${b.room.roomNumber || ''}`.trim() : (b.roomType || 'Standard Room'),
          checkIn: !isNaN(checkInDate.getTime()) ? checkInDate.toISOString().split('T')[0] : '',
          checkOut: !isNaN(checkOutDate.getTime()) ? checkOutDate.toISOString().split('T')[0] : '',
          nights,
          amount: Number(b.totalPrice || b.amount || 0),
          status: b.status === 'pending' ? 'Pending' : b.status === 'confirmed' ? 'Confirmed' : b.status === 'checked-in' ? 'Checked In' : b.status === 'checked-out' ? 'Checked Out' : 'Cancelled',
          initials,
          notes: b.specialRequests || b.requests || '',
          nationality: 'Ethiopian',
          passport: 'ET-1234567',
          visits: '1st Visit',
          rate: b.room ? (b.room.price || 2800) : 2800,
          deposit: Math.round(Number(b.totalPrice || b.amount || 0) * 0.3),
          paid: b.paymentStatus === 'paid' ? Number(b.totalPrice || b.amount || 0) : 0,
          paymentMethod: b.paymentStatus === 'paid' ? 'Mobile Money' : 'Cash',
          bookingSource: b.bookingSource || 'Online',
          roomObj: b.room
        };
      });
      // Sort newest first
      const sorted = mapped.sort((a, b) => (Number(b._id) || 0) - (Number(a._id) || 0));
      setBookings(sorted);
      if (sorted.length > 0) {
        setSelectedBooking(sorted[0]);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, []);

  // Update room number when room type changes
  useEffect(() => {
    const typeMapped = formRoomType === 'Royal Suite' ? 'vip' : formRoomType === 'Executive Suite' ? 'suite' : formRoomType === 'Junior Suite' ? 'suite' : formRoomType === 'Deluxe Room' ? 'deluxe' : 'standard';
    const filtered = rooms.filter(r => r.type === typeMapped);
    if (filtered.length > 0) {
      setFormRoomNumber(filtered[0].roomNumber);
    } else if (rooms.length > 0) {
      setFormRoomNumber(rooms[0].roomNumber);
    } else {
      setFormRoomNumber('');
    }
  }, [formRoomType, rooms]);

  // Handle status update
  const handleUpdateStatus = async (id, nextStatus) => {
    const booking = bookings.find(b => b.id === id || b._id === id);
    if (!booking) return;

    let dbStatus = 'pending';
    if (nextStatus === 'Confirmed') dbStatus = 'confirmed';
    if (nextStatus === 'Checked In') dbStatus = 'checked-in';
    if (nextStatus === 'Checked Out') dbStatus = 'checked-out';
    if (nextStatus === 'Cancelled') dbStatus = 'cancelled';

    try {
      if (dbStatus === 'cancelled') {
        await bookingsService.cancelBooking(booking._id);
      } else {
        await bookingsService.updateStatus(booking._id, dbStatus);
      }
      await fetchBookings();
      await fetchRooms();
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  // Submit New Booking
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    const selectedRoomObj = rooms.find(r => r.roomNumber === formRoomNumber) || rooms[0];
    if (!selectedRoomObj) {
      addToast('Selected room number is not valid or available.', 'error');
      return;
    }

    const bookingData = {
      room: selectedRoomObj._id,
      checkIn: formCheckIn,
      checkOut: formCheckOut,
      guests: Number(formAdults) + Number(formChildren),
      fullName: formName,
      email: formEmail || `${formName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tsedekegrandhotel.com`,
      phone: formPhone,
      specialRequests: formRequests,
      bookingSource: formBookingSource,
      status: formBookingSource === 'Walk-In' ? 'checked-in' : 'confirmed',
      paymentStatus: 'paid'
    };

    try {
      await bookingsService.createBooking(bookingData);
      addToast(`${formBookingSource} booking registered successfully for ${formName}!`, 'success');
      await fetchBookings();
      await fetchRooms();
      setShowAddModal(false);
      // Reset Form
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormPassport('');
    } catch (err) {
      console.error('Failed to create booking:', err);
      addToast('Failed to create booking.', 'error');
    }
  };

  // Add staff note
  const handleAddStaffNote = () => {
    if (!newStaffNote || !selectedBooking) return;
    const updatedNotes = selectedBooking.notes 
      ? `${selectedBooking.notes}\n\n— Staff note: ${newStaffNote}` 
      : `— Staff note: ${newStaffNote}`;
    
    setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, notes: updatedNotes } : b));
    setSelectedBooking(prev => ({ ...prev, notes: updatedNotes }));
    setNewStaffNote('');
  };

  const handleOpenMsgModal = (channel) => {
    if (!selectedBooking) return;
    setMsgChannel(channel);
    setMsgSubject(channel === 'email' ? 'Stay & Arrival Details — Tsedeke Grand Hotel' : '');
    
    const firstName = selectedBooking.name.split(' ')[0] || 'Guest';
    if (channel === 'email') {
      setMsgBody(`Dear ${selectedBooking.name},\n\nWe are looking forward to welcoming you to Tsedeke Grand Hotel.\n\nYour stay details:\n🏨 Room: ${selectedBooking.room}\n📅 Check-in: ${selectedBooking.checkIn}\n📅 Check-out: ${selectedBooking.checkOut}\n\nPlease let us know if you have any questions or require airport transfer services.\n\nWarm regards,\nTsedeke Grand Hotel Management`);
    } else {
      setMsgBody(`Hi ${firstName}, we look forward to welcoming you to Tsedeke Grand Hotel on ${selectedBooking.checkIn}. Safe travels!`);
    }
    setShowMsgModal(true);
  };

  const handleSendMsgSubmit = async (e) => {
    e.preventDefault();
    if (!msgBody || !selectedBooking) return;
    setSendingMsg(true);

    try {
      const payload = {
        channel: msgChannel,
        message: msgBody,
        subject: msgChannel === 'email' ? msgSubject : undefined
      };
      
      const res = await bookingsService.sendMessage(selectedBooking._id, payload);
      
      // Update local notes with the new log returned from backend
      const updatedNotes = res.data?.specialRequests || res.specialRequests || '';
      
      setBookings(prev => prev.map(b => b._id === selectedBooking._id ? { ...b, notes: updatedNotes } : b));
      setSelectedBooking(prev => ({ ...prev, notes: updatedNotes }));
      
      addToast(`${msgChannel.toUpperCase()} message sent and logged successfully.`, 'success');
      setShowMsgModal(false);
      setMsgBody('');
      setMsgSubject('');
    } catch (err) {
      console.error('Failed to send message:', err);
      addToast('Error sending message. Please try again.', 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  const applyMsgTemplate = (type) => {
    if (!selectedBooking) return;
    const firstName = selectedBooking.name.split(' ')[0] || 'Guest';
    
    if (msgChannel === 'email') {
      if (type === 'welcome') {
        setMsgBody(`Dear ${selectedBooking.name},\n\nWe are preparing for your upcoming stay at Tsedeke Grand Hotel.\n\nCheck-in details:\n📅 Date: ${selectedBooking.checkIn}\n🕒 Time: Standard check-in starts at 14:00\n🏨 Room: ${selectedBooking.room}\n\nPlease reply to this email if you need anything.\n\nBest regards,\nTsedeke Grand Hotel Team`);
      } else if (type === 'checkout') {
        setMsgBody(`Dear ${selectedBooking.name},\n\nWe hope you have enjoyed your stay at Tsedeke Grand Hotel.\n\nThis is a friendly reminder that check-out is scheduled for today, ${selectedBooking.checkOut}, at 12:00 PM.\n\nHave a safe journey home!\n\nWarm regards,\nTsedeke Grand Hotel Team`);
      } else if (type === 'payment') {
        setMsgBody(`Dear ${selectedBooking.name},\n\nThank you for choosing Tsedeke Grand Hotel.\n\nWe are reviewing your reservation (#AH-${selectedBooking.id}) and would like to verify your payment status. Please send us a copy of your bank deposit or transaction receipt.\n\nBest regards,\nFinance Department`);
      }
    } else {
      if (type === 'welcome') {
        setMsgBody(`Hi ${firstName}, we look forward to welcoming you to Tsedeke Grand Hotel on ${selectedBooking.checkIn}. Standard check-in starts at 14:00.`);
      } else if (type === 'checkout') {
        setMsgBody(`Hi ${firstName}, we hope you enjoyed your stay. Friendly reminder that check-out is at 12:00 PM today. Safe travels!`);
      } else if (type === 'payment') {
        setMsgBody(`Hi ${firstName}, please send us a screenshot of your transaction reference for booking ${selectedBooking.id} to verify payment.`);
      }
    }
  };

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All Status' || b.status === statusFilter;
      
      const matchesRoomType = roomTypeFilter === 'All Room Types' || 
        (roomTypeFilter === 'Standard' && b.room.includes('Standard')) ||
        (roomTypeFilter === 'Deluxe' && b.room.includes('Deluxe')) ||
        (roomTypeFilter === 'Junior Suite' && b.room.includes('Junior')) ||
        (roomTypeFilter === 'Executive Suite' && b.room.includes('Executive')) ||
        (roomTypeFilter === 'Royal Suite' && b.room.includes('Royal'));

      return matchesSearch && matchesStatus && matchesRoomType;
    });
  }, [bookings, searchQuery, statusFilter, roomTypeFilter]);

  const stats = useMemo(() => {
    const totalThisMonth = bookings.length;
    const checkedIn = bookings.filter(b => b.status === 'Checked In').length;
    const confirmed = bookings.filter(b => b.status === 'Confirmed').length;
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const cancelled = bookings.filter(b => b.status === 'Cancelled').length;
    return { totalThisMonth, checkedIn, confirmed, pending, cancelled };
  }, [bookings]);

  // Export current bookings as CSV
  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Guest Name', 'Email', 'Room', 'Check-In', 'Check-Out', 'Nights', 'Amount (ETB)', 'Status'];
    const rows = filteredBookings.map(b => [
      b.id,
      b.name,
      b.email || '',
      b.room,
      b.checkIn,
      b.checkOut,
      b.nights,
      b.amount,
      b.status
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tsedeke-grand-bookings-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gold font-montserrat">
        <i className="fas fa-spinner fa-spin text-3xl mb-4 text-gold" />
        <span className="text-xs uppercase tracking-[2px] text-text-muted">Loading Bookings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none font-montserrat">
      {/* ── TOP SUB-NAV TABS ── */}
      <div className="flex bg-dark-2 border-b border-border-gold-soft px-3 sm:px-7 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('manage')}
          className={`py-3.5 px-4.5 text-[11px] tracking-[1px] uppercase cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'manage' ? 'color-gold border-gold text-gold font-semibold' : 'text-text-muted border-transparent hover:text-white'
          }`}
        >
          <i className="fas fa-list text-xs" /> Manage Bookings
        </button>
        <button
          onClick={() => setActiveTab('detail')}
          className={`py-3.5 px-4.5 text-[11px] tracking-[1px] uppercase cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'detail' ? 'color-gold border-gold text-gold font-semibold' : 'text-text-muted border-transparent hover:text-white'
          }`}
        >
          <i className="fas fa-file-alt text-xs" /> Booking Detail
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`py-3.5 px-4.5 text-[11px] tracking-[1px] uppercase cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'calendar' ? 'color-gold border-gold text-gold font-semibold' : 'text-text-muted border-transparent hover:text-white'
          }`}
        >
          <i className="fas fa-calendar-alt text-xs" /> Calendar View
        </button>
      </div>

      {/* ── PANEL 1: MANAGE BOOKINGS ── */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-gold-soft pb-5">
            <div>
              <h1 className="font-cinzel text-xl text-white tracking-[0.5px] font-semibold mb-1">All Bookings</h1>
              <p className="text-[11px] text-text-muted tracking-[0.5px]">Manage and track all reservations</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleExportCSV}
                className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-file-export" /> Export CSV
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-plus" /> New Booking
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {[
              { label: 'Total This Month', value: stats.totalThisMonth, icon: 'fas fa-calendar-check', color: 'text-gold bg-gold-glow border-border-gold' },
              { label: 'Checked In', value: stats.checkedIn, icon: 'fas fa-sign-in-alt', color: 'text-info bg-info/10 border-info/20' },
              { label: 'Confirmed', value: stats.confirmed, icon: 'fas fa-check-circle', color: 'text-success bg-success/10 border-success/20' },
              { label: 'Pending', value: stats.pending, icon: 'fas fa-clock', color: 'text-warning bg-warning/10 border-warning/20' },
              { label: 'Cancelled', value: stats.cancelled, icon: 'fas fa-times-circle', color: 'text-danger bg-danger/10 border-danger/20' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-dark-3 border border-border-gold-soft rounded-lg p-4 flex items-center gap-3.5 hover:border-border-gold transition-colors duration-200">
                <div className={`w-[38px] h-[38px] rounded-lg border flex items-center justify-center text-sm ${stat.color}`}>
                  <i className={stat.icon} />
                </div>
                <div>
                  <div className="font-cinzel text-xl text-white font-semibold leading-none mb-1">{stat.value}</div>
                  <div className="text-[9px] text-text-muted tracking-[0.5px] uppercase font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-2.5 bg-dark-3 border border-border-gold-soft p-3 rounded-lg">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search guest name, booking ID, room…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-4 border border-border-gold rounded p-2 pl-9 text-xs text-white outline-none focus:border-gold transition-colors"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-dark-4 border border-border-gold text-white p-2 px-3 outline-none text-xs rounded cursor-pointer"
              >
                <option>All Status</option>
                <option>Confirmed</option>
                <option>Checked In</option>
                <option>Pending</option>
                <option>Cancelled</option>
                <option>Checked Out</option>
              </select>

              <select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
                className="bg-dark-4 border border-border-gold text-white p-2 px-3 outline-none text-xs rounded cursor-pointer"
              >
                <option>All Room Types</option>
                <option>Standard</option>
                <option>Deluxe</option>
                <option>Junior Suite</option>
                <option>Executive Suite</option>
                <option>Royal Suite</option>
              </select>

              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="bg-dark-4 border border-border-gold text-white p-2 px-3 outline-none text-xs rounded cursor-pointer"
              >
                <option>June 2026</option>
                <option>May 2026</option>
                <option>July 2026</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-gold-soft bg-dark-2/40">
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" className="accent-gold" />
                        <span>ALL</span>
                      </label>
                    </th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Booking ID</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Guest</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Room</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Check-In</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Check-Out</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px] text-center">Nights</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Total</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Status</th>
                    <th className="p-4 text-[10px] text-text-muted uppercase tracking-[1.5px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gold-soft/50">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-text-muted text-xs">
                        No bookings found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr 
                        key={b.id} 
                        onClick={() => { setSelectedBooking(b); setActiveTab('detail'); }}
                        className="hover:bg-dark-4 transition-colors cursor-pointer"
                      >
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="accent-gold" />
                        </td>
                        <td className="p-4 text-xs font-cinzel text-gold font-medium">{b.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-[32px] h-[32px] rounded-full bg-dark-5 border border-border-gold flex items-center justify-center text-[10px] font-cinzel text-gold font-semibold shrink-0">
                              {b.initials}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[13px] text-white font-medium">{b.name}</span>
                                {b.bookingSource === 'Walk-In' && (
                                  <span className="text-[9px] font-bold bg-gold/20 text-gold border border-gold/30 px-1.5 rounded" title="Physical Walk-In Guest">Walk-In</span>
                                )}
                              </div>
                              <span className="text-[10px] text-text-muted">{b.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-white-dim">{b.room}</td>
                        <td className="p-4 text-xs text-white-dim">{b.checkIn}</td>
                        <td className="p-4 text-xs text-white-dim">{b.checkOut}</td>
                        <td className="p-4 text-xs text-gold font-medium text-center">{b.nights}</td>
                        <td className={`p-4 text-xs font-semibold ${b.status === 'Cancelled' ? 'text-danger line-through' : 'text-success'}`}>
                          {(b.amount || 0).toLocaleString()} ETB
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] font-bold p-1 px-2.5 rounded-full ${
                            b.status === 'Confirmed' ? 'bg-success/10 text-success border border-success/20' : 
                            b.status === 'Pending' ? 'bg-warning/10 text-warning border border-warning/20' : 
                            b.status === 'Checked In' ? 'bg-info/10 text-info border border-info/20' :
                            b.status === 'Checked Out' ? 'bg-gold-glow text-gold border border-gold/20' :
                            'bg-danger/10 text-danger border border-danger/20'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => { setSelectedBooking(b); setActiveTab('detail'); }}
                              className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                              title="View Details"
                            >
                              <i className="fas fa-eye" />
                            </button>
                            {b.status === 'Pending' && (
                              <button 
                                onClick={() => handleUpdateStatus(b.id, 'Confirmed')}
                                className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-success hover:text-success text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                                title="Confirm Booking"
                              >
                                <i className="fas fa-check" />
                              </button>
                            )}
                            {b.status === 'Confirmed' && (
                              <button 
                                onClick={() => handleUpdateStatus(b.id, 'Checked In')}
                                className="px-2 h-7 bg-info/20 border border-info/40 hover:bg-info hover:text-black text-info font-bold text-[9px] uppercase tracking-wider rounded flex items-center gap-1 cursor-pointer transition-all"
                                title="Check In Guest"
                              >
                                <i className="fas fa-sign-in-alt text-[9px]" /> Check In
                              </button>
                            )}
                            {b.status === 'Checked In' && (
                              <button 
                                onClick={() => handleUpdateStatus(b.id, 'Checked Out')}
                                className="px-2 h-7 bg-gold/20 border border-gold/40 hover:bg-gold hover:text-black text-gold font-bold text-[9px] uppercase tracking-wider rounded flex items-center gap-1 cursor-pointer transition-all"
                                title="Check Out Guest"
                              >
                                <i className="fas fa-sign-out-alt text-[9px]" /> Check Out
                              </button>
                            )}
                            {b.status !== 'Cancelled' && b.status !== 'Checked Out' && (
                              <button 
                                onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                                className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-danger hover:text-danger text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                                title="Cancel Reservation"
                              >
                                <i className="fas fa-ban" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between p-3.5 px-5 border-t border-border-gold-soft bg-dark-2/20">
              <span className="text-[11px] text-text-muted">Showing {filteredBookings.length} of {bookings.length} bookings</span>
              <div className="flex gap-1">
                <button className="w-8 h-8 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold rounded flex items-center justify-center cursor-pointer text-xs text-text-muted"><i className="fas fa-chevron-left text-[9px]" /></button>
                <button className="w-8 h-8 bg-gold text-black border border-gold font-bold rounded flex items-center justify-center cursor-pointer text-xs">1</button>
                <button className="w-8 h-8 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold rounded flex items-center justify-center cursor-pointer text-xs text-text-muted"><i className="fas fa-chevron-right text-[9px]" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PANEL 2: BOOKING DETAIL ── */}
      {activeTab === 'detail' && selectedBooking && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('manage')}
              className="bg-transparent border border-border-gold hover:border-gold hover:text-gold text-text-muted text-[10px] tracking-[1.5px] uppercase font-semibold py-1.5 px-3.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <i className="fas fa-arrow-left" /> Back
            </button>
            <div>
              <h2 className="font-cinzel text-lg text-white font-semibold">Booking Detail</h2>
              <p className="text-[10px] text-text-muted tracking-[0.5px]">Full reservation overview</p>
            </div>
          </div>

          {/* Header ID card */}
          <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="font-cinzel text-xl text-gold font-semibold mb-1">{selectedBooking.id}</div>
              <div className="text-[11px] text-text-muted flex flex-wrap gap-4">
                <span className="flex items-center gap-1"><i className="fas fa-calendar text-gold" /> Booked Jun 01, 2026 at 09:14 AM</span>
                <span className="flex items-center gap-1"><i className="fas fa-globe" /> Online — Website</span>
                <span className="flex items-center gap-1"><i className="fas fa-user" /> Walk-in Guest</span>
              </div>
            </div>
            <div className="flex items-center gap-3.5 flex-wrap">
              <span className={`text-[11px] font-bold p-1.5 px-3.5 rounded-full ${
                selectedBooking.status === 'Checked In' ? 'bg-info/10 text-info border border-info/20' :
                selectedBooking.status === 'Confirmed' ? 'bg-success/10 text-success border border-success/20' :
                selectedBooking.status === 'Pending' ? 'bg-warning/10 text-warning border border-warning/20' :
                selectedBooking.status === 'Checked Out' ? 'bg-gold-glow text-gold border border-gold/20' :
                'bg-danger/10 text-danger border border-danger/20'
              }`}>
                ✦ {selectedBooking.status}
              </span>
              <div className="flex gap-2">
                <button className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1 cursor-pointer">
                  <i className="fas fa-print" /> Print
                </button>
                <button 
                  onClick={() => handleOpenMsgModal('email')}
                  className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <i className="fas fa-envelope" /> Email Guest
                </button>
                {selectedBooking.status === 'Confirmed' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Checked In')}
                    className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Check In
                  </button>
                )}
                {selectedBooking.status === 'Checked In' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Checked Out')}
                    className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Check Out
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details layout columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left Column (2 spans wide) */}
            <div className="lg:col-span-2 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Guest Info */}
                <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                  <div className="font-cinzel text-xs text-gold tracking-[1px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5">
                    <i className="fas fa-user" /> Guest Information
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'Full Name', val: selectedBooking.name },
                      { key: 'Phone', val: selectedBooking.phone },
                      { key: 'Email', val: selectedBooking.email },
                      { key: 'Nationality', val: selectedBooking.nationality },
                      { key: 'National ID / FAN', val: selectedBooking.nationalId || selectedBooking.passport || '—' },
                      { key: 'Visits', val: selectedBooking.visits, highlight: true }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-border-gold-soft last:border-0">
                        <span className="text-text-muted">{row.key}</span>
                        <span className={`font-medium ${row.highlight ? 'text-gold font-cinzel font-semibold' : 'text-white'}`}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Room Info */}
                <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                  <div className="font-cinzel text-xs text-gold tracking-[1px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5">
                    <i className="fas fa-bed" /> Room Details
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'Room', val: selectedBooking.room, highlight: true },
                      { key: 'Floor', val: '1st Floor' },
                      { key: 'Bed Type', val: 'King Bed' },
                      { key: 'Guests', val: '2 Adults, 0 Children' },
                      { key: 'Check-in', val: `${selectedBooking.checkIn} — 02:00 PM` },
                      { key: 'Check-out', val: `${selectedBooking.checkOut} — 12:00 PM` }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-border-gold-soft last:border-0">
                        <span className="text-text-muted">{row.key}</span>
                        <span className={`font-medium ${row.highlight ? 'text-gold font-cinzel font-semibold' : 'text-white'}`}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5">
                  <i className="fas fa-receipt" /> Price Breakdown
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">Room Rate (per night)</span><span className="text-white">{(selectedBooking.rate || 0).toLocaleString()} ETB</span></div>
                    <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">× {selectedBooking.nights || 1} Nights</span><span className="text-white">{((selectedBooking.rate || 0) * (selectedBooking.nights || 1)).toLocaleString()} ETB</span></div>
                    <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">Service Charge (10%)</span><span className="text-white">{Math.round((selectedBooking.rate || 0) * (selectedBooking.nights || 1) * 0.1).toLocaleString()} ETB</span></div>
                    <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">VAT (15%)</span><span className="text-white">{Math.round((selectedBooking.rate || 0) * (selectedBooking.nights || 1) * 0.15).toLocaleString()} ETB</span></div>
                    <div className="flex justify-between text-xs pt-3 border-t border-border-gold font-semibold">
                      <span className="text-white">TOTAL</span>
                      <span className="text-gold font-cinzel text-sm">{(selectedBooking.amount || 0).toLocaleString()} ETB</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">Payment Method</span><span className="text-white">{selectedBooking.paymentMethod}</span></div>
                    <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">Amount Paid</span><span className="text-success font-semibold">{(selectedBooking.paid || 0).toLocaleString()} ETB</span></div>
                    <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">Balance Due</span><span className="text-warning font-semibold">{((selectedBooking.amount || 0) - (selectedBooking.paid || 0)).toLocaleString()} ETB</span></div>
                    <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">Deposit</span><span className="text-white">{(selectedBooking.deposit || 0).toLocaleString()} ETB</span></div>
                    <div className="flex gap-2 pt-3">
                      <button className="bg-success/15 border border-success/30 hover:bg-success/25 text-success text-[10px] tracking-[1px] uppercase font-semibold py-1.5 px-3 rounded cursor-pointer transition-colors flex items-center gap-1">
                        <i className="fas fa-coins" /> Record Payment
                      </button>
                      <button className="bg-transparent border border-border-gold hover:border-gold hover:text-gold text-text-muted text-[10px] tracking-[1px] uppercase font-semibold py-1.5 px-3 rounded cursor-pointer transition-colors flex items-center gap-1">
                        <i className="fas fa-file-invoice" /> Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addons */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5">
                  <i className="fas fa-concierge-bell" /> Add-ons & Special Requests
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                  <span className="bg-gold-glow border border-border-gold text-gold text-[10px] py-1 px-3.5 rounded-full flex items-center gap-1"><i className="fas fa-car" /> Airport Transfer</span>
                  <span className="bg-gold-glow border border-border-gold text-gold text-[10px] py-1 px-3.5 rounded-full flex items-center gap-1"><i className="fas fa-birthday-cake" /> Birthday Cake</span>
                  <span className="bg-dark-4 border border-border-gold-soft text-text-muted text-[10px] py-1 px-3.5 rounded-full cursor-pointer hover:border-gold transition-colors flex items-center gap-1"><i className="fas fa-plus" /> Add Service</span>
                </div>
                <div className="bg-dark-4 border border-border-gold-soft rounded p-3.5 text-xs text-text-muted leading-relaxed italic">
                  "{selectedBooking.notes || 'No special guest requests recorded for this stay.'}"
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Timeline */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5">
                  <i className="fas fa-stream" /> Booking Timeline
                </div>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-1 before:bottom-1 before:w-[1px] before:bg-border-gold">
                  {[
                    { title: 'Booking Created', time: 'Jun 01, 2026 · 09:14 AM', done: true },
                    { title: 'Payment Received', time: 'Jun 01, 2026 · 09:20 AM', done: true },
                    { title: 'Confirmation Sent', time: 'Jun 01, 2026 · 09:21 AM', done: true },
                    { title: 'Checked In', time: 'Jun 01, 2026 · 02:00 PM', active: selectedBooking.status === 'Checked In' || selectedBooking.status === 'Checked Out', done: selectedBooking.status === 'Checked Out' },
                    { title: 'Check-out (Pending)', time: 'Jun 04, 2026 · 12:00 PM', grey: selectedBooking.status !== 'Checked Out', active: selectedBooking.status === 'Checked Out' }
                  ].map((item, i) => (
                    <div key={i} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-6 top-0 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] border transition-colors ${
                        item.active ? 'bg-gold border-gold text-black' : 
                        item.done ? 'bg-gold-glow border-border-gold text-gold' : 
                        'bg-dark-5 border-border-gold-soft text-text-muted'
                      }`}>
                        {item.done ? '✓' : i + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className={`text-[12px] font-medium ${item.active ? 'text-gold' : item.done ? 'text-white' : 'text-text-muted'}`}>{item.title}</span>
                        <span className="text-[9px] text-text-muted">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Notes */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5">
                  <i className="fas fa-sticky-note" /> Staff Notes
                </div>
                <textarea 
                  value={newStaffNote}
                  onChange={(e) => setNewStaffNote(e.target.value)}
                  placeholder="Add a staff note…"
                  className="w-full bg-dark-4 border border-border-gold rounded p-3 text-xs text-white outline-none focus:border-gold resize-none h-20 mb-3"
                />
                <button 
                  onClick={handleAddStaffNote}
                  className="bg-transparent border border-border-gold hover:border-gold hover:text-gold text-text-muted text-[10px] tracking-[1.5px] uppercase font-semibold py-1.5 px-4 rounded transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <i className="fas fa-save" /> Save Note
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-xs text-gold tracking-[1px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5">
                  <i className="fas fa-bolt" /> Quick Actions
                </div>
                <div className="flex flex-col gap-2">
                  <button className="bg-transparent border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted text-xs font-semibold py-2 px-3 rounded transition-colors flex items-center gap-2 cursor-pointer w-full text-left">
                    <i className="fas fa-key text-gold" /> Issue Room Key
                  </button>
                  <button className="bg-transparent border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted text-xs font-semibold py-2 px-3 rounded transition-colors flex items-center gap-2 cursor-pointer w-full text-left">
                    <i className="fas fa-utensils text-gold" /> Add Restaurant Order
                  </button>
                  <button 
                    onClick={() => handleOpenMsgModal('sms')}
                    className="bg-transparent border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted text-xs font-semibold py-2 px-3 rounded transition-colors flex items-center gap-2 cursor-pointer w-full text-left"
                  >
                    <i className="fas fa-sms text-gold" /> Send SMS to Guest
                  </button>
                  <button className="bg-transparent border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted text-xs font-semibold py-2 px-3 rounded transition-colors flex items-center gap-2 cursor-pointer w-full text-left">
                    <i className="fas fa-exchange-alt text-warning" /> Change Room
                  </button>
                  {selectedBooking.status !== 'Cancelled' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'Cancelled')}
                      className="bg-danger/15 border border-danger/30 hover:bg-danger/25 text-danger text-xs font-semibold py-2 px-3 rounded transition-colors flex items-center gap-2 cursor-pointer w-full text-left"
                    >
                      <i className="fas fa-ban" /> Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PANEL 3: CALENDAR VIEW ── */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-gold-soft pb-5">
            <div>
              <h1 className="font-cinzel text-xl text-white tracking-[0.5px] font-semibold mb-1">Booking Calendar</h1>
              <p className="text-[11px] text-text-muted tracking-[0.5px]">Visual overview of all reservations</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-dark-4 border border-border-gold rounded overflow-hidden">
                <button className="px-3.5 py-1.5 text-[10px] tracking-[1px] font-semibold text-black bg-gold">Month</button>
                <button className="px-3.5 py-1.5 text-[10px] tracking-[1px] font-semibold text-text-muted hover:text-white">Week</button>
                <button className="px-3.5 py-1.5 text-[10px] tracking-[1px] font-semibold text-text-muted hover:text-white">Day</button>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-plus" /> New Booking
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Calendar Main (Col Span 3) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Occupancy forecasts */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-4">
                <div className="font-cinzel text-[10px] text-text-muted tracking-[1.5px] uppercase mb-3.5 font-semibold">WEEKLY OCCUPANCY FORECAST</div>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
                  {[
                    { day: 'Mon', rate: 88 },
                    { day: 'Tue', rate: 75 },
                    { day: 'Wed', rate: 92 },
                    { day: 'Thu', rate: 100 },
                    { day: 'Fri', rate: 100 },
                    { day: 'Sat', rate: 85 },
                    { day: 'Sun', rate: 68 }
                  ].map((row, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[10px] text-text-muted font-medium">
                        <span>{row.day}</span>
                        <span className="text-gold">{row.rate}%</span>
                      </div>
                      <div className="h-1.5 bg-dark-5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-gold-dark to-gold" style={{ width: `${row.rate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <BookingCalendar
                bookings={bookings}
                onSelectBooking={(b) => {
                  setSelectedBooking(b);
                  setActiveTab('detail');
                }}
              />
            </div>

            {/* Calendar Right Sidebar */}
            <div className="space-y-5">
              {/* Legend */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-[10px] text-text-muted tracking-[1.5px] uppercase mb-3.5 font-semibold">LEGEND</div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Check-in (↓)', color: 'bg-info' },
                    { label: 'Check-out (↑)', color: 'bg-gold' },
                    { label: 'Confirmed Stay', color: 'bg-success' },
                    { label: 'Pending Booking', color: 'bg-warning' },
                    { label: 'Fully Booked', color: 'bg-danger' }
                  ].map((legend, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-text-muted">
                      <span className={`w-2.5 h-2.5 rounded-sm ${legend.color}`} />
                      <span>{legend.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room type availability */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
                <div className="font-cinzel text-[10px] text-text-muted tracking-[1.5px] uppercase mb-3.5 font-semibold">ROOM TYPE AVAILABILITY</div>
                <div className="space-y-3">
                  {[
                    { type: 'Standard', free: '4 free', rate: 60, color: 'bg-success', colorText: 'text-success' },
                    { type: 'Deluxe', free: '2 free', rate: 80, color: 'bg-warning', colorText: 'text-warning' },
                    { type: 'Junior Suite', free: '3 free', rate: 50, color: 'bg-success', colorText: 'text-success' },
                    { type: 'Executive', free: '0 free', rate: 100, color: 'bg-danger', colorText: 'text-danger' },
                    { type: 'Royal Suite', free: '1 free', rate: 80, color: 'bg-warning', colorText: 'text-warning' }
                  ].map((row, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[11px] text-text-muted">
                        <span>{row.type}</span>
                        <span className={`font-semibold ${row.colorText}`}>{row.free}</span>
                      </div>
                      <div className="h-1.5 bg-dark-5 rounded-full overflow-hidden">
                        <div className={`h-full ${row.color}`} style={{ width: `${row.rate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Arrivals list */}
              <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden">
                <div className="p-3.5 px-4.5 border-b border-border-gold-soft font-cinzel text-[11px] text-white tracking-[0.5px] font-semibold">
                  UPCOMING ARRIVALS
                </div>
                <div className="divide-y divide-border-gold-soft/50">
                  {bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').slice(0, 4).map((b, i) => (
                    <div key={i} className="p-4 hover:bg-dark-4 transition-colors">
                      <div className="text-xs text-white font-medium mb-0.5">{b.name}</div>
                      <div className="text-[11px] text-text-muted mb-2">{b.room}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                        <span className={`text-[8px] font-bold p-0.5 px-1.5 rounded ${
                          b.status === 'Confirmed' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                        }`}>{b.status}</span>
                        <span>·</span>
                        <span>{b.checkIn} → {b.checkOut}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW BOOKING MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-3 border border-border-gold rounded-lg w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 px-6 border-b border-border-gold-soft flex justify-between items-center bg-dark-2/40">
              <h2 className="font-cinzel text-sm text-white font-semibold">New Booking</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 bg-dark-4 border border-border-gold-soft rounded flex items-center justify-center cursor-pointer text-text-muted hover:border-danger hover:text-danger transition-colors text-xs"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateBooking} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1 font-semibold">Booking Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormBookingSource('Walk-In')}
                    className={`flex-1 py-2 px-3 rounded text-xs font-semibold cursor-pointer border transition-colors flex items-center justify-center gap-1.5 ${
                      formBookingSource === 'Walk-In' 
                        ? 'bg-gold text-black border-gold' 
                        : 'bg-dark-4 text-text-muted border-border-gold-soft hover:text-white'
                    }`}
                  >
                    <i className="fas fa-walking" /> Physical Walk-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormBookingSource('Online')}
                    className={`flex-1 py-2 px-3 rounded text-xs font-semibold cursor-pointer border transition-colors flex items-center justify-center gap-1.5 ${
                      formBookingSource === 'Online' 
                        ? 'bg-gold text-black border-gold' 
                        : 'bg-dark-4 text-text-muted border-border-gold-soft hover:text-white'
                    }`}
                  >
                    <i className="fas fa-globe" /> Online / Advance
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abebe Tadesse"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +251 911 234 567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="guest@email.com (optional)"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">National ID / FAN (or Passport)</label>
                  <input
                    type="text"
                    placeholder="16-digit FAN or Passport No."
                    value={formPassport}
                    onChange={(e) => setFormPassport(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">Room Type</label>
                  <select
                    value={formRoomType}
                    onChange={(e) => setFormRoomType(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="Single">Single</option>
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Family Double Bed">Family Double Bed</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">Room Number</label>
                  <select
                    value={formRoomNumber}
                    onChange={(e) => setFormRoomNumber(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold cursor-pointer"
                  >
                    {rooms.length > 0 ? (
                      rooms.map(r => (
                        <option key={r._id || r.roomNumber} value={r.roomNumber}>
                          Room {r.roomNumber} ({r.name || r.type}) — {r.status || 'Available'}
                        </option>
                      ))
                    ) : (
                      <option value="">No rooms available</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={formCheckIn}
                    onChange={(e) => setFormCheckIn(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">Check-out Date</label>
                  <input
                    type="date"
                    value={formCheckOut}
                    onChange={(e) => setFormCheckOut(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">Adults</label>
                  <input
                    type="number"
                    min="1"
                    value={formAdults}
                    onChange={(e) => setFormAdults(parseInt(e.target.value) || 1)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">Children</label>
                  <input
                    type="number"
                    min="0"
                    value={formChildren}
                    onChange={(e) => setFormChildren(parseInt(e.target.value) || 0)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">Special Requests</label>
                <textarea
                  placeholder="Any special requests or notes…"
                  value={formRequests}
                  onChange={(e) => setFormRequests(e.target.value)}
                  className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold resize-none h-16"
                />
              </div>

              {/* Estimate card */}
              <div className="bg-dark-4 border border-border-gold-soft rounded p-4 flex justify-between items-center gap-3">
                <div>
                  <div className="text-[10px] text-text-muted mb-0.5 tracking-[1px] uppercase">ESTIMATED TOTAL</div>
                  <div className="font-cinzel text-lg text-gold font-semibold">
                    {(() => {
                      const start = new Date(formCheckIn);
                      const end = new Date(formCheckOut);
                      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
                      let rate = 1400;
                      if (formRoomType.includes('Royal')) rate = 3800;
                      else if (formRoomType.includes('Executive')) rate = 4300;
                      else if (formRoomType.includes('Junior')) rate = 2900;
                      else if (formRoomType.includes('Deluxe')) rate = 2100;
                      return (rate * diff).toLocaleString();
                    })()} ETB
                  </div>
                  <div className="text-[9px] text-text-muted">Includes local VAT &amp; service charge</div>
                </div>
                <select
                  value={formPaymentMethod}
                  onChange={(e) => setFormPaymentMethod(e.target.value)}
                  className="bg-dark-3 border border-border-gold text-white p-2 text-xs rounded outline-none cursor-pointer"
                >
                  <option>Cash Payment</option>
                  <option>Bank Transfer</option>
                  <option>Mobile Money</option>
                </select>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-2 justify-end pt-3.5 border-t border-border-gold-soft/50">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-transparent border border-border-gold hover:border-gold hover:text-gold text-text-muted text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-5 rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-5 rounded transition-colors cursor-pointer"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MESSAGING MODAL ── */}
      {showMsgModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-dark-3 border border-border-gold rounded-lg w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 px-6 border-b border-border-gold-soft flex justify-between items-center bg-dark-2/40">
              <h2 className="font-cinzel text-sm text-white font-semibold">
                Send {msgChannel === 'email' ? 'Email' : 'SMS'} to {selectedBooking.name}
              </h2>
              <button 
                onClick={() => setShowMsgModal(false)}
                className="w-8 h-8 bg-dark-4 border border-border-gold-soft rounded flex items-center justify-center cursor-pointer text-text-muted hover:border-danger hover:text-danger transition-colors text-xs"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSendMsgSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">Recipient</label>
                <input
                  type="text"
                  disabled
                  value={msgChannel === 'email' ? selectedBooking.email : selectedBooking.phone}
                  className="w-full bg-dark-4 border border-border-gold-soft rounded p-2.5 text-xs text-text-muted outline-none"
                />
              </div>

              {msgChannel === 'email' && (
                <div>
                  <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter email subject…"
                    value={msgSubject}
                    onChange={(e) => setMsgSubject(e.target.value)}
                    className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              )}

              {/* Quick Templates Bar */}
              <div>
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1.5 font-medium">Quick Templates</label>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyMsgTemplate('welcome')}
                    className="bg-transparent border border-border-gold-soft hover:border-gold hover:text-gold text-[9px] font-semibold py-1.5 px-3 rounded cursor-pointer transition-colors"
                  >
                    Welcome Info
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMsgTemplate('checkout')}
                    className="bg-transparent border border-border-gold-soft hover:border-gold hover:text-gold text-[9px] font-semibold py-1.5 px-3 rounded cursor-pointer transition-colors"
                  >
                    Check-out Reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMsgTemplate('payment')}
                    className="bg-transparent border border-border-gold-soft hover:border-gold hover:text-gold text-[9px] font-semibold py-1.5 px-3 rounded cursor-pointer transition-colors"
                  >
                    Payment Inquiry
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-[1.5px] uppercase text-text-muted block mb-1">Message Content</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Type your message here…"
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  className="w-full bg-dark-4 border border-border-gold rounded p-2.5 text-xs text-white outline-none focus:border-gold resize-none h-40"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3.5 border-t border-border-gold-soft/50">
                <button 
                  type="button"
                  onClick={() => setShowMsgModal(false)}
                  className="bg-transparent border border-border-gold hover:border-gold hover:text-gold text-text-muted text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-5 rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={sendingMsg}
                  className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-5 rounded transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {sendingMsg ? (
                    <>
                      <i className="fas fa-spinner fa-spin animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane" /> Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;

