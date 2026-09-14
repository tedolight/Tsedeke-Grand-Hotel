import { useTranslation } from 'react-i18next';
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';

const BookingConfirm = () => {
  const { t } = useTranslation();

  const { setCursorHovered } = useUiStore();
  const [searchParams] = useSearchParams();

  // Extract details from query params (passed from Booking.jsx)
  const roomId = searchParams.get('roomId') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '2';
  const total = searchParams.get('total') || '';

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-dark">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <span className="text-[10px] tracking-[6px] uppercase text-gold mb-3 block font-montserrat">{t('Step 2 of 3')}</span>
          <h1 className="font-cormorant text-4xl font-light text-white mb-4">{t('Confirm Your Reservation')}</h1>
          <div className="gold-line center" />
        </div>

        {/* Booking Summary */}
        <div className="bg-dark-2 border border-border-gold/15 p-8 mb-6">
          <h3 className="font-cinzel text-[11px] tracking-[3px] uppercase text-gold mb-5 pb-3 border-b border-border-gold/25">{t('Booking Summary')}</h3>
          <div className="space-y-3 font-montserrat text-[13px]">
            {checkIn && <div className="flex justify-between"><span className="text-white-dim">{t('Check-In')}</span><span className="text-white">{new Date(checkIn).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>}
            {checkOut && <div className="flex justify-between"><span className="text-white-dim">{t('Check-Out')}</span><span className="text-white">{new Date(checkOut).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>}
            <div className="flex justify-between"><span className="text-white-dim">{t('Duration')}</span><span className="text-white">{nights} Night{nights > {t('1 ? \'s\' : \'\'}')}</span></div>
            <div className="flex justify-between"><span className="text-white-dim">{t('Guests')}</span><span className="text-white">{guests} Guest{parseInt(guests) > {t('1 ? \'s\' : \'\'}')}</span></div>
            {total && (
              <div className="flex justify-between border-t border-border-gold/15 pt-3 mt-3">
                <span className="text-white-dim">{t('Total')}</span>
                <span className="font-cormorant text-2xl text-gold">ETB {total}</span>
              </div>
            )}
          </div>
        </div>

        {/* Policies */}
        <div className="bg-dark-2 border border-border-gold/15 p-6 mb-8">
          <h4 className="font-cinzel text-[10px] tracking-[3px] uppercase text-gold mb-4">{t('Hotel Policies')}</h4>
          <ul className="space-y-2 text-[12px] text-white-dim font-montserrat">
            <li className="flex gap-2"><span className="text-gold">•</span> {t('Check-in from 2:00 PM, Check-out by 12:00 PM')}</li>
            <li className="flex gap-2"><span className="text-gold">•</span> {t('Free cancellation up to 24 hours before arrival')}</li>
            <li className="flex gap-2"><span className="text-gold">•</span> {t('Breakfast included for all room types')}</li>
            <li className="flex gap-2"><span className="text-gold">•</span> {t('Government-issued ID required at check-in')}</li>
          </ul>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Link to="/booking" className="btn-outline flex-1 text-center" style={{ padding: '14px', fontSize: '10px' }} onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>
            <span>{t('← Edit Booking')}</span>
          </Link>
          <Link
            to={`/booking/success?${searchParams.toString()}`}
            className="btn-primary flex-1 text-center"
            style={{ padding: '14px', fontSize: '10px' }}
            onMouseEnter={() => setCursorHovered(true)}
            onMouseLeave={() => setCursorHovered(false)}
          >
            <span>{t('Confirm & Pay →')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirm;
