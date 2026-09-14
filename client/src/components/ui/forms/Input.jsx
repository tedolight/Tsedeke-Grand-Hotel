import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, id, error, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label htmlFor={id} className="text-[9px] tracking-[3px] uppercase text-gold font-montserrat">
        {label}
      </label>
    )}
    <input
      id={id}
      ref={ref}
      className={`bg-dark-3 border ${error ? 'border-red-500/50' : 'border-border-gold/25'} text-white font-montserrat text-[13px] px-4 py-3 outline-none focus:border-gold w-full transition-colors duration-200 placeholder:text-white-dim/30 ${className}`}
      {...props}
    />
    {error && <span className="text-[11px] text-red-400 font-montserrat">{error}</span>}
  </div>
));

Input.displayName = 'Input';
export default Input;
