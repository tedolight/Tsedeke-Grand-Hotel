import React from 'react';

const MENU_CATEGORIES = [
  { label: 'All', value: 'All' },
  { label: 'Starters', value: 'Starters' },
  { label: 'Main Course', value: 'Main Course' },
  { label: 'Seafood', value: 'Seafood' },
  { label: 'Grills', value: 'Grills' },
  { label: 'Vegetarian', value: 'Vegetarian' },
  { label: 'Beverages', value: 'Beverages' },
];

const MenuFilter = ({ selected, onSelect }) => (
  <div className="flex flex-wrap gap-2 justify-center mb-10">
    {MENU_CATEGORIES.map((cat) => (
      <button
        key={cat.value}
        onClick={() => onSelect(cat.value)}
        className={`font-cinzel text-[10px] tracking-[2px] uppercase py-2 px-5 border-none cursor-pointer transition-colors duration-300 ${
          selected === cat.value
            ? 'bg-gold text-black font-semibold'
            : 'bg-dark-2 text-white-dim hover:bg-gold hover:text-black'
        }`}
      >
        {cat.label}
      </button>
    ))}
  </div>
);

export default MenuFilter;
