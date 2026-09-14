import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import useRoomStore from '../../store/rooms/roomStore.js';
import useUiStore from '../../store/ui/themeStore.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import { useTranslation } from 'react-i18next';
import { getFirstImage } from '../../utils/helpers/imageHelpers.js';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../components/ui/AnimatedSection.jsx';

const MOCK_ROOMS = [];

// Helper: get today and tomorrow dates as YYYY-MM-DD strings
const getTodayStr = () => new Date().toISOString().split('T')[0];
const getFutureDateStr = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

const Rooms = () => {
  const { t, i18n } = useTranslation();
  usePageMeta(t('Rooms & Suites'), t('Explore our luxury rooms and suites at Tsedeke Grand Hotel. From Classic Rooms to VIP Royal Suites with jacuzzis and city views in Hossana.'));
  const { rooms, fetchRooms, loading } = useRoomStore();
  const { setCursorHovered, addToast } = useUiStore();
  const navigate = useNavigate();

  // Filters & local state
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSort, setSelectedSort] = useState('Price: Low to High');
  const [checkIn, setCheckIn] = useState(getFutureDateStr(1));
  const [checkOut, setCheckOut] = useState(getFutureDateStr(3));
  const [guests, setGuests] = useState('2 Guests');

  // Modal State
  const [activeModalRoom, setActiveModalRoom] = useState(null);

  useEffect(() => {
    const doFetch = () => {
      fetchRooms({
        type: selectedType !== 'all' ? selectedType : undefined,
        sort: selectedSort,
      });
    };
    doFetch();
    window.addEventListener('focus', doFetch);
    return () => window.removeEventListener('focus', doFetch);
  }, [fetchRooms, selectedType, selectedSort]);

  const handleMouseEnter = () => setCursorHovered(true);
  const handleMouseLeave = () => setCursorHovered(false);

  // Combine real rooms
  const allRooms = rooms || [];

  const ROOM_CATEGORIES = [
    { key: 'all', label: 'All' },
    { key: 'deluxe suite', label: 'Deluxe Suite' },
    { key: 'deluxe single room', label: 'Deluxe Single Room' },
    { key: 'deluxe double room', label: 'Deluxe Double Room' },
    { key: 'deluxe triple room', label: 'Deluxe Triple Room' },
    { key: 'special price room', label: 'Special Price Room' },
    { key: 'hour room', label: 'Hour Room' },
  ];

  // Filter & Sort
  const filteredRooms = allRooms
    .filter((room) => {
      if (selectedType === 'all') return true;
      const typeLower = selectedType.toLowerCase().trim();
      const roomTypeLower = (room.type || '').toLowerCase().trim();
      const roomNameLower = (room.name || '').toLowerCase().trim();

      if (roomTypeLower === typeLower) return true;

      // Smart matching for existing rooms & variations
      if (typeLower === 'deluxe suite') {
        return roomTypeLower === 'suite' || roomTypeLower === 'deluxe suite' || roomNameLower.includes('suite');
      }
      if (typeLower === 'deluxe single room') {
        return roomTypeLower === 'single' || roomTypeLower === 'deluxe single room' || roomNameLower.includes('single');
      }
      if (typeLower === 'deluxe double room') {
        return roomTypeLower === 'double' || roomTypeLower === 'deluxe double room' || roomTypeLower === 'family double bed' || roomNameLower.includes('double');
      }
      if (typeLower === 'deluxe triple room') {
        return roomTypeLower === 'triple' || roomTypeLower === 'deluxe triple room' || roomNameLower.includes('triple');
      }
      if (typeLower === 'special price room') {
        return roomTypeLower === 'special price room' || roomTypeLower === 'special' || (room.discount && room.discount > 0) || roomNameLower.includes('special');
      }
      if (typeLower === 'hour room') {
        return roomTypeLower === 'hour room' || roomTypeLower === 'hour' || roomNameLower.includes('hour');
      }

      return false;
    })
    .sort((a, b) => {
      if (selectedSort === 'Price: Low to High') return a.price - b.price;
      if (selectedSort === 'Price: High to Low') return b.price - a.price;
      return (parseInt(a.roomNumber, 10) || 0) - (parseInt(b.roomNumber, 10) || 0);
    });

  const handleCheckAvailability = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      addToast(t('Please select check-in and check-out dates'), 'error');
      return;
    }
    // Navigate to booking flow with query params
    navigate(`/booking?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&type=${selectedType}`);
  };

  const handleOpenModal = (room) => {
    setActiveModalRoom(room);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setActiveModalRoom(null);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeModalRoom) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModalRoom]);

  const handleBookNow = (room) => {
    handleCloseModal();
    // Navigate to booking with pre-selected room
    navigate(`/booking?roomId=${room._id}`);
  };

  return (
    <div className="rooms-page select-none">
      {/* ─── PAGE HERO ─── */}
      <div className="relative h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden pt-[68px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/custom/front-view-room-bed.jpg')`
          }}
        />
        <div className="page-hero-content relative z-10 text-center px-4 sm:px-6">
          <AnimatedText tag="span" animation="fade-up" delay={0}
            className="hero-3d-badge mb-5 block">
            {t('✦ Accommodations')}
          </AnimatedText>
          <AnimatedText tag="h1" animation="scale" delay={150}
            className="hero-3d-title text-3xl md:text-5xl leading-tight mb-4">
            {t('Rooms')} & <em className="hero-3d-gold">{t('Suites')}</em>
          </AnimatedText>
          <AnimatedText tag="p" animation="fade-up" delay={300}
            className="hero-3d-sub mt-6 text-[11px] tracking-[2px] uppercase">
            <Link to="/" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="no-underline">{t('Home')}</Link>
            &nbsp;/&nbsp; {t('Rooms & Suites')}
          </AnimatedText>
        </div>
      </div>

      {/* ─── AVAILABILITY CHECKER ─── */}
      <div className="bg-dark-2 border-y border-border-gold/15 py-10 px-6 md:px-15">
        <form className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end" onSubmit={handleCheckAvailability}>
          <div className="flex flex-col gap-2">
            <label className="text-[9px] tracking-[3px] uppercase text-gold font-montserrat">{t('Check In')}</label>
            <input
              type="date"
              className="bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] p-3 outline-none focus:border-gold w-full rounded-sm"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[9px] tracking-[3px] uppercase text-gold font-montserrat">{t('Check Out')}</label>
            <input
              type="date"
              className="bg-dark-3 border border-border-gold/25 text-white font-montserrat text-[13px] p-3 outline-none focus:border-gold w-full rounded-sm"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[9px] tracking-[3px] uppercase text-gold font-montserrat">{t('Guests')}</label>
            <select
              className="bg-dark-3 border border-border-gold/25 text-white-dim font-montserrat text-[13px] p-3 outline-none focus:border-gold w-full rounded-sm"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            >
              <option value="1 Guest">{t('1 Guest')}</option>
              <option value="2 Guests">{t('2 Guests')}</option>
              <option value="3 Guests">{t('3 Guests')}</option>
              <option value="4 Guests">{t('4 Guests')}</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full h-[46px] bg-gold text-black font-cinzel text-[11px] tracking-[3px] uppercase border-none cursor-pointer transition-colors duration-300 hover:bg-gold-light font-semibold rounded-sm"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {t('Check Availability')}
          </button>
        </form>
      </div>

      {/* ─── FILTER & SORT ─── */}
      <div className="py-6 px-6 md:px-15 border-b border-border-gold/20 bg-dark-2">
        <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto scrollbar-none">
          {/* Category pills — scrollable, never wrap */}
          <div className="flex items-center gap-2 shrink-0">
            {ROOM_CATEGORIES.map(({ key, label }) => (
              <button
                key={key}
                className={`font-cinzel text-[10px] tracking-[2px] uppercase py-2 px-4 cursor-pointer transition-all duration-300 rounded-sm whitespace-nowrap shrink-0 border ${selectedType === key
                  ? 'bg-gold text-black font-semibold border-gold'
                  : 'bg-transparent text-white-dim border-border-gold/30 hover:bg-gold hover:text-black hover:border-gold'
                  }`}
                onClick={() => setSelectedType(key)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {t(label)}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-border-gold/30 shrink-0 ml-auto" />

          {/* Sort control — pinned to the right */}
          <div className="flex items-center gap-2 font-montserrat shrink-0">
            <label className="text-[10px] tracking-[2px] uppercase text-white-dim whitespace-nowrap">{t('Sort by:')}</label>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-dark-3 border border-border-gold/25 text-white p-2 outline-none text-xs rounded-sm"
            >
              <option value="Price: Low to High">{t('Price: Low to High')}</option>
              <option value="Price: High to Low">{t('Price: High to Low')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── ROOMS GRID ─── */}
      <div className="py-5 px-6 md:px-15 bg-black">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-dark-2 flex flex-col rounded-sm overflow-hidden border border-border-gold/15 animate-pulse">
                  <div className="bg-white/5 h-[250px]" />
                  <div className="p-8 flex flex-col gap-4">
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                    <div className="h-6 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-full" />
                    <div className="h-3 bg-white/5 rounded w-5/6" />
                    <div className="h-3 bg-white/5 rounded w-4/5" />
                    <div className="mt-auto pt-5 border-t border-border-gold/10 flex justify-between items-center">
                      <div className="h-8 bg-white/5 rounded w-1/3" />
                      <div className="h-8 bg-white/5 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredRooms.map((room) => {
                const isVip = room.type.toLowerCase() === 'vip';
                return (
                  <div
                    key={room._id}
                    className={`group relative bg-gradient-to-b from-dark-2/95 via-dark-2 to-dark-3 border border-border-gold/20 rounded-md overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(212,175,55,0.12)] ${isVip ? 'md:col-span-2 xl:col-span-3 md:flex-row' : ''
                      }`}
                  >
                    {/* Room Image Container */}
                    <div className={`relative overflow-hidden ${isVip ? 'md:w-1/2 min-h-[300px]' : 'h-[200px] sm:h-[215px] w-full'}`}>
                      {room.badge && (
                        <span className="absolute top-3 left-3 bg-gold/90 text-black font-cinzel text-[9px] tracking-[2px] py-0.5 px-2.5 z-10 font-bold uppercase rounded shadow-lg backdrop-blur-sm">
                          {t(room.badge)}
                        </span>
                      )}
                      <img
                        src={getFirstImage(room.images, 'room')}
                        alt={t(room.name)}
                        className="w-full h-full object-cover block brightness-[0.88] group-hover:scale-108 group-hover:brightness-100 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-2 via-dark-2/20 to-transparent pointer-events-none opacity-80 group-hover:opacity-40 transition-opacity duration-500" />
                    </div>

                    {/* Content Container */}
                    <div className={`p-4 sm:p-5 flex flex-col flex-1 ${isVip ? 'md:w-1/2 justify-center p-6 lg:p-10' : ''}`}>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-gold text-[9.5px] tracking-[2.5px] uppercase font-montserrat font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                            {t(room.type)}
                          </span>
                        </div>

                        <h2 className="font-cormorant text-xl md:text-2xl font-bold leading-tight mb-2 text-white group-hover:text-gold-light transition-colors duration-300">
                          {t(room.name)}
                        </h2>

                        <p className={`text-[11.5px] leading-relaxed text-white-dim/80 mb-3.5 font-montserrat ${isVip ? '' : 'line-clamp-2'}`}>
                          {t(room.description)}
                        </p>

                        {/* Luxury Specs Grid */}
                        <div className="grid grid-cols-3 gap-1.5 p-2 bg-white/[0.02] border border-gold/10 rounded mb-3.5">
                          <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-[11px] mb-0.5 opacity-80">📐</span>
                            <span className="text-[9.5px] text-gold font-cinzel font-semibold tracking-wider">{room.size}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center text-center border-x border-gold/10">
                            <span className="text-[11px] mb-0.5 opacity-80">👥</span>
                            <span className="text-[9.5px] text-gold font-cinzel font-semibold tracking-wider">{t('Max')} {room.capacity}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-[11px] mb-0.5 opacity-80">🛏️</span>
                            <span className="text-[9.5px] text-gold font-cinzel font-semibold tracking-wider">{t(room.bed)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer: Price & Buttons */}
                      <div className="pt-3 border-t border-gold/15 mt-auto flex items-center justify-between gap-2.5">
                        <div className="min-w-[100px]">
                          <span className="text-[7.5px] tracking-[1.5px] uppercase text-white-dim/70 font-montserrat font-semibold block mb-0.5">{t('Starting from')}</span>
                          <div className="font-cormorant text-xl md:text-2xl text-gold font-bold leading-none">ETB {room.price?.toLocaleString()}</div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                          <button
                            onClick={() => handleOpenModal(room)}
                            className="px-3.5 py-2 rounded text-[10px] font-cinzel tracking-wider text-gold-light border border-gold/30 hover:border-gold hover:bg-gold/10 transition-all font-semibold uppercase whitespace-nowrap cursor-pointer"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t('Details')}
                          </button>
                          <button
                            onClick={() => handleBookNow(room)}
                            className="px-4 py-2 rounded text-[10px] font-cinzel tracking-wider bg-gold text-black hover:bg-gold-light transition-all font-bold uppercase whitespace-nowrap shadow-md hover:shadow-gold/20 cursor-pointer"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t('Book Now')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── PERKS STRIP ─── */}
      <div className="bg-dark-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-border-gold/10 max-w-7xl mx-auto w-full my-12">
        {[
          { icon: '🔄', title: 'Free Cancellation', text: 'Cancel up to 24 hours before check-in for a full refund.' },
          { icon: '🏆', title: 'Best Rate Guaranteed', text: 'Book directly with us and get the best available rate.' },
          { icon: '🛎️', title: '24hr Room Service', text: 'Round-the-clock service so your comfort is never compromised.' },
          { icon: '☕', title: 'Free Breakfast Option', text: 'Add a traditional Ethiopian breakfast to any room booking.' }
        ].map((perk, idx) => (
          <AnimatedCard key={idx} index={idx} animation="fade-up" baseDelay={0} staggerMs={120}
            className="py-10 px-8 text-center border-r border-border-gold/10 last:border-0 hover:bg-gold/[0.03] transition-colors duration-300">
            <AnimatedText tag="span" animation="scale" delay={idx * 120 + 100} className="text-3xl mb-3.5 block">{perk.icon}</AnimatedText>
            <AnimatedText animation="fade-up" delay={idx * 120 + 200} className="font-cinzel text-[10px] tracking-[2px] text-gold uppercase mb-2 font-semibold">{t(perk.title)}</AnimatedText>
            <AnimatedText tag="p" animation="fade-up" delay={idx * 120 + 300} className="text-[11px] text-white-dim leading-relaxed font-montserrat">{t(perk.text)}</AnimatedText>
          </AnimatedCard>
        ))}
      </div>

      {/* ─── ROOM DETAIL MODAL ─── */}
      {activeModalRoom && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fadeIn"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.88)', backdropFilter: 'blur(8px)' }}
        >
          {/* Backdrop Click */}
          <div
            className="absolute inset-0 w-full h-full cursor-pointer"
            onClick={handleCloseModal}
          />

          {/* Modal Container */}
          <div
            className="bg-dark-2 w-full max-w-[760px] max-h-[85vh] md:h-[470px] flex flex-col md:flex-row relative rounded-sm shadow-2xl z-10 border border-border-gold/30 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-2.5 right-2.5 bg-gold text-black w-7 h-7 text-xs flex items-center justify-center hover:bg-gold-light transition-colors z-30 font-bold rounded-sm shadow-lg cursor-pointer"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Left Column: Image */}
            <div className="relative w-full md:w-[45%] h-36 sm:h-44 md:h-full overflow-hidden shrink-0">
              <img
                src={getFirstImage(activeModalRoom.images, 'room')}
                alt={t(activeModalRoom.name)}
                className="w-full h-full object-cover block"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-2/80 via-transparent to-transparent md:hidden" />
            </div>

            {/* Right Column: Details & Fixed CTA */}
            <div className="w-full md:w-[55%] flex-1 min-h-0 p-4 sm:p-5 md:p-6 flex flex-col justify-between overflow-hidden bg-dark-2">
              {/* Inner Scrollable Info */}
              <div className="overflow-y-auto pr-1.5 space-y-3 flex-1 min-h-0 custom-scrollbar">
                <div>
                  <div className="text-[9px] tracking-[3px] uppercase text-gold mb-0.5 block font-montserrat font-bold">
                    {t(activeModalRoom.type)}
                  </div>
                  <h2 className="font-cormorant text-xl md:text-2xl font-bold text-white mb-1 leading-tight">
                    {t(activeModalRoom.name)}
                  </h2>
                  <div className="gold-line" style={{ margin: '6px 0 10px' }} />
                </div>

                <p className="text-[11.5px] leading-relaxed text-white-dim font-montserrat">
                  {t(activeModalRoom.description)}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: '📐', val: activeModalRoom.size, lbl: 'Room Size' },
                    { icon: '👥', val: `${activeModalRoom.capacity} Guests`, lbl: 'Capacity' },
                    { icon: '🛏️', val: t(activeModalRoom.bed), lbl: 'Bed Type' },
                    { icon: '🌆', val: t(activeModalRoom.view || 'Standard View'), lbl: 'View' }
                  ].map((spec, i) => (
                    <div key={i} className="p-2 bg-dark-3 text-center rounded-sm border border-border-gold/10">
                      <div className="text-xs mb-0.5">{spec.icon}</div>
                      <div className="font-cinzel text-[9.5px] text-gold tracking-wide font-semibold">{t(spec.val)}</div>
                      <div className="text-[7.5px] text-white-dim/60 font-montserrat mt-0.5 uppercase tracking-wider">{t(spec.lbl)}</div>
                    </div>
                  ))}
                </div>

                {activeModalRoom.amenities && activeModalRoom.amenities.length > 0 && (
                  <div>
                    <div className="font-cinzel text-[8.5px] tracking-[2px] text-gold mb-1 uppercase font-semibold">
                      {t('ROOM AMENITIES')}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {activeModalRoom.amenities.map((amenity, i) => (
                        <span key={i} className="text-[8.5px] py-0.5 px-1.5 border border-border-gold/25 text-white-dim rounded-sm font-montserrat">
                          {t(amenity)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Bottom Action Bar */}
              <div className="pt-3 border-t border-border-gold/20 shrink-0 bg-dark-2 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[7.5px] tracking-[2px] text-white-dim uppercase font-montserrat font-semibold">{t('Starting from')}</div>
                    <div className="font-cormorant text-xl md:text-2xl text-gold leading-none font-bold">
                      ETB {activeModalRoom.price?.toLocaleString?.() ?? activeModalRoom.price}
                    </div>
                    <div className="text-[8px] text-white-dim font-montserrat mt-0.5">{t('per night · taxes included')}</div>
                  </div>
                  <button
                    onClick={() => {
                      handleCloseModal();
                      navigate(`/rooms/${activeModalRoom._id}`);
                    }}
                    className="text-[9.5px] font-montserrat text-gold-light hover:text-white underline underline-offset-4 font-medium transition-colors"
                  >
                    {t('Full Details →')}
                  </button>
                </div>

                <button
                  onClick={() => handleBookNow(activeModalRoom)}
                  className="btn-primary w-full text-[11px] font-semibold shadow-md justify-center"
                  style={{ padding: '9px 18px' }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <span>{t('Reserve This Room')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Rooms;
