import React, { useState } from 'react';

const DEFAULT_BOOKING = {
  id: '#AH-20241',
  name: 'Abebe Tadesse',
  phone: '+251 911 234 567',
  email: 'a.tadesse@outlook.com',
  room: 'Royal Suite 101',
  checkIn: '2026-06-01',
  checkOut: '2026-06-04',
  nights: 3,
  amount: 12600,
  status: 'Checked In',
  initials: 'AT',
  notes: 'VIP returning guest — greeted with complimentary coffee ceremony on arrival.',
  nationality: 'Ethiopian',
  passport: 'ET-1234567',
  visits: '3rd Visit ✦',
  rate: 3800,
  deposit: 5000,
  paid: 12600,
  paymentMethod: 'Cash'
};

const BookingDetail = ({ booking = DEFAULT_BOOKING, onBack, onUpdateStatus }) => {
  const [currentBooking, setCurrentBooking] = useState(booking);
  const [newStaffNote, setNewStaffNote] = useState('');

  const handleUpdateStatusLocal = (status) => {
    const updated = { ...currentBooking, status };
    setCurrentBooking(updated);
    onUpdateStatus?.(currentBooking.id, status);
  };

  const handleAddStaffNote = () => {
    if (!newStaffNote) return;
    const updatedNotes = currentBooking.notes 
      ? `${currentBooking.notes}\n\n— Staff note: ${newStaffNote}` 
      : `— Staff note: ${newStaffNote}`;
    setCurrentBooking(prev => ({ ...prev, notes: updatedNotes }));
    setNewStaffNote('');
  };

  return (
    <div className="space-y-6 font-montserrat">
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="bg-transparent border border-border-gold hover:border-gold hover:text-gold text-text-muted text-[10px] tracking-[1.5px] uppercase font-semibold py-1.5 px-3.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
          >
            <i className="fas fa-arrow-left" /> Back
          </button>
        )}
        <div>
          <h2 className="font-cinzel text-lg text-white font-semibold">Booking Detail</h2>
          <p className="text-[10px] text-text-muted tracking-[0.5px]">Full reservation overview</p>
        </div>
      </div>

      <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="font-cinzel text-xl text-gold font-semibold mb-1">{currentBooking.id}</div>
          <div className="text-[11px] text-text-muted flex flex-wrap gap-4">
            <span className="flex items-center gap-1"><i className="fas fa-calendar text-gold" /> Booked Jun 01, 2026 at 09:14 AM</span>
            <span className="flex items-center gap-1"><i className="fas fa-globe" /> Online — Website</span>
          </div>
        </div>
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className={`text-[11px] font-bold p-1.5 px-3.5 rounded-full ${
            currentBooking.status === 'Checked In' ? 'bg-info/10 text-info border border-info/20' :
            currentBooking.status === 'Confirmed' ? 'bg-success/10 text-success border border-success/20' :
            currentBooking.status === 'Pending' ? 'bg-warning/10 text-warning border border-warning/20' :
            currentBooking.status === 'Checked Out' ? 'bg-gold-glow text-gold border border-gold/20' :
            'bg-danger/10 text-danger border border-danger/20'
          }`}>
            ✦ {currentBooking.status}
          </span>
          <div className="flex gap-2">
            <button className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1 cursor-pointer">
              <i className="fas fa-print" /> Print
            </button>
            {currentBooking.status === 'Confirmed' && (
              <button 
                onClick={() => handleUpdateStatusLocal('Checked In')}
                className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                Check In
              </button>
            )}
            {currentBooking.status === 'Checked In' && (
              <button 
                onClick={() => handleUpdateStatusLocal('Checked Out')}
                className="bg-gold hover:bg-gold-light text-black text-[10px] tracking-[1.5px] uppercase font-semibold py-2 px-4 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
              <div className="font-cinzel text-xs text-gold tracking-[1px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5">
                <i className="fas fa-user" /> Guest Information
              </div>
              <div className="space-y-2">
                {[
                  { key: 'Full Name', val: currentBooking.name },
                  { key: 'Phone', val: currentBooking.phone },
                  { key: 'Email', val: currentBooking.email },
                  { key: 'Nationality', val: currentBooking.nationality },
                  { key: 'National ID / FAN', val: currentBooking.nationalId || currentBooking.passport || '—' },
                  { key: 'Visits', val: currentBooking.visits, highlight: true }
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-border-gold-soft last:border-0">
                    <span className="text-text-muted">{row.key}</span>
                    <span className={`font-medium ${row.highlight ? 'text-gold font-cinzel font-semibold' : 'text-white'}`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
              <div className="font-cinzel text-xs text-gold tracking-[1px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5">
                <i className="fas fa-bed" /> Room Details
              </div>
              <div className="space-y-2">
                {[
                  { key: 'Room', val: currentBooking.room, highlight: true },
                  { key: 'Floor', val: '1st Floor' },
                  { key: 'Bed Type', val: 'King Bed' },
                  { key: 'Guests', val: '2 Adults, 0 Children' },
                  { key: 'Check-in', val: `${currentBooking.checkIn} — 02:00 PM` },
                  { key: 'Check-out', val: `${currentBooking.checkOut} — 12:00 PM` }
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-border-gold-soft last:border-0">
                    <span className="text-text-muted">{row.key}</span>
                    <span className={`font-medium ${row.highlight ? 'text-gold font-cinzel font-semibold' : 'text-white'}`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
            <div className="font-cinzel text-xs text-gold tracking-[1px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5">
              <i className="fas fa-receipt" /> Price Breakdown
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">Room Rate (per night)</span><span className="text-white">{(currentBooking.rate || 0).toLocaleString()} ETB</span></div>
                <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">× {currentBooking.nights || 1} Nights</span><span className="text-white">{((currentBooking.rate || 0) * (currentBooking.nights || 1)).toLocaleString()} ETB</span></div>
                <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">Service Charge (10%)</span><span className="text-white">{Math.round((currentBooking.rate || 0) * (currentBooking.nights || 1) * 0.1).toLocaleString()} ETB</span></div>
                <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">VAT (15%)</span><span className="text-white">{Math.round((currentBooking.rate || 0) * (currentBooking.nights || 1) * 0.15).toLocaleString()} ETB</span></div>
                <div className="flex justify-between text-xs pt-3 border-t border-border-gold font-semibold">
                  <span className="text-white">TOTAL</span>
                  <span className="text-gold font-cinzel text-sm">{(currentBooking.amount || 0).toLocaleString()} ETB</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">Payment Method</span><span className="text-white">{currentBooking.paymentMethod}</span></div>
                <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">Amount Paid</span><span className="text-success font-semibold">{(currentBooking.paid || 0).toLocaleString()} ETB</span></div>
                <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">Balance Due</span><span className="text-warning font-semibold">{((currentBooking.amount || 0) - (currentBooking.paid || 0)).toLocaleString()} ETB</span></div>
                <div className="flex justify-between text-xs py-1.5"><span className="text-text-muted">Deposit</span><span className="text-white">{(currentBooking.deposit || 0).toLocaleString()} ETB</span></div>
              </div>
            </div>
          </div>

          <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
            <div className="font-cinzel text-xs text-gold tracking-[1px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5">
              <i className="fas fa-concierge-bell" /> Add-ons & Special Requests
            </div>
            <div className="flex gap-2 flex-wrap mb-4">
              <span className="bg-gold-glow border border-border-gold text-gold text-[10px] py-1 px-3.5 rounded-full flex items-center gap-1"><i className="fas fa-car" /> Airport Transfer</span>
              <span className="bg-gold-glow border border-border-gold text-gold text-[10px] py-1 px-3.5 rounded-full flex items-center gap-1"><i className="fas fa-birthday-cake" /> Birthday Cake</span>
            </div>
            <div className="bg-dark-4 border border-border-gold-soft rounded p-3.5 text-xs text-text-muted leading-relaxed italic">
              "{currentBooking.notes || 'No special guest requests recorded for this stay.'}"
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-5">
            <div className="font-cinzel text-xs text-gold tracking-[1px] uppercase border-b border-border-gold-soft pb-2.5 mb-4 flex items-center gap-1.5">
              <i className="fas fa-stream" /> Booking Timeline
            </div>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-1 before:bottom-1 before:w-[1px] before:bg-border-gold">
              {[
                { title: 'Booking Created', time: 'Jun 01, 2026 · 09:14 AM', done: true },
                { title: 'Payment Received', time: 'Jun 01, 2026 · 09:20 AM', done: true },
                { title: 'Confirmation Sent', time: 'Jun 01, 2026 · 09:21 AM', done: true },
                { title: 'Checked In', time: 'Jun 01, 2026 · 02:00 PM', active: currentBooking.status === 'Checked In' || currentBooking.status === 'Checked Out', done: currentBooking.status === 'Checked Out' },
                { title: 'Check-out (Pending)', time: 'Jun 04, 2026 · 12:00 PM', grey: currentBooking.status !== 'Checked Out', active: currentBooking.status === 'Checked Out' }
              ].map((item, i) => (
                <div key={i} className="relative">
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
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
