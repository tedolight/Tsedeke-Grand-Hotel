import React, { useState, useMemo } from 'react';

const MOCK_BOOKINGS = [
  { id: '#AH-20241', name: 'Abebe Tadesse', room: 'Royal Suite 101', checkIn: '2026-06-01', checkOut: '2026-06-04', status: 'Checked In', color: 'border-gold text-gold bg-gold-glow' },
  { id: '#AH-20240', name: 'Sara Bekele', room: 'Deluxe Room 204', checkIn: '2026-06-02', checkOut: '2026-06-05', status: 'Confirmed', color: 'border-success text-success bg-success/10' },
  { id: '#AH-20239', name: 'Mohammed Hassen', room: 'Executive Suite 305', checkIn: '2026-06-03', checkOut: '2026-06-07', status: 'Confirmed', color: 'border-success text-success bg-success/10' },
  { id: '#AH-20238', name: 'Liya Mekonnen', room: 'Standard 112', checkIn: '2026-06-04', checkOut: '2026-06-06', status: 'Pending', color: 'border-warning text-warning bg-warning/10' },
  { id: '#AH-20237', name: 'James Smith', room: 'Deluxe 204', checkIn: '2026-06-01', checkOut: '2026-06-05', status: 'Checked In', color: 'border-success text-success bg-success/10' },
  { id: '#AH-20236', name: 'Amina Ali', room: 'Suite 301', checkIn: '2026-05-30', checkOut: '2026-06-02', status: 'Checked In', color: 'border-success text-success bg-success/10' },
  { id: '#AH-20235', name: 'Hana Worku', room: 'Standard 103', checkIn: '2026-05-28', checkOut: '2026-06-01', status: 'Checked Out', color: 'border-gold text-gold bg-gold-glow/50' }
];

const BookingCalendar = ({ bookings = MOCK_BOOKINGS, onSelectBooking }) => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed)

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Prev month offset days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: currentMonth === 0 ? 11 : currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
      });
    }

    // Next month offset days
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        month: currentMonth === 11 ? 0 : currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getBookingsForDay = (dayObj) => {
    const dateStr = `${dayObj.year}-${String(dayObj.month + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
    return bookings.filter(b => {
      return dateStr >= b.checkIn && dateStr < b.checkOut && b.status !== 'Cancelled';
    });
  };

  return (
    <div className="bg-dark-3 border border-border-gold-soft rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-border-gold-soft pb-4">
        <h3 className="font-cinzel text-lg text-white font-semibold flex items-center gap-2">
          <i className="fas fa-calendar-alt text-gold" />
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 bg-dark-4 border border-border-gold hover:border-gold hover:text-gold rounded flex items-center justify-center cursor-pointer text-text-muted text-xs transition-colors"
          >
            <i className="fas fa-chevron-left" />
          </button>
          <button
            onClick={() => { setCurrentYear(2026); setCurrentMonth(5); }}
            className="bg-dark-4 border border-border-gold hover:border-gold text-gold text-[10px] tracking-[1px] uppercase font-semibold py-1 px-4 rounded transition-colors flex items-center justify-center cursor-pointer"
          >
            TODAY
          </button>
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 bg-dark-4 border border-border-gold hover:border-gold hover:text-gold rounded flex items-center justify-center cursor-pointer text-text-muted text-xs transition-colors"
          >
            <i className="fas fa-chevron-right" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-[10px] tracking-[1.5px] uppercase font-bold text-text-muted py-2 bg-dark-2/40 border border-border-gold-soft/35">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayObj, index) => {
          const dayBookings = getBookingsForDay(dayObj);
          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border border-border-gold-soft bg-dark-2/20 flex flex-col justify-between transition-colors hover:bg-dark-4/40 ${
                dayObj.isCurrentMonth ? 'text-white' : 'text-text-muted/40'
              }`}
            >
              <span className="text-xs font-semibold self-end">{dayObj.day}</span>
              
              <div className="space-y-1 mt-2 flex-grow overflow-y-auto max-h-[70px]">
                {dayBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => onSelectBooking?.(b)}
                    className={`p-1 px-1.5 rounded text-[9px] truncate font-medium border cursor-pointer hover:brightness-110 transition-all ${
                      b.status === 'Checked In' ? 'border-info/20 text-info bg-info/10' :
                      b.status === 'Confirmed' ? 'border-success/20 text-success bg-success/10' :
                      b.status === 'Pending' ? 'border-warning/20 text-warning bg-warning/10' :
                      'border-gold/20 text-gold bg-gold-glow'
                    }`}
                    title={`${b.name} - ${b.room}`}
                  >
                    {b.name.split(' ')[0]} ({b.room.split(' ')[0]})
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 text-[10px] text-text-muted justify-center border-t border-border-gold-soft pt-4 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success" /> Confirmed</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-info" /> Checked In</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning" /> Pending</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gold" /> Checked Out</span>
      </div>
    </div>
  );
};

export default BookingCalendar;
