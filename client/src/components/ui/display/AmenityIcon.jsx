import React from 'react';

const AMENITY_ICONS = {
  wifi: { icon: '📶', label: 'Free WiFi' },
  tv: { icon: '📺', label: 'Smart TV' },
  safe: { icon: '🔒', label: 'In-room Safe' },
  jacuzzi: { icon: '🛁', label: 'Jacuzzi' },
  roomservice: { icon: '🍽️', label: 'Room Service' },
  balcony: { icon: '🌅', label: 'Private Balcony' },
  minibar: { icon: '🍷', label: 'Mini Bar' },
  coffee: { icon: '☕', label: 'Coffee Machine' },
  pool: { icon: '🏊', label: 'Swimming Pool' },
  gym: { icon: '💪', label: 'Fitness Center' },
  spa: { icon: '💆', label: 'Spa Access' },
  parking: { icon: '🅿️', label: 'Free Parking' },
  breakfast: { icon: '🥐', label: 'Breakfast' },
  ac: { icon: '❄️', label: 'Air Conditioning' },
};

const AmenityIcon = ({ type, label, showLabel = true, size = 'sm' }) => {
  const item = AMENITY_ICONS[type] || { icon: '✨', label: label || type };
  const sizeMap = { sm: 'text-base', md: 'text-2xl', lg: 'text-4xl' };
  return (
    <div className="flex items-center gap-2">
      <span className={sizeMap[size]}>{item.icon}</span>
      {showLabel && (
        <span className="text-[11px] text-white-dim font-montserrat">{item.label}</span>
      )}
    </div>
  );
};

export default AmenityIcon;
