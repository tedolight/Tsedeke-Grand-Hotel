import React from 'react';

const RevenueChart = () => {
  const revenueChartData = [
    { day: 'MON', val: 18500, height: '42%' },
    { day: 'TUE', val: 24000, height: '58%' },
    { day: 'WED', val: 32000, height: '74%' },
    { day: 'THU', val: 28500, height: '65%' },
    { day: 'FRI', val: 41000, height: '90%' },
    { day: 'SAT', val: 46000, height: '100%' },
    { day: 'SUN', val: 38000, height: '84%' }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="xl:col-span-2 bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border-gold-soft flex items-center justify-between">
          <div>
            <h3 className="font-cinzel text-xs text-white tracking-[1px] font-semibold">Weekly Revenue Breakdown</h3>
            <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-[0.5px]">Daily sales representation for the current week</p>
          </div>
          <span className="text-[11px] text-gold font-semibold">Total: ETB 229,000</span>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-end">
          <div className="flex items-end gap-3.5 h-[180px] pb-7 relative">
            <div className="absolute left-0 right-0 bottom-7 border-b border-border-gold-soft pointer-events-none" />
            <div className="absolute left-0 right-0 top-[40px] border-b border-border-gold-soft/30 border-dashed pointer-events-none" />
            <div className="absolute left-0 right-0 top-[90px] border-b border-border-gold-soft/30 border-dashed pointer-events-none" />
            
            {revenueChartData.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group/bar relative">
                <span className="absolute top-[-22px] bg-dark-4 border border-border-gold rounded p-1 px-1.5 text-[9px] text-gold font-semibold opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 z-10 font-mono">
                  {(item.val || 0).toLocaleString()}
                </span>
                
                <div 
                  className="w-full bg-gradient-to-t from-gold-dark to-gold rounded-t hover:opacity-85 transition-opacity duration-200 shrink-0 relative"
                  style={{ height: item.height }}
                />
                
                <span className="text-[9px] text-text-muted tracking-[0.5px] font-semibold">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border-gold-soft">
          <h3 className="font-cinzel text-xs text-white tracking-[1px] font-semibold">Occupancy Split</h3>
          <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-[0.5px]">Room status ratios</p>
        </div>
        <div className="p-5 flex-grow flex flex-col justify-center items-center gap-6">
          <div 
            className="w-[124px] h-[124px] rounded-full flex items-center justify-center relative shrink-0"
            style={{
              background: 'conic-gradient(var(--color-gold) 0% 78%, var(--color-gold-dark) 78% 83%, var(--color-dark-5) 83% 100%)'
            }}
          >
            <div className="absolute inset-[18px] bg-dark-3 rounded-full flex flex-col items-center justify-center">
              <span className="font-cinzel text-2xl text-gold font-semibold leading-none mb-0.5">78%</span>
              <span className="text-[8px] text-text-muted uppercase tracking-[1px]">Occupied</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 text-center border-t border-border-gold-soft pt-4">
            <div>
              <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block mr-1.5" />
              <span className="text-[9px] text-text-muted uppercase tracking-[0.5px] font-semibold">Booked</span>
              <div className="text-[13px] text-white font-medium mt-0.5">78%</div>
            </div>
            <div>
              <span className="w-2.5 h-2.5 rounded-full bg-gold-dark inline-block mr-1.5" />
              <span className="text-[9px] text-text-muted uppercase tracking-[0.5px] font-semibold">Maint</span>
              <div className="text-[13px] text-white font-medium mt-0.5">5%</div>
            </div>
            <div>
              <span className="w-2.5 h-2.5 rounded-full bg-dark-5 inline-block mr-1.5" />
              <span className="text-[9px] text-text-muted uppercase tracking-[0.5px] font-semibold">Free</span>
              <div className="text-[13px] text-white font-medium mt-0.5">17%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
