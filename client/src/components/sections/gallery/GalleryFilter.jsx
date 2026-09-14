import React from 'react';

const CATEGORIES = ['All', 'Hotel', 'Rooms', 'Dining', 'Events', 'Coffee'];

const GalleryFilter = ({ selectedCategory, onSelect }) => (
  <div className="flex flex-wrap gap-2 justify-center mb-10">
    {CATEGORIES.map((cat) => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        className={`font-cinzel text-[10px] tracking-[2px] uppercase py-2 px-5 border-none cursor-pointer transition-colors duration-300 ${
          selectedCategory === cat
            ? 'bg-gold text-black font-semibold'
            : 'bg-dark-2 text-white-dim hover:bg-gold hover:text-black'
        }`}
      >
        {cat}
      </button>
    ))}
  </div>
);

export default GalleryFilter;
