import React from 'react';
import { useScrollReveal } from '../../../hooks/useScrollReveal.js';

const GALLERY_ITEMS = [
  { url: '/images/custom/8.jpg', category: 'Hotel',  caption: 'Grand Lobby' },
  { url: '/images/custom/1.jpg', category: 'Rooms',  caption: 'VIP Suite' },
  { url: '/images/custom/4.jpg', category: 'Rooms',  caption: 'Deluxe Room' },
  { url: '/images/custom/5.jpg', category: 'Dining', caption: 'Fine Dining' },
  { url: '/images/custom/7.jpg', category: 'Events', caption: 'Grand Ballroom' },
  { url: '/images/custom/8.jpg', category: 'Coffee', caption: 'Coffee Lounge' },
  { url: '/images/custom/1.jpg', category: 'Rooms',  caption: 'Classic Room' },
  { url: '/images/custom/4.jpg', category: 'Events', caption: 'Conference Hall' },
  { url: '/images/custom/5.jpg', category: 'Events', caption: 'Private Events' },
];

/* Individual gallery item with scroll-reveal zoom-tilt */
const GalleryItem = ({ item, index, onImageClick }) => {
  const { ref, visible } = useScrollReveal({ threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  const delay = (index % 3) * 100; // stagger per column

  return (
    <div
      ref={ref}
      className={`sr-base sr-zoom-tilt${visible ? ' sr-visible' : ''} relative overflow-hidden cursor-pointer group h-60`}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={() => onImageClick?.(index)}
    >
      <img
        src={item.url || item}
        alt={item.caption || `Gallery ${index + 1}`}
        className="w-full h-full object-cover brightness-95 group-hover:scale-108 group-hover:brightness-80 transition-all duration-700"
        style={{ imageRendering: 'auto' }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
        <span className="text-gold text-4xl mb-2">⊕</span>
        {item.caption && (
          <span className="text-[11px] tracking-[2px] uppercase text-white font-montserrat text-center px-4">
            {item.caption}
          </span>
        )}
      </div>
      {item.category && (
        <span className="absolute bottom-3 left-3 bg-black/70 border border-border-gold/30 text-gold text-[9px] tracking-[2px] uppercase px-2.5 py-1 font-montserrat">
          {item.category}
        </span>
      )}
    </div>
  );
};

const GalleryGrid = ({ items = GALLERY_ITEMS, onImageClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
    {items.map((item, i) => (
      <GalleryItem key={i} item={item} index={i} onImageClick={onImageClick} />
    ))}
  </div>
);

export { GALLERY_ITEMS };
export default GalleryGrid;
