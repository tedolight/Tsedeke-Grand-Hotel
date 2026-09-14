import { useTranslation } from 'react-i18next';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoomPricing = ({ room }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  return (
    <div className="bg-dark-2 border border-border-gold/15 p-8">
      <h3 className="font-cinzel text-[12px] tracking-[4px] uppercase text-gold mb-4 pb-3 border-b border-border-gold/25">{t('Pricing')}</h3>
      <div className="mb-6">
        <div className="text-[9px] tracking-widest uppercase text-white-dim font-montserrat">{t('Starting from')}</div>
        <div className="font-cormorant text-5xl text-gold leading-none my-1">ETB {room?.price?.toLocaleString()}</div>
        <div className="text-[11px] text-white-dim font-montserrat">{t('per night · taxes included')}</div>
      </div>
      <div className="space-y-2 mb-6 text-[12px] font-montserrat text-white-dim">
        <div className="flex justify-between border-b border-border-gold/8 pb-2">
          <span>{t('Room Rate')}</span><span className="text-white">ETB {room?.price?.toLocaleString()}/night</span>
        </div>
        <div className="flex justify-between border-b border-border-gold/8 pb-2">
          <span>{t('Breakfast')}</span><span className="text-white">{t('Included')}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('Free Cancellation')}</span><span className="text-green-400">{t('24hrs before')}</span>
        </div>
      </div>
      <button
        onClick={() => navigate(`/booking?roomId=${room?._id}`)}
        className="btn-primary w-full"
        style={{ padding: '14px', fontSize: '10px' }}
      >
        <span>{t('Reserve This Room')}</span>
      </button>
    </div>
  );
};

export default RoomPricing;
