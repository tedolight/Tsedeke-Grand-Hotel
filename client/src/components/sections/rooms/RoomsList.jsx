import { useTranslation } from 'react-i18next';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useUiStore from '../../../store/ui/themeStore.js';
import { useScrollReveal } from '../../../hooks/useScrollReveal.js';
import { getFirstImage } from '../../../utils/helpers/imageHelpers.js';

const RoomCard = ({ room, index }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCursorHovered } = useUiStore();
  const { ref, visible } = useScrollReveal({ threshold: 0.1 });
  const isVip = room.type?.toLowerCase() === 'vip';
  const delay = Math.min(index % 3, 2) * 120;

  return (
    <div
      ref={ref}
      className={`sr-base sr-scale${visible ? ' sr-visible' : ''} group relative bg-gradient-to-b from-dark-2/95 via-dark-2 to-dark-3 border border-border-gold/20 rounded-md overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(212,175,55,0.12)] ${isVip ? 'md:col-span-2 xl:col-span-3 md:flex-row' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`relative overflow-hidden ${isVip ? 'md:w-1/2 min-h-[300px]' : 'h-[200px] sm:h-[215px] w-full'}`}>
        {room.badge && (
          <span className="absolute top-3 left-3 bg-gold/90 text-black font-cinzel text-[9px] tracking-[2px] py-0.5 px-2.5 z-10 font-bold uppercase rounded shadow-lg backdrop-blur-sm">
            {room.badge}
          </span>
        )}
        <img
          src={getFirstImage(room.images, 'room')}
          alt={room.name}
          className="w-full h-full object-cover block brightness-[0.88] group-hover:scale-108 group-hover:brightness-100 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-2 via-dark-2/20 to-transparent pointer-events-none opacity-80 group-hover:opacity-40 transition-opacity duration-500" />
      </div>

      <div className={`p-4 sm:p-5 flex flex-col flex-1 ${isVip ? 'md:w-1/2 justify-center p-6 lg:p-10' : ''}`}>
        <div className="flex-1">
          <span className="text-gold text-[9.5px] tracking-[2.5px] uppercase mb-1.5 flex items-center gap-1.5 font-montserrat font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
            {room.type}
          </span>
          <h2 className="font-cormorant text-xl md:text-2xl font-bold leading-tight mb-2 text-white group-hover:text-gold-light transition-colors duration-300">{room.name}</h2>
          <p className={`text-[11.5px] leading-relaxed text-white-dim/80 mb-3.5 font-montserrat ${isVip ? '' : 'line-clamp-2'}`}>
            {room.description}
          </p>

          <div className="grid grid-cols-3 gap-1.5 p-2 bg-white/[0.02] border border-gold/10 rounded mb-3.5">
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[11px] mb-0.5 opacity-80">📐</span>
              <span className="text-[9.5px] text-gold font-cinzel font-semibold tracking-wider">{room.size}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center border-x border-gold/10">
              <span className="text-[11px] mb-0.5 opacity-80">👥</span>
              <span className="text-[9.5px] text-gold font-cinzel font-semibold tracking-wider">Max {room.capacity}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[11px] mb-0.5 opacity-80">🛏️</span>
              <span className="text-[9.5px] text-gold font-cinzel font-semibold tracking-wider">{room.bed}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gold/15 mt-auto flex items-center justify-between gap-2.5">
          <div className="min-w-[100px]">
            <div className="text-[7.5px] tracking-[1.5px] uppercase text-white-dim/70 font-montserrat mb-0.5 font-semibold">{t('From')}</div>
            <div className="font-cormorant text-xl md:text-2xl text-gold font-bold leading-none">ETB {room.price?.toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              onClick={() => navigate(`/rooms/${room._id}`)}
              className="px-3.5 py-2 rounded text-[10px] font-cinzel tracking-wider text-gold-light border border-gold/30 hover:border-gold hover:bg-gold/10 transition-all font-semibold uppercase whitespace-nowrap cursor-pointer"
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
            >
              {t('Details')}
            </button>
            <button
              onClick={() => navigate(`/booking?roomId=${room._id}`)}
              className="px-4 py-2 rounded text-[10px] font-cinzel tracking-wider bg-gold text-black hover:bg-gold-light transition-all font-bold uppercase whitespace-nowrap shadow-md hover:shadow-gold/20 cursor-pointer"
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
            >
              {t('Book Now')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoomsList = ({ rooms = [] }) => {
  const { t } = useTranslation();

  if (!rooms.length) return (
    <div className="text-center py-16 text-white-dim font-montserrat">{t('No rooms match your criteria.')}</div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {rooms.map((room, i) => (
        <RoomCard key={room._id} room={room} index={i} />
      ))}
    </div>
  );
};

export default RoomsList;
