import { useTranslation } from 'react-i18next';
import React from 'react';
import { Link } from 'react-router-dom';

const FooterBrand = () => {
  const { t } = useTranslation();
  return (

  <div className="flex flex-col gap-4">
    <Link to="/" className="font-cinzel text-2xl font-bold tracking-[6px] text-gold no-underline hover:text-gold-light transition-colors">
      {t('TSEDEKE GRAND HOTEL')}
    </Link>
    <p className="text-[12px] text-white-dim font-montserrat leading-relaxed max-w-xs">
      {t('A haven of warmth, elegance, and authentic Ethiopian hospitality in the heart of Hossana City.')}
    </p>
    <div className="flex gap-3 flex-wrap">
      {['TripAdvisor', 'Google: 4.8★', 'Booking.com'].map((r, i) => (
        <span key={i} className="text-[9px] tracking-[1px] border border-border-gold/30 text-gold/70 px-2.5 py-1 font-montserrat">{r}</span>
      ))}
    </div>
  </div>

  );
};


export default FooterBrand;
