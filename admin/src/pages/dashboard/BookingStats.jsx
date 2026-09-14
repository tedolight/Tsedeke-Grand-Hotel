import React from 'react';

const BookingStats = ({ stats }) => {
  const defaultStats = stats || {
    occupancyRate: '78%',
    roomsBooked: '38 / 47',
    revenueMtd: 'ETB 145.2K',
    pendingBookings: '14',
    growth: '+12.4%',
    occupancyChange: '+2.4%'
  };

  const statItems = [
    { label: 'Occupancy Rate', value: defaultStats.occupancyRate, icon: 'fas fa-door-open', color: 'text-gold', trend: defaultStats.occupancyChange, up: true, bar: 78 },
    { label: 'Rooms Booked', value: defaultStats.roomsBooked, icon: 'fas fa-bed', color: 'text-info', trend: '90% Cap', up: true, bar: 81 },
    { label: 'Revenue (MTD)', value: defaultStats.revenueMtd, icon: 'fas fa-wallet', color: 'text-success', trend: defaultStats.growth, up: true, bar: 70 },
    { label: 'Pending Bookings', value: defaultStats.pendingBookings, icon: 'fas fa-clock', color: 'text-warning', trend: '5 Urgent', up: false, bar: 45 }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((kpi, idx) => (
        <div key={idx} className="bg-dark-3 border border-border-gold-soft hover:border-border-gold rounded-lg p-5 px-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-[40px] h-[40px] bg-gold-glow border border-border-gold rounded-lg flex items-center justify-center text-gold">
              <i className={`${kpi.icon} text-base`} />
            </div>
            <span className={`text-[10px] font-bold p-1 px-2.5 rounded-full ${kpi.up ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
              {kpi.up ? '↑' : '↓'} {kpi.trend}
            </span>
          </div>
          <div className="font-cinzel text-3xl text-white font-semibold mb-1 leading-none">{kpi.value}</div>
          <div className="text-[11px] text-text-muted tracking-[1px] uppercase font-semibold">{kpi.label}</div>
          
          <div className="mt-4 h-[3px] bg-dark-5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-1000" 
              style={{ width: `${kpi.bar}%` }}
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
      ))}
    </div>
  );
};

export default BookingStats;
