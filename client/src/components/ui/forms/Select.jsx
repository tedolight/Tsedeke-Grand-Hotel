import React, { forwardRef } from 'react';

const Select = forwardRef(({ label, id, options = [], error, className = '', placeholder, ...props }, ref) => (
  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label htmlFor={id} className="text-[9px] tracking-[3px] uppercase text-gold font-montserrat">
        {label}
      </label>
    )}
    <select
      id={id}
      ref={ref}
      className={`bg-dark-3 border ${error ? 'border-red-500/50' : 'border-border-gold/25'} text-white-dim font-montserrat text-[13px] px-4 py-3 outline-none focus:border-gold w-full transition-colors duration-200 ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
    {error && <span className="text-[11px] text-red-400 font-montserrat">{error}</span>}
  </div>
));

Select.displayName = 'Select';
export default Select;
