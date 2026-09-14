import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUiStore from '../../../store/ui/themeStore.js';
import { Card } from '../shadcn/card.jsx';
import { Badge } from '../shadcn/badge.jsx';
import { Button } from '../shadcn/button.jsx';
import { Maximize2, Users, BedDouble, Compass, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../../../utils/helpers/imageHelpers.js';

const RoomDetailCard = ({ room }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCursorHovered } = useUiStore();

  return (
    <Card
      className="bg-[#121722] border-[#273244] grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-xl p-0"
      onMouseEnter={() => setCursorHovered(true)}
      onMouseLeave={() => setCursorHovered(false)}
    >
      <div className="relative min-h-[340px]">
        <img
          src={getImageUrl(room.images?.[0]) || '/images/custom/5.jpg'}
          alt={room.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/custom/5.jpg';
          }}
          className="w-full h-full object-cover"
        />
        {room.badge && (
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="gold" className="shadow-lg backdrop-blur-md">
              {room.badge}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-8 md:p-10 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shadow-[0_0_8px_#F59E0B]" />
            <span className="text-amber-400 text-[10px] tracking-[4px] uppercase font-montserrat font-bold">
              {room.type}
            </span>
          </div>

          <h2 className="font-cormorant text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            {room.name}
          </h2>

          <div className="h-[1px] w-20 bg-gradient-to-r from-amber-400 to-transparent mb-4" />

          <p className="text-[13px] text-neutral-300 font-montserrat leading-relaxed mb-6">
            {room.description}
          </p>

          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {[
              { icon: <Maximize2 className="w-4 h-4 text-amber-400" />, val: room.size, lbl: 'Size' },
              { icon: <Users className="w-4 h-4 text-amber-400" />, val: `${room.capacity} Guests`, lbl: 'Capacity' },
              { icon: <BedDouble className="w-4 h-4 text-amber-400" />, val: room.bed, lbl: 'Bed' },
              { icon: <Compass className="w-4 h-4 text-amber-400" />, val: room.view || 'City View', lbl: 'View' },
            ].map((s, i) => (
              <div key={i} className="bg-[#0D121C] border border-[#232D3F] p-3 rounded-xl text-center">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className="font-cinzel text-xs text-amber-200 font-bold">{s.val}</div>
                <div className="text-[10px] text-neutral-400 font-montserrat">{s.lbl}</div>
              </div>
            ))}
          </div>

          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {room.amenities.map((a, i) => (
                <Badge key={i} variant="outline" className="text-[10px] text-neutral-300 border-[#2B374A]">
                  {a}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-[#232D3F]">
          <div>
            <div className="text-[8px] tracking-widest text-neutral-400 uppercase font-montserrat font-semibold">
              {t('From')}
            </div>
            <div className="font-cormorant text-3xl md:text-4xl text-amber-300 leading-none font-bold">
              ETB {room.price?.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-400 font-montserrat">{t('per night')}</div>
          </div>

          <Button
            type="button"
            variant="luxury"
            size="lg"
            onClick={() => navigate(`/booking?roomId=${room._id}`)}
            className="gap-2"
          >
            <span>{t('Reserve Now')}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RoomDetailCard;
