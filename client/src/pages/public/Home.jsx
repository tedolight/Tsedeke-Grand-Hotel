import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import HeroSection from '../../components/sections/home/HeroSection.jsx';
import StatsSection from '../../components/sections/home/StatsSection.jsx';
import RoomsPreview from '../../components/sections/home/RoomsPreview.jsx';
import RestaurantPreview from '../../components/sections/home/RestaurantPreview.jsx';
import EventsPreview from '../../components/sections/home/EventsPreview.jsx';
import GalleryPreview from '../../components/sections/home/GalleryPreview.jsx';
import AmenitiesSection from '../../components/sections/home/AmenitiesSection.jsx';
import TestimonialsSection from '../../components/sections/home/TestimonialsSection.jsx';
import CTASection from '../../components/sections/home/CTASection.jsx';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '../../store/settings/settingsStore.js';
import { AnimatedSection, AnimatedText } from '../../components/ui/AnimatedSection.jsx';

const Home = () => {
  const { t } = useTranslation();
  const { hotelSettings } = useSettingsStore();
  const establishedYear = hotelSettings.establishedYear || 2024;
  const yearsOfExcellence = new Date().getFullYear() - establishedYear;

  usePageMeta(
    t('Home'),
    t('Welcome to {{hotelName}} — a luxury sanctuary in {{city}}, Ethiopia. Book rooms, explore our restaurant, events, and more.', {
      hotelName: hotelSettings.hotelName || 'Tsedeke Grand Hotel',
      city: hotelSettings.city || 'Hossana',
    })
  );
  const { setCursorHovered } = useUiStore();
  const hover = {
    onMouseEnter: () => setCursorHovered(true),
    onMouseLeave: () => setCursorHovered(false),
  };

  return (
    <div className="home-page select-none">
      <HeroSection />
      <StatsSection />

      {/* ── About / Story teaser ── */}
      <section className="py-24 px-6 md:px-15 bg-dark overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Image — slides in from left */}
          <AnimatedSection animation="fade-right" delay={0}
            className="relative max-w-lg mx-auto lg:mx-0 w-full">
            <img
              className="w-full h-[520px] object-cover block shadow-2xl"
              src="/images/custom/1.jpg"
              alt={t('Lobby Area')}
            />
            <div className="absolute -top-2 -left-2 sm:-top-[15px] sm:-left-[15px] right-2 sm:right-[15px] bottom-2 sm:bottom-[15px] border border-gold/30 pointer-events-none" />
            <div className="absolute -bottom-3 -right-3 sm:-bottom-5 sm:-right-5 w-24 h-24 sm:w-28 sm:h-28 bg-gold flex flex-col items-center justify-center shadow-lg animate-gold-glow rounded">
              <span className="text-2xl sm:text-3xl font-cormorant text-black font-light leading-none">{yearsOfExcellence}+</span>
              <span className="text-[8px] tracking-[2px] uppercase text-black font-bold text-center mt-1">{t('YEARS OF EXCELLENCE')}</span>
            </div>
          </AnimatedSection>

          {/* Text block — each line animates independently */}
          <div>
            <AnimatedText tag="span" animation="fade-left" delay={150}
              className="text-[10px] tracking-[4px] uppercase text-gold mb-4.5 block font-semibold font-montserrat">
              {t('Heritage & Sanctuary')}
            </AnimatedText>
            <AnimatedText tag="h2" animation="fade-up" delay={250}
              className="text-3xl md:text-5xl font-cormorant font-bold leading-tight mb-5">
              {t('A Haven of Comfort in')}{' '}
              <span className="italic text-gold-light font-bold">{hotelSettings.city || 'Hossana'}</span>
            </AnimatedText>
            <AnimatedText tag="p" animation="fade-up" delay={380}
              className="text-[14px] leading-relaxed text-white-dim mb-8 font-montserrat max-w-lg">
              {hotelSettings.description || t('Tsedeke Grand Hotel sets the standard for refined luxury and authentic Ethiopian hospitality. Located dynamically in the heart of Hossana City, we provide a peaceful escape for business executives, event hosts, and travelers seeking tranquility and premium service.')}
            </AnimatedText>
            <AnimatedSection animation="scale" delay={500}>
              <Link to="/about" className="btn-outline" {...hover}>
                <span>{t('Learn Our Story')}</span>
              </Link>
            </AnimatedSection>
          </div>

        </div>
      </section>

      <RoomsPreview />
      <AmenitiesSection />
      <EventsPreview />
      <RestaurantPreview />
      <GalleryPreview />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
};

export default Home;
