import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUiStore from '../../../store/ui/themeStore.js';
import { Card } from '../shadcn/card.jsx';
import { Badge } from '../shadcn/badge.jsx';
import { Button } from '../shadcn/button.jsx';
import { BedDouble, Users, Maximize2, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../../../utils/helpers/imageHelpers.js';

const RoomCard = ({ room }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCursorHovered } = useUiStore();

  return (
    <Card
      className="group relative overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:border-amber-400/70 hover:shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(201,168,76,0.2)] bg-gradient-to-b from-[#141A26] via-[#10141E] to-[#0D1018] border-[#C9A84C]/25"
      onMouseEnter={() => setCursorHovered(true)}
      onMouseLeave={() => setCursorHovered(false)}
    >
      <div className="relative h-52 sm:h-56 overflow-hidden">
        {room.badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="gold" className="shadow-lg backdrop-blur-md">
              {room.badge}
            </Badge>
          </div>
        )}
        <img
          src={getImageUrl(room.images?.[0]) || '/images/custom/4.jpg'}
          alt={room.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/custom/4.jpg';
          }}
          className="w-full h-full object-cover block brightness-[0.88] group-hover:scale-108 group-hover:brightness-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10141E] via-transparent to-transparent pointer-events-none opacity-90 group-hover:opacity-60 transition-opacity duration-500" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shadow-[0_0_8px_#F59E0B]" />
            <span className="text-amber-400 text-[10px] tracking-[2.5px] uppercase font-montserrat font-bold">
              {room.type}
            </span>
          </div>

          <h3 className="font-cormorant text-2xl font-bold text-white mb-2 leading-tight group-hover:text-amber-200 transition-colors duration-300">
            {room.name}
          </h3>

          <p className="text-[12px] text-neutral-300 font-montserrat leading-relaxed mb-4 line-clamp-2">
            {room.description}
          </p>

          <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#0A0D14]/70 border border-amber-500/15 rounded-xl mb-4">
            <div className="flex flex-col items-center justify-center text-center">
              <Maximize2 className="w-3.5 h-3.5 text-amber-400 mb-1" />
              <span className="text-[10px] text-amber-200 font-semibold">{room.size || '45 sqm'}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center border-x border-amber-500/15">
              <Users className="w-3.5 h-3.5 text-amber-400 mb-1" />
              <span className="text-[10px] text-amber-200 font-semibold">{room.capacity || 2} Guests</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <BedDouble className="w-3.5 h-3.5 text-amber-400 mb-1" />
              <span className="text-[10px] text-amber-200 font-semibold truncate max-w-[80px]">{room.bed || 'King Bed'}</span>
            </div>
          </div>
        </div>

        <div className="pt-3.5 border-t border-amber-500/20 mt-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[8px] tracking-[1.5px] uppercase text-neutral-400 font-montserrat font-semibold">
              {t('From')}
            </div>
            <div className="font-cormorant text-2xl text-amber-300 font-bold leading-none">
              ETB {room.price?.toLocaleString()}
              <span className="text-[10px] font-montserrat text-neutral-400 font-normal"> / night</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/rooms/${room._id}`)}
              className="text-xs text-neutral-200 hover:text-amber-200 border-neutral-700"
            >
              {t('Details')}
            </Button>
            <Button
              type="button"
              variant="luxury"
              size="sm"
              onClick={() => navigate(`/booking?roomId=${room._id}`)}
              className="text-xs gap-1"
            >
              <span>{t('Book Now')}</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RoomCard;
