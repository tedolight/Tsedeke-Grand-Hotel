import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionReveal, useScrollReveal } from '../../../hooks/useScrollReveal.js';
import amenityService from '../../../services/amenity/amenityService.js';

const AMENITIES = [
  { image: '/images/custom/hotel-enrtance.jpg', title: 'Grand Entrance', description: 'Iconic hotel entrance with elegant façade and welcoming atmosphere.' },
  { image: '/images/custom/reception-staff.png', title: 'Luxury Lobby', description: 'Stunning lobby with premium décor and warm Ethiopian hospitality.' },
  { image: '/images/custom/restaurant.jpg', title: 'Fine Dining', description: 'Award-winning restaurant serving Ethiopian and international cuisine.' },
  { image: '/images/custom/coffe-bar.jpg', title: 'Coffee Ceremony', description: 'Authentic Ethiopian coffee ceremony experience in a cozy lounge.' },
  { image: '/images/custom/unnamed_3.png', title: 'Event Halls', description: 'Four versatile venues for weddings, conferences, and private events.' },
  { image: '/images/custom/Lobby bar.jpg', title: 'Lobby Bar', description: 'Elegant bar with fine spirits and live Ethiopian music evenings.' },
  { image: '/images/custom/parking.jpg', title: 'Secure Parking', description: 'Complimentary parking with 24-hour security and valet service.' },
  { image: '/images/custom/sport-view.jpg', title: 'Sport & Fitness', description: 'Modern sports facilities and fitness center for active guests.' },
];

const AmenitiesSection = () => {
  const { t } = useTranslation();
  const heading = useSectionReveal('sr-fade-up');
  const grid = useSectionReveal('stagger-children', { threshold: 0.1 });
  const [amenitiesData, setAmenitiesData] = useState(AMENITIES);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await amenityService.getAmenities();
        const items = Array.isArray(response) ? response : (response?.data || []);
        if (items.length > 0) {
          setAmenitiesData(items);
        }
      } catch (error) {
        console.error('Failed to fetch amenities:', error);
      }
    };
    fetchAmenities();
  }, []);

  return (
    <section className="py-24 px-6 md:px-15 bg-dark relative overflow-hidden ambient-grid">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Heading */}
        <div ref={heading.ref} className={`text-center mb-16 ${heading.className}`}>
          <span className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">
            {t('Hotel Facilities')}
          </span>
          <h2 className="text-4xl md:text-5xl font-cormorant font-bold">{t('World-Class Amenities')}</h2>
          <div className="gold-line center" />
        </div>

        {/* Grid with stagger */}
        <div ref={grid.ref} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${grid.className}`}>
          {amenitiesData.map((a, i) => (
            <div key={a._id || i} className="premium-card text-center group gold-corner overflow-hidden flex flex-col">
              <div className="w-full h-56 overflow-hidden relative border-b border-gold/20">
                <img
                  src={a.image}
                  onError={(e) => { e.target.onerror = null; e.target.src = a.fallback || '/images/placeholder.jpg'; }}
                  alt={t(a.title)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
              <div className="p-8 flex flex-col flex-grow justify-center">
                <h4 className="font-cinzel text-[11px] tracking-[2px] uppercase text-gold mb-2 font-semibold group-hover:text-gold-light transition-colors">
                  {t(a.title)}
                </h4>
                <p className="text-[12px] text-white-dim font-montserrat leading-relaxed">{t(a.description)}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AmenitiesSection;
