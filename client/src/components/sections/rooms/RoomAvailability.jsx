import { useTranslation } from 'react-i18next';
import React from 'react';

const RoomAvailability = ({ roomId, onCheck }) => {
  const { t } = useTranslation();

  const [checkIn, setCheckIn] = React.useState('');
  const [checkOut, setCheckOut] = React.useState('');

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-dark-2 border border-border-gold/15 p-8">
      <h3 className="font-cinzel text-[12px] tracking-[4px] uppercase text-gold mb-6 pb-3 border-b border-border-gold/25">{t('Check Availability')}</h3>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] tracking-[3px] uppercase text-gold font-montserrat">{t('Check-In')}</label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            className="bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] px-4 py-3 outline-none focus:border-gold"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] tracking-[3px] uppercase text-gold font-montserrat">{t('Check-Out')}</label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            className="bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] px-4 py-3 outline-none focus:border-gold"
          />
        </div>
        <button
          onClick={() => onCheck?.(checkIn, checkOut)}
          disabled={!checkIn || !checkOut}
          className="btn-primary w-full disabled:opacity-50"
          style={{ padding: '12px', fontSize: '10px' }}
        >
          <span>{t('Check Availability')}</span>
        </button>
      </div>
    </div>
  );
};

export default RoomAvailability;
