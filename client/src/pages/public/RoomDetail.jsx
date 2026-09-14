import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useRoomStore from '../../store/rooms/roomStore.js';
import useUiStore from '../../store/ui/themeStore.js';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../../utils/helpers/imageHelpers.js';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../components/ui/AnimatedSection.jsx';

// Dynamic date helpers
const getFutureDateStr = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

const MOCK_ROOMS = [];

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { room, fetchRoomById, loading, error } = useRoomStore();
  const { setCursorHovered, addToast } = useUiStore();
  const { t, i18n } = useTranslation();

  // Booking Card States
  const [checkIn, setCheckIn] = useState(getFutureDateStr(3));
  const [checkOut, setCheckOut] = useState(getFutureDateStr(6));
  const [guests, setGuests] = useState(2);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Load the room details
  useEffect(() => {
    if (id) {
      fetchRoomById(id);
    }
  }, [id, fetchRoomById]);

  // Determine current room (fetch result or local mock fallback)
  const currentRoom = useMemo(() => {
    if (room && room._id === id) {
      return room;
    }
    return null;
  }, [room, id]);

  // Reset active image index when room changes
  useEffect(() => {
    setActiveImageIdx(0);
  }, [currentRoom]);

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end - start;
    if (isNaN(diff)) return 1;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }, [checkIn, checkOut]);

  // Pricing calculations
  const pricePerNight = currentRoom ? currentRoom.price : 0;
  const subtotal = pricePerNight * nights;
  const serviceCharge = 0;
  const totalCost = subtotal + serviceCharge;

  const handleMouseEnter = () => setCursorHovered(true);
  const handleMouseLeave = () => setCursorHovered(false);

  const handleBookNow = (e) => {
    e.preventDefault();
    if (!currentRoom) return;
    if (new Date(checkIn) >= new Date(checkOut)) {
      addToast(t('Check-out date must be after check-in date'), 'error');
      return;
    }
    navigate(`/booking?roomId=${currentRoom._id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-gold font-cinzel text-xl tracking-[4px] animate-pulse">{t('Loading Room Details...')}</div>
          <div className="w-16 h-[2px] bg-gold mx-auto mt-4 animate-scaleWidth" />
        </div>
      </div>
    );
  }

  if (error && !currentRoom) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 text-center">
        <div>
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="font-cormorant text-3xl text-white mb-4">{t('Failed to Load Room')}</h2>
          <p className="text-white-dim text-sm max-w-md mx-auto mb-8">{t(error)}</p>
          <Link
            to="/rooms"
            className="btn-primary"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span>{t('Back to Rooms')}</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 text-center">
        <div>
          <span className="text-4xl mb-4 block">🔍</span>
          <h2 className="font-cormorant text-3xl text-white mb-4">{t('Room Not Found')}</h2>
          <p className="text-white-dim text-sm max-w-md mx-auto mb-8">
            {t('The room style or luxury suite you requested could not be found.')}
          </p>
          <Link
            to="/rooms"
            className="btn-primary"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span>{t('Back to Rooms')}</span>
          </Link>
        </div>
      </div>
    );
  }

  const roomImages = currentRoom.images && currentRoom.images.length > 0
    ? currentRoom.images
    : ['/images/custom/5.jpg'];

  return (
    <div className="room-detail-page bg-black text-white select-none min-h-screen font-montserrat">
      {/* ─── PAGE HERO ─── */}
      <div className="relative h-[45vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${getImageUrl(roomImages[0])}')`
          }}
        />
        <div className="page-hero relative z-10 text-center px-4">
          {currentRoom.badge && (
            <AnimatedText tag="span" animation="fade-down" delay={100} className="bg-gold text-black font-cinzel text-[9px] tracking-[2px] py-1 px-3 z-10 font-semibold rounded-sm mb-4 inline-block">
              {t(currentRoom.badge)}
            </AnimatedText>
          )}
          <AnimatedText tag="span" animation="fade-down" delay={200} className="text-[10px] tracking-[6px] uppercase text-gold mb-3 block font-montserrat">
            ✦ {t('Luxury')} {t(currentRoom.type)} {t('Suite')}
          </AnimatedText>
          <AnimatedText tag="h1" animation="fade-up" delay={300} className="text-3xl md:text-5xl font-cormorant font-light text-white leading-tight">
            {t(currentRoom.name)}
          </AnimatedText>
          <AnimatedText tag="p" animation="fade-up" delay={400} className="mt-6 text-[11px] tracking-[2px] text-white-dim uppercase font-montserrat">
            <Link to="/" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="text-gold no-underline">
              {t('Home')}
            </Link>{' '}
            &nbsp;/&nbsp;{' '}
            <Link to="/rooms" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="text-gold no-underline">
              {t('Rooms')}
            </Link>{' '}
            &nbsp;/&nbsp; {t(currentRoom.name)}
          </AnimatedText>
        </div>
      </div>

      {/* ─── CONTENT SECTION ─── */}
      <div className="py-20 px-6 md:px-15 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 items-start">

          {/* LEFT COLUMN: GALLERY & DETAILS */}
          <div className="space-y-12">

            {/* Gallery Component */}
            <AnimatedSection animation="fade-right" className="space-y-4">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-border-gold/15 bg-dark-2">
                <img
                  src={getImageUrl(roomImages[activeImageIdx])}
                  alt={`${t(currentRoom.name)} view`}
                  className="w-full h-full object-cover block transition-transform duration-500 hover:scale-103"
                />
              </div>
              {roomImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {roomImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      className={`relative aspect-[16/10] overflow-hidden rounded-sm border cursor-pointer transition-all duration-300 ${activeImageIdx === idx ? 'border-gold scale-98 shadow-md' : 'border-border-gold/20 opacity-70 hover:opacity-100'
                        }`}
                    >
                      <img src={getImageUrl(img)} alt={t('Thumbnail view')} className="w-full h-full object-cover block" />
                    </button>
                  ))}
                </div>
              )}
            </AnimatedSection>

            {/* Room Specs Badges */}
            <AnimatedSection animation="fade-up" delay={100} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: '📐', val: currentRoom.size, lbl: 'Room Size' },
                { icon: '👥', val: `${currentRoom.capacity} Guests`, lbl: 'Max Capacity' },
                { icon: '🛏️', val: t(currentRoom.bed), lbl: 'Bed Configuration' },
                { icon: '🌆', val: t(currentRoom.view || 'Standard View'), lbl: 'Room View' }
              ].map((spec, i) => (
                <div key={i} className="p-5 bg-dark-2 border border-border-gold/10 text-center rounded-sm">
                  <div className="text-2xl mb-2">{spec.icon}</div>
                  <div className="font-cinzel text-xs text-gold tracking-wide font-semibold">{t(spec.val)}</div>
                  <div className="text-[9px] text-white-dim/60 font-montserrat mt-1 uppercase tracking-wider">{t(spec.lbl)}</div>
                </div>
              ))}
            </AnimatedSection>

            {/* Long Description */}
            <div className="space-y-4">
              <AnimatedText tag="h2" animation="fade-up" className="font-cormorant text-3xl md:text-5xl font-light text-white leading-tight">
                {t('Room')} <em>{t('Description')}</em>
              </AnimatedText>
              <div className="w-12 h-[1px] bg-gold mb-6" />
              <AnimatedText tag="p" animation="fade-up" delay={100} className="text-[14px] leading-relaxed text-white-dim font-montserrat">
                {t(currentRoom.description)}
              </AnimatedText>
              <AnimatedText tag="p" animation="fade-up" delay={200} className="text-[14px] leading-relaxed text-white-dim font-montserrat">
                {t('Experience the fine balance of style, comfort, and the unparalleled warmth of traditional Ethiopian hospitality. Every detail in the')} {t(currentRoom.name)} {t('is designed with meticulous care, from the rich textures of the furnishings to the modern facilities arranged for your comfort.')}
              </AnimatedText>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-6">
              <AnimatedText tag="h2" animation="fade-up" className="font-cormorant text-3xl md:text-5xl font-light text-white leading-tight">
                {t('Amenities & Offerings')}
              </AnimatedText>
              <div className="w-12 h-[1px] bg-gold" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentRoom.amenities && currentRoom.amenities.map((amenity, i) => (
                  <AnimatedCard key={i} index={i} animation="scale" className="flex items-center gap-3 p-3 bg-dark-3/40 border border-border-gold/10 rounded-sm">
                    <span className="text-[13px] text-white font-montserrat">{t(amenity)}</span>
                  </AnimatedCard>
                ))}
              </div>
            </div>

            {/* Policies Strip */}
            <AnimatedSection animation="fade-up" delay={200} className="p-8 bg-dark-2 border border-border-gold/15 rounded-sm">
              <h3 className="font-cinzel text-xs tracking-[3px] text-gold uppercase mb-4 font-semibold">
                {t('Booking & Cancellation Policies')}
              </h3>
              <ul className="space-y-2 text-[12px] text-white-dim leading-relaxed list-disc list-inside font-montserrat">
                <li><strong>{t('Check-in:')}</strong> {t('2:00 PM')}</li>
                <li><strong>{t('Check-out:')}</strong> {t('12:00 PM (noon)')}</li>
                <li><strong>{t('Cancellation:')}</strong> {t('Free cancellation up to 24 hours prior to arrival date.')}</li>
                <li><strong>{t('Smoking:')}</strong> {t('All our rooms are non-smoking. Designated outdoor spaces are available.')}</li>
              </ul>
            </AnimatedSection>

          </div>

          {/* RIGHT COLUMN: BOOKING CARD */}
          <AnimatedSection animation="fade-left" className="sticky top-28 bg-dark-2 border border-border-gold/15 p-8 rounded-sm shadow-2xl space-y-6">
            <div className="border-b border-border-gold/15 pb-5 text-center">
              <span className="text-[9px] tracking-[2px] uppercase text-white-dim block">{t('Starting from')}</span>
              <div className="font-cormorant text-4xl text-gold mt-1.5 font-light">
                ETB {pricePerNight.toLocaleString()}
              </div>
              <span className="text-[10px] text-white-dim block mt-1">{t('per night (taxes included)')}</span>
            </div>

            <form onSubmit={handleBookNow} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] tracking-[2px] uppercase text-gold font-montserrat">{t('Check In')}</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] p-3 outline-none focus:border-gold w-full rounded-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] tracking-[2px] uppercase text-gold font-montserrat">{t('Check Out')}</label>
                <input
                  type="date"
                  min={checkIn ? new Date(new Date(checkIn).setDate(new Date(checkIn).getDate() + 1)).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] p-3 outline-none focus:border-gold w-full rounded-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] tracking-[2px] uppercase text-gold font-montserrat">{t('Guests')}</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="bg-dark-3 border border-border-gold/25 text-white-dim font-montserrat text-[13px] p-3 outline-none focus:border-gold w-full rounded-sm"
                >
                  <option value={1}>{t('1 Guest')}</option>
                  <option value={2}>{t('2 Guests')}</option>
                  <option value={3}>{t('3 Guests')}</option>
                  <option value={4}>{t('4 Guests')}</option>
                </select>
              </div>

              {/* Booking breakdown summary */}
              <div className="bg-dark-3 p-4 border border-border-gold/10 rounded-sm text-[12px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-white-dim">ETB {pricePerNight.toLocaleString()} x {nights} {t('nights')}</span>
                  <span>ETB {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between border-t border-border-gold/15 pt-2 text-gold font-semibold">
                  <span>{t('Total cost')}</span>
                  <span>ETB {totalCost.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gold text-black font-cinzel text-[11px] tracking-[3px] uppercase border-none cursor-pointer transition-colors duration-300 hover:bg-gold-light font-semibold rounded-sm shadow-md"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {t('Book Your Stay')}
              </button>
            </form>

            <div className="border-t border-border-gold/10 pt-5 space-y-3 text-[11px] text-white-dim/80">
              <div className="flex items-center gap-2">
                <span>🛡️</span>
                <span>{t('Best Rate Guaranteed')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>{t('Secure local & credit card payments')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🛎️</span>
                <span>{t('24/7 dedicated guest support')}</span>
              </div>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
