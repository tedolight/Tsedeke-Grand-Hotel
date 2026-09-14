import { useTranslation } from 'react-i18next';
import React from 'react';

const RoomAmenities = ({ amenities = [] }) => {
  const { t } = useTranslation();
  return (

  <div className="bg-dark-2 border border-border-gold/15 p-8">
    <h3 className="font-cinzel text-[12px] tracking-[4px] uppercase text-gold mb-6 pb-3 border-b border-border-gold/25">{t('Room Amenities')}</h3>
    <div className="grid grid-cols-2 gap-2">
      {amenities.map((amenity, i) => (
        <div key={i} className="flex items-center gap-2 py-2 border-b border-border-gold/8 last:border-0">
          <span className="text-sm">{typeof amenity === 'string' ? amenity.split(' ')[0] : '✨'}</span>
          <span className="text-[12px] text-white-dim font-montserrat">
            {typeof amenity === 'string' ? amenity.substring(amenity.indexOf(' ') + 1) : amenity}
          </span>
        </div>
      ))}
    </div>
  </div>

  );
};


export default RoomAmenities;
