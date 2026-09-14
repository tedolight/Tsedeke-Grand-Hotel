import { useTranslation } from 'react-i18next';
import React from 'react';

const TYPES = ['all', 'standard', 'deluxe', 'suite', 'vip'];
const SORTS = ['Price: Low to High', 'Price: High to Low'];

const RoomFilter = ({ selectedType, onTypeChange, selectedSort, onSortChange }) => {
  const { t } = useTranslation();
  return (

  <div className="py-12 px-6 md:px-15">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-5">
      <div className="flex flex-wrap gap-1">
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`font-cinzel text-[10px] tracking-[2px] uppercase py-2 px-5 border-none cursor-pointer transition-colors duration-300 ${
              selectedType === type ? 'bg-gold text-black font-semibold' : 'bg-dark-2 text-white-dim hover:bg-gold hover:text-black'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 font-montserrat">
        <label className="text-[10px] tracking-[2px] uppercase text-white-dim">{t('Sort by:')}</label>
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-dark-2 border border-border-gold/25 text-white p-2 outline-none text-xs"
        >
          {SORTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
    </div>
  </div>

  );
};


export default RoomFilter;
