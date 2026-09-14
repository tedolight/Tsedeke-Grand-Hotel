import React from 'react';

const StatsCard = ({ label, value, icon, trend, trendUp = true, barPercent, color = 'text-gold' }) => (
  <div className="bg-dark-3 border border-border-gold-soft hover:border-border-gold rounded-lg p-5 px-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-[40px] h-[40px] bg-gold-glow border border-border-gold rounded-lg flex items-center justify-center ${color}`}>
        <i className={`${icon} text-base`} />
      </div>
      {trend && (
        <span className={`text-[10px] font-bold py-1 px-2.5 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
      )}
    </div>
    <div className="font-cinzel text-3xl text-white font-semibold mb-1 leading-none">{value}</div>
    <div className="text-[11px] text-text-muted tracking-[1px] uppercase font-semibold">{label}</div>
    {barPercent !== undefined && (
      <div className="mt-4 h-[3px] bg-dark-5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-1000"
          style={{ width: `${barPercent}%` }}
        />
      </div>
    )}
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
  </div>
);

export default StatsCard;
