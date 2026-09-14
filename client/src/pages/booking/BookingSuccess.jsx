import { useTranslation } from 'react-i18next';
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';

const BookingSuccess = () => {
  const { t } = useTranslation();

  const { setCursorHovered } = useUiStore();
  const [searchParams] = useSearchParams();
  const bookingRef = searchParams.get('ref') || 'ADL-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 bg-dark">
      {/* Success Icon */}
      <div className="w-24 h-24 border-2 border-gold/40 flex items-center justify-center mb-8">
        <span className="text-5xl text-gold font-cormorant">✓</span>
      </div>

      <span className="text-[10px] tracking-[6px] uppercase text-gold mb-3 block font-montserrat">{t('Booking Confirmed')}</span>
      <h1 className="text-3xl md:text-5xl font-cormorant font-light text-white leading-tight mb-4">
        {t('Thank You for')} <em className="text-gold-light">{t('Choosing Tsedeke Grand')}</em>
      </h1>
      <div className="gold-line center" />

      <p className="text-[14px] text-white-dim font-montserrat max-w-md mb-8 leading-relaxed">
        {t('Your reservation has been confirmed. A confirmation email will be sent to you shortly with all the details of your stay.')}
      </p>

      {/* Booking Reference */}
      <div className="bg-dark-2 border border-border-gold/25 px-10 py-6 mb-10 text-center">
        <div className="text-[9px] tracking-[4px] uppercase text-white-dim font-montserrat mb-2">{t('Booking Reference')}</div>
        <div className="font-cinzel text-2xl text-gold tracking-[6px]">{bookingRef}</div>
      </div>

      {/* Next Steps */}
      <div className="bg-dark-2 border border-border-gold/15 p-8 max-w-lg w-full text-left mb-10">
        <h3 className="font-cinzel text-[11px] tracking-[3px] uppercase text-gold mb-5 pb-3 border-b border-border-gold/25">{t('What Happens Next')}</h3>
        <ul className="space-y-3">
          {[
            'Confirmation email will be sent within 15 minutes',
            'Our concierge team will contact you 48 hours before arrival',
            'Check-in begins at 2:00 PM on your arrival date',
            'Present your booking reference at the front desk',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-[13px] text-white-dim font-montserrat">
              <span className="text-gold mt-0.5">✓</span> {step}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-5 flex-wrap justify-center">
        <Link to="/" className="btn-primary" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>
          <span>{t('Back to Home')}</span>
        </Link>
        <Link to="/contact" className="btn-outline" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>
          <span>{t('Contact Concierge')}</span>
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccess;
