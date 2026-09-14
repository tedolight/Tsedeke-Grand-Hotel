import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import useUiStore from '../../../store/ui/themeStore.js';
import useRoomStore from '../../../store/rooms/roomStore.js';
import { getFirstImage } from '../../../utils/helpers/imageHelpers.js';
import { useTranslation } from 'react-i18next';
import { useSectionReveal } from '../../../hooks/useScrollReveal.js';

const RoomsPreview = () => {
  const { setCursorHovered } = useUiStore();
  const { rooms, fetchRooms } = useRoomStore();
  const { t } = useTranslation();
  const hover = { onMouseEnter: () => setCursorHovered(true), onMouseLeave: () => setCursorHovered(false) };

  useEffect(() => { fetchRooms({ isFeatured: true, limit: 4, sort: '-updatedAt' }); }, [fetchRooms]);

  const displayRooms = rooms?.length > 0 ? rooms.slice(0, 4) : [];

  const heading = useSectionReveal('sr-fade-up');
  const cards = useSectionReveal('stagger-children', { threshold: 0.1 });

  return (
    <section className="py-24 px-6 md:px-15 bg-black">

      {/* Heading row */}
      <div
        ref={heading.ref}
        className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-15 gap-5 ${heading.className}`}
      >
        <div>
          <span className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">
            {t('Luxurious Accommodations')}
          </span>
          <h2 className="text-4xl md:text-5xl font-cormorant font-bold text-white">
            {t('Featured Rooms & Suites')}
          </h2>
        </div>
        <Link to="/rooms" className="btn-primary sr-base sr-fade-right sr-delay-300" {...hover}>
          <span>{t('View All Rooms')}</span>
        </Link>
      </div>

      {/* Cards */}
      <div
        ref={cards.ref}
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ${cards.className}`}
      >
        {displayRooms.map((room) => (
          <div key={room._id} className="premium-card relative h-[420px] group gold-corner" {...hover}>
            <img
              src={getFirstImage(room.images, 'room')}
              alt={t(room.name)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            />
            <div className="on-dark-surface absolute inset-0 flex flex-col justify-end p-8">
              <span className="text-gold text-[10px] tracking-[3px] uppercase mb-2 font-montserrat font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{t(room.type)}</span>
              <h3 className="font-cormorant text-2xl md:text-3xl font-bold mb-1.5 text-white group-hover:text-gold transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {t(room.name)}
              </h3>
              <span className="text-[13px] text-white font-montserrat font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {t('From')}
                <strong className="font-cormorant text-xl text-gold-light font-bold ml-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  ETB {room.price?.toLocaleString?.() ?? room.price}
                </strong> / {t('Night')}
              </span>
              <Link
                to={`/rooms/${room._id}`}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold text-black font-cinzel text-[10px] tracking-[2px] px-6 py-3 no-underline opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 font-semibold rounded"
              >
                {t('Book Room')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RoomsPreview;
