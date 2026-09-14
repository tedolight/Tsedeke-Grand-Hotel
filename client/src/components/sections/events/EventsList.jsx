import { useTranslation } from 'react-i18next';
import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../../store/ui/themeStore.js';

const EVENTS = [
  { title: 'Grand Weddings', category: 'Weddings', capacity: '500', description: 'Celebrate your special day in our elegantly decorated ballroom. From intimate ceremonies to grand receptions, we create unforgettable memories.', img: '/images/custom/8.jpg' },
  { title: 'Corporate Conferences', category: 'Corporate', capacity: '200', description: 'State-of-the-art conference facilities with full AV support, high-speed internet, and professional catering services.', img: '/images/custom/1.jpg' },
  { title: 'Banquet & Gala Dinners', category: 'Banquet', capacity: '300', description: 'Exquisite banquet experiences with gourmet menus, impeccable service, and a stunning venue designed to impress.', img: '/images/custom/4.jpg' },
  { title: 'Cultural Events', category: 'Cultural', capacity: '250', description: 'Host cultural exhibitions, heritage celebrations, and community events in our versatile spaces.', img: '/images/custom/5.jpg' },
];

const EventsList = () => {
  const { t } = useTranslation();

  const { setCursorHovered } = useUiStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {EVENTS.map((ev, i) => (
        <div
          key={i}
          className="bg-dark-2 border border-border-gold/15 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
          onMouseEnter={() => setCursorHovered(true)}
          onMouseLeave={() => setCursorHovered(false)}
        >
          <div className="relative h-52 overflow-hidden">
            <img src={ev.img} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
            <div className="absolute top-3 right-3 bg-gold/90 text-black font-cinzel text-[9px] tracking-[2px] py-1 px-3 font-semibold">{ev.category}</div>
          </div>
          <div className="p-7">
            <h3 className="font-cormorant text-2xl font-light text-white mb-2 group-hover:text-gold transition-colors">{ev.title}</h3>
            <p className="text-[12px] text-white-dim font-montserrat leading-relaxed mb-4">{ev.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white-dim/60 font-montserrat">👥 Up to {ev.capacity} guests</span>
              <Link to="/contact" className="text-[10px] text-gold hover:text-gold-light font-cinzel tracking-widest transition-colors">
                {t('Enquire →')}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsList;
