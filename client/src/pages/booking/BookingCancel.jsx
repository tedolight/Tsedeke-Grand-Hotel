import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';
import useBookingStore from '../../store/booking/bookingStore.js';

const BookingCancel = () => {
  const { t } = useTranslation();

  const { setCursorHovered, addToast } = useUiStore();
  const { cancelBooking, loading } = useBookingStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('id');
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState('');

  const handleCancel = async () => {
    if (!reason) { addToast('Please select a cancellation reason.', 'error'); return; }
    if (bookingId) {
      const success = await cancelBooking(bookingId);
      if (success) { setConfirmed(true); return; }
    }
    // Demo mode
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-dark">
        <div className="text-5xl mb-6">✓</div>
        <h1 className="font-cormorant text-4xl font-light text-white mb-4">{t('Booking Cancelled')}</h1>
        <div className="gold-line center" />
        <p className="text-[14px] text-white-dim font-montserrat max-w-sm mb-10">{t('Your booking has been successfully cancelled. A confirmation email will be sent to you. Any eligible refund will be processed within 5–7 business days.')}</p>
        <Link to="/" className="btn-primary" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}><span>{t('Back to Home')}</span></Link>
      </div>
    {t(');
  }

  return (')}
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-dark">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-6">⚠️</div>
        <h1 className="font-cormorant text-4xl font-light text-white mb-4">{t('Cancel Your Booking')}</h1>
        <div className="gold-line center" />
        <p className="text-[14px] text-white-dim font-montserrat mb-10 leading-relaxed">
          {t('We\'re sorry to hear you need to cancel. Please confirm below. Cancellations made 24+ hours before check-in receive a full refund.')}
        </p>

        <div className="bg-dark-2 border border-border-gold/15 p-8 text-left mb-8">
          <label className="text-[9px] tracking-[3px] uppercase text-gold font-montserrat block mb-2">{t('Reason for Cancellation')}</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-dark-3 border border-border-gold/25 text-white-dim font-montserrat text-[13px] px-4 py-3 outline-none focus:border-gold w-full"
          >
            <option value="">{t('Select a reason...')}</option>
            <option>{t('Change of plans')}</option>
            <option>{t('Found a better option')}</option>
            <option>{t('Travel changes')}</option>
            <option>{t('Health or emergency reasons')}</option>
            <option>{t('Other')}</option>
          </select>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="bg-red-900/50 border border-red-500/30 text-red-300 font-cinzel text-[10px] tracking-[2px] uppercase px-8 py-4 cursor-pointer hover:bg-red-900/70 transition-colors disabled:opacity-50"
            onMouseEnter={() => setCursorHovered(true)}
            onMouseLeave={() => setCursorHovered(false)}
          >
            {loading ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
          <button onClick={() => navigate(-1)} className="btn-outline" style={{ padding: '14px 28px', fontSize: '10px' }} onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>
            {t('Keep Booking')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCancel;
