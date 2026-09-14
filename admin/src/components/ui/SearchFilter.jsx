import React from 'react';

const SearchFilter = ({ value, onChange, placeholder = 'Search...', children, onExport }) => (
  <div className="flex flex-col md:flex-row justify-between items-center gap-2.5 bg-dark-3 border border-border-gold-soft p-3 rounded-lg">
    <div className="relative w-full md:w-80">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-dark-4 border border-border-gold rounded p-2 pl-9 text-xs text-white outline-none focus:border-gold transition-colors"
      />
      <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
    </div>
    <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end items-center">
      {children}
      {onExport && (
        <button
          onClick={onExport}
          className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-[10px] tracking-[1px] uppercase font-semibold py-2 px-3 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fas fa-file-export" /> Export
        </button>
      )}
    </div>
  </div>
);

export default SearchFilter;
