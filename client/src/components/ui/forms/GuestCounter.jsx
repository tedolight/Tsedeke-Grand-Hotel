import React from 'react';

const GuestCounter = ({ value = 1, onChange, min = 1, max = 6, label = 'Guests' }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[9px] tracking-[3px] uppercase text-gold font-montserrat">{label}</span>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-9 h-9 bg-dark-3 border border-border-gold/25 text-gold hover:bg-gold hover:text-black transition-colors disabled:opacity-30 font-cormorant text-xl"
      >
        −
      </button>
      <span className="font-cormorant text-2xl text-white min-w-[2rem] text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-9 h-9 bg-dark-3 border border-border-gold/25 text-gold hover:bg-gold hover:text-black transition-colors disabled:opacity-30 font-cormorant text-xl"
      >
        +
      </button>
      <span className="text-[11px] text-white-dim font-montserrat">
        {value === 1 ? 'Guest' : 'Guests'}
      </span>
    </div>
  </div>
);

export default GuestCounter;
