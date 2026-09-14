import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUiStore from '../../../store/ui/themeStore.js';
import { Card } from '../shadcn/card.jsx';
import { Badge } from '../shadcn/badge.jsx';
import { Button } from '../shadcn/button.jsx';
import { Users, ArrowRight } from 'lucide-react';

const EventCard = ({ event }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCursorHovered } = useUiStore();

  return (
    <Card
      className="bg-[#121722] border-[#273244] overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/60 hover:shadow-2xl shadow-md flex flex-col justify-between"
      onMouseEnter={() => setCursorHovered(true)}
      onMouseLeave={() => setCursorHovered(false)}
    >
      <div>
        <div className="relative h-56 overflow-hidden">
          <img
            src={event.image || '/images/custom/1.jpg'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 brightness-90 group-hover:brightness-100"
          />
          {event.category && (
            <div className="absolute top-3 right-3">
              <Badge variant="gold" className="shadow-lg">
                {event.category}
              </Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121722] via-transparent to-transparent pointer-events-none opacity-80" />
        </div>

        <div className="p-5">
          <h3 className="font-cormorant text-2xl font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
            {event.title}
          </h3>
          <p className="text-[12px] text-neutral-300 font-montserrat leading-relaxed mb-4 line-clamp-2">
            {event.description}
          </p>

          {event.capacity && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mb-4 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl w-fit">
              <Users className="w-3.5 h-3.5" />
              <span>Up to {event.capacity} guests</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 pt-0">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/events')}
          className="w-full justify-center text-xs h-9 gap-1.5 text-neutral-200 hover:text-amber-200 border-neutral-700"
        >
          <span>{t('Learn More')}</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
};

export default EventCard;
