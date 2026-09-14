import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';
import ConferenceSection from '../../components/sections/events/ConferenceSection.jsx';
import EventEnquiry from '../../components/sections/events/EventEnquiry.jsx';
import { useTranslation } from 'react-i18next';
import { AnimatedSection, AnimatedText } from '../../components/ui/AnimatedSection.jsx';

const Conference = () => {
  const { setCursorHovered } = useUiStore();
  const { t, i18n } = useTranslation();

  return (
    <div className="conference-page select-none">
      {/* Hero */}
      <div className="relative h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 brightness-[0.6]" style={{ backgroundImage: `var(--hero-overlay-dark), url('/images/custom/1.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="page-hero relative z-10 text-center px-4 sm:px-6">
          <AnimatedText tag="span" animation="fade-down" delay={100} className="text-[10px] tracking-[6px] uppercase text-gold mb-5 block font-montserrat">✦ {t('Business Events')}</AnimatedText>
          <AnimatedText tag="h1" animation="fade-up" delay={300} className="text-3xl md:text-5xl font-cormorant font-light text-white leading-tight">{t('Conference &')} <em>{t('Business')}</em></AnimatedText>
          <AnimatedText tag="p" animation="fade-up" delay={500} className="mt-6 text-[11px] tracking-[2px] text-white-dim uppercase font-montserrat">
            <Link to="/" className="text-gold no-underline" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>{t('Home')}</Link>
            {t('&nbsp;/&nbsp;')}
            <Link to="/events" className="text-gold no-underline" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>{t('Events')}</Link>
            &nbsp;/&nbsp; {t('Conference')}
          </AnimatedText>
        </div>
      </div>

      <ConferenceSection />
      <EventEnquiry />
    </div>
  );
};

export default Conference;

