import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/auth/authStore.js';
import dashboardService from '../../services/dashboard/dashboardService.js';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState('This Week');
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [occupancy, setOccupancy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsRes = await dashboardService.getStats();
        const revenueRes = await dashboardService.getRevenue(
          selectedRange === 'Today' ? 'today' : selectedRange === 'This Month' ? 'month' : 'week'
        );
        const occupancyRes = await dashboardService.getOccupancy();

        setStats(statsRes.data || statsRes);
        setRevenue(revenueRes.data || revenueRes);
        setOccupancy(occupancyRes.data || occupancyRes);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedRange]);

  // Export report as CSV
  const handleExportReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Occupancy Rate', stats?.occupancyRate || '0%'],
      ['Rooms Booked', stats?.roomsBooked || '0 / 0'],
      ['Revenue (MTD)', stats?.revenueMtd || 'ETB 0.0K'],
      ['Pending Bookings', stats?.pendingBookings || '0'],
      ['Period', selectedRange],
      ['Exported At', new Date().toLocaleString()],
    ];
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tsedeke-grand-dashboard-${selectedRange.replace(/ /g, '-').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fallback / default data
  const recentBookings = stats?.recentBookings || [];
  const liveActivities = stats?.liveActivities || [];
  const revenueChartData = revenue?.chartData || [];

  return (
    <div className="space-y-8 font-montserrat">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-gold-soft pb-6">
        <div>
          <h1 className="font-cinzel text-2xl text-[color:var(--text)] tracking-[1px] font-semibold mb-1">DASHBOARD OVERVIEW</h1>
          <p className="text-xs text-text-muted tracking-[1px] font-semibold">REAL-TIME OPERATIONAL AND BUSINESS STATISTICS</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedRange} 
            onChange={(e) => setSelectedRange(e.target.value)}
            className="bg-dark-3 border border-border-gold text-[color:var(--text)] font-semibold p-2.5 px-4 outline-none text-xs rounded-md cursor-pointer hover:border-gold transition-colors"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
          <button 
            onClick={handleExportReport}
            className="btn-3d-gold text-xs font-bold tracking-[1px] p-2.5 px-5 rounded-md flex items-center gap-2 cursor-pointer select-none"
          >
            <i className="fas fa-file-export" />
            <span>EXPORT REPORT</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Occupancy Rate', value: stats?.occupancyRate || '0%', icon: 'fas fa-door-open', trend: stats?.occupancyRate || '0%', up: true, bar: stats?.occupancyVal || 0 },
          { label: 'Rooms Booked', value: stats?.roomsBooked || '0 / 0', icon: 'fas fa-bed', trend: 'Capacity', up: true, bar: stats?.roomsVal || 0 },
          { label: 'Revenue (MTD)', value: stats?.revenueMtd || 'ETB 0.0K', icon: 'fas fa-wallet', trend: 'Monthly', up: true, bar: stats?.revenueVal || 0 },
          { label: 'Pending Bookings', value: stats?.pendingBookings || '0', icon: 'fas fa-clock', trend: 'Urgent', up: false, bar: stats?.pendingVal || 0 }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-dark-3 border border-border-gold-soft hover:border-border-gold rounded-lg p-5 px-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-[40px] h-[40px] bg-gold-glow border border-border-gold rounded-lg flex items-center justify-center text-gold">
                <i className={`${kpi.icon} text-base`} />
              </div>
              <span className={`text-[10px] font-bold p-1 px-2.5 rounded-full ${kpi.up ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                {kpi.trend}
              </span>
            </div>
            <div className="font-cinzel text-3xl text-[color:var(--text)] font-semibold mb-1 leading-none">{kpi.value}</div>
            <div className="text-[11px] text-text-muted tracking-[1px] uppercase font-semibold">{kpi.label}</div>
            
            {/* Progress bar */}
            <div className="mt-4 h-[3px] bg-dark-5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-1000" 
                style={{ width: `${kpi.bar}%` }}
              />
            </div>

            {/* Bottom hover bar indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Weekly Revenue CSS Chart */}
        <div className="xl:col-span-2 bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border-gold-soft flex items-center justify-between">
            <div>
              <h3 className="font-cinzel text-xs text-[color:var(--text)] tracking-[1px] font-semibold">Weekly Revenue Breakdown</h3>
              <p className="text-[10px] text-text-muted font-semibold mt-0.5 uppercase tracking-[0.5px]">Daily sales representation for the current week</p>
            </div>
            <span className="text-[11px] text-gold font-semibold">Total: ETB {(revenue?.totalRevenue || 0).toLocaleString()}</span>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-end">
            <div className="flex items-end gap-3.5 h-[180px] pb-7 relative">
              
              {/* Y Axis Guide lines */}
              <div className="absolute left-0 right-0 bottom-7 border-b border-border-gold-soft pointer-events-none" />
              <div className="absolute left-0 right-0 top-[40px] border-b border-border-gold-soft/30 border-dashed pointer-events-none" />
              <div className="absolute left-0 right-0 top-[90px] border-b border-border-gold-soft/30 border-dashed pointer-events-none" />
              
              {revenueChartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-text-muted text-xs">
                  No revenue data available
                </div>
              ) : (
                revenueChartData.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group/bar relative">
                    {/* Floating tooltip */}
                    <span className="absolute top-[-22px] bg-dark-4 border border-border-gold rounded p-1 px-1.5 text-[9px] text-gold font-semibold opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 z-10">
                      {(item.val || 0).toLocaleString()}
                    </span>
                    
                    {/* CSS Bar */}
                    <div 
                      className="w-full rounded-t shrink-0 relative hover:brightness-110 transition-all duration-200"
                      style={{
                        height: item.height || '20px',
                        background: 'linear-gradient(to top, #9A7530, #C9A84C)',
                        boxShadow: [
                          '4px 0 0 0 #5a4510',   /* right face — dark gold */
                          '0 4px 0 0 #2a1f08',   /* bottom face — near black */
                          '4px 4px 0 0 #1a1000', /* corner anchor */
                          'inset 2px 0 0 0 rgba(255,220,100,0.25)', /* left highlight */
                        ].join(', '),
                        transform: 'translate(-2px, -2px)', /* lift to show shadow faces */
                      }}
                    />
                    
                    {/* Label */}
                    <span className="text-[9px] text-text-muted tracking-[0.5px] font-semibold">{item.day}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Occupancy Donut Chart */}
        <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border-gold-soft">
            <h3 className="font-cinzel text-xs text-[color:var(--text)] tracking-[1px] font-semibold">Occupancy Split</h3>
            <p className="text-[10px] text-text-muted font-semibold mt-0.5 uppercase tracking-[0.5px]">Room status ratios</p>
          </div>
          <div className="p-5 flex-grow flex flex-col justify-center items-center gap-6">
            
            {/* CSS Conic-Gradient Donut */}
            <div 
              className="w-[124px] h-[124px] rounded-full flex items-center justify-center relative shrink-0"
              style={{
                background: `conic-gradient(var(--color-gold) 0% ${occupancy?.occupied || 0}%, var(--color-gold-dark) ${occupancy?.occupied || 0}% ${(occupancy?.occupied || 0) + (occupancy?.maintenance || 0)}%, var(--color-dark-5) ${(occupancy?.occupied || 0) + (occupancy?.maintenance || 0)}% 100%)`
              }}
            >
              <div className="absolute inset-[18px] bg-dark-3 rounded-full flex flex-col items-center justify-center">
                <span className="font-cinzel text-2xl text-gold font-semibold leading-none mb-0.5">{occupancy?.occupied || 0}%</span>
                <span className="text-[8px] text-text-muted uppercase tracking-[1px]">Occupied</span>
              </div>
            </div>

            {/* Legends */}
            <div className="w-full grid grid-cols-3 gap-2 text-center border-t border-border-gold-soft pt-4">
              <div>
                <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block mr-1.5" />
                <span className="text-[9px] text-text-muted uppercase tracking-[0.5px] font-semibold">Booked</span>
                <div className="text-[13px] text-[color:var(--text)] font-semibold mt-0.5">{occupancy?.occupied || 0}%</div>
              </div>
              <div>
                <span className="w-2.5 h-2.5 rounded-full bg-gold-dark inline-block mr-1.5" />
                <span className="text-[9px] text-text-muted uppercase tracking-[0.5px] font-semibold">Maint</span>
                <div className="text-[13px] text-[color:var(--text)] font-semibold mt-0.5">{occupancy?.maintenance || 0}%</div>
              </div>
              <div>
                <span className="w-2.5 h-2.5 rounded-full bg-dark-5 inline-block mr-1.5" />
                <span className="text-[9px] text-text-muted uppercase tracking-[0.5px] font-semibold">Free</span>
                <div className="text-[13px] text-[color:var(--text)] font-semibold mt-0.5">{occupancy?.free || 0}%</div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Tables & Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Bookings Table */}
        <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border-gold-soft flex items-center justify-between">
            <div>
              <h3 className="font-cinzel text-xs text-[color:var(--text)] tracking-[1px] font-semibold">Recent Registrations</h3>
              <p className="text-[10px] text-text-muted font-semibold mt-0.5 uppercase tracking-[0.5px]">Upcoming and live check-ins</p>
            </div>
            <button 
              onClick={() => navigate('/bookings')}
              className="text-[10px] text-gold hover:text-gold-light uppercase tracking-[1px] font-semibold cursor-pointer"
            >
              View All →
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-gold-soft">
                  <th className="text-[9px] text-text-muted uppercase tracking-[1.5px] px-4 py-3 font-semibold">Guest</th>
                  <th className="text-[9px] text-text-muted uppercase tracking-[1.5px] px-4 py-3 font-semibold">Room</th>
                  <th className="text-[9px] text-text-muted uppercase tracking-[1.5px] px-4 py-3 font-semibold">Status</th>
                  <th className="text-[9px] text-text-muted uppercase tracking-[1.5px] px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-text-muted text-xs">
                      No recent bookings found. 
                      <button onClick={() => navigate('/bookings')} className="ml-2 text-gold hover:underline">Go to Bookings</button>
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr 
                      key={b.id} 
                      className="border-b border-border-gold-soft/50 last:border-0 hover:bg-dark-4 transition-colors cursor-pointer"
                      onClick={() => navigate('/bookings')}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-[30px] h-[30px] bg-dark-5 rounded-full flex items-center justify-center text-[10px] font-cinzel text-gold font-bold shrink-0">
                            {b.initials || (b.name ? b.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?')}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] text-[color:var(--text)] font-semibold">{b.name}</span>
                            <span className="text-[9px] text-text-muted font-semibold">{b.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[color:var(--text)] font-semibold">{b.room}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-bold p-1 px-2.5 rounded-full ${
                          b.status === 'Confirmed' ? 'bg-success/10 text-success' : 
                          b.status === 'Pending' ? 'bg-warning/10 text-warning' : 
                          'bg-danger/10 text-danger'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate('/bookings'); }}
                            className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                            title="View Booking"
                          >
                            <i className="fas fa-eye" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate('/bookings'); }}
                            className="w-7 h-7 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted rounded flex items-center justify-center cursor-pointer text-[10px] transition-colors"
                            title="Edit Booking"
                          >
                            <i className="fas fa-edit" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity timeline */}
        <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border-gold-soft flex items-center justify-between">
            <div>
              <h3 className="font-cinzel text-xs text-[color:var(--text)] tracking-[1px] font-semibold">Live Operational Feed</h3>
              <p className="text-[10px] text-text-muted font-semibold mt-0.5 uppercase tracking-[0.5px]">Real-time system events</p>
            </div>
            <div className="w-2.5 h-2.5 bg-success rounded-full animate-ping shadow-[0_0_8px_rgba(76,175,138,0.5)]" />
          </div>
          <div className="p-5 flex-1 divide-y divide-border-gold-soft/50">
            {liveActivities.length === 0 ? (
              <div className="py-8 text-center text-text-muted text-xs">
                No recent activities. System is running smoothly.
              </div>
            ) : (
              liveActivities.map((act, i) => (
                <div key={i} className="flex gap-3.5 py-3 first:pt-0 last:pb-0">
                  <div className={`w-[32px] h-[32px] rounded-full border flex items-center justify-center shrink-0 ${act.color}`}>
                    <i className={`${act.icon} text-xs`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-[color:var(--text)] font-semibold leading-snug">{act.text}</span>
                    <span className="text-[9px] text-text-muted mt-0.5 font-semibold">{act.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
