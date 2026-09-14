import React, { forwardRef } from 'react';

const Textarea = forwardRef(({ label, id, error, rows = 4, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label htmlFor={id} className="text-[9px] tracking-[3px] uppercase text-gold font-montserrat">
        {label}
      </label>
    )}
    <textarea
      id={id}
      ref={ref}
      rows={rows}
      className={`bg-dark-3 border ${error ? 'border-red-500/50' : 'border-border-gold/25'} text-white font-montserrat text-[13px] px-4 py-3 outline-none focus:border-gold w-full resize-vertical transition-colors duration-200 placeholder:text-white-dim/30 ${className}`}
      {...props}
    />
    {error && <span className="text-[11px] text-red-400 font-montserrat">{error}</span>}
  </div>
));

Textarea.displayName = 'Textarea';
export default Textarea;
