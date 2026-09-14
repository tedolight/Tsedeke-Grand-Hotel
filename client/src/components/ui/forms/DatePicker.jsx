import React from 'react';

const DatePicker = ({ label, id, value, onChange, min, max, error, className = '' }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label htmlFor={id} className="text-[9px] tracking-[3px] uppercase text-gold font-montserrat">
        {label}
      </label>
    )}
    <input
      id={id}
      type="date"
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      className={`bg-dark-3 border ${error ? 'border-red-500/50' : 'border-border-gold/25'} text-white font-montserrat text-[13px] px-4 py-3 outline-none focus:border-gold w-full transition-colors duration-200 ${className}`}
    />
    {error && <span className="text-[11px] text-red-400 font-montserrat">{error}</span>}
  </div>
);

export default DatePicker;
