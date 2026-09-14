import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../../store/ui/themeStore.js';
import { useTranslation } from 'react-i18next';
import { useSectionReveal } from '../../../hooks/useScrollReveal.js';

const CTASection = ({
  title = 'Experience Tsedeke Grand',
  subtitle = 'Join us for an extraordinary stay filled with premium service, luxurious amenities, and rich local culture.',
  image = '/images/custom/5.jpg',
}) => {
  const { setCursorHovered } = useUiStore();
  const { t } = useTranslation();
  const hover = { onMouseEnter: () => setCursorHovered(true), onMouseLeave: () => setCursorHovered(false) };
  const content = useSectionReveal('sr-scale', { threshold: 0.2 });

  return (
    <section className="relative py-32 px-6 md:px-15 text-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${image}')` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.15)' }} />

      <div
        ref={content.ref}
        className={`cta-content relative z-10 max-w-2xl mx-auto ${content.className}`}
      >
        <h2 className="text-3xl md:text-5xl font-cormorant font-light mb-4" style={{ color: '#FFFFFF', textShadow: '0 2px 16px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.8)' }}>{t(title)}</h2>
        <div className="gold-line center" />
        <p className="text-[14px] leading-relaxed mb-10 max-w-[500px] mx-auto font-montserrat" style={{ color: '#FFFFFF', textShadow: '0 1px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)' }}>{t(subtitle)}</p>
        <div className="flex flex-wrap gap-5 justify-center">
          <Link to="/booking" className="btn-primary hero-btn-pop" {...hover}><span>{t('Book Reservation')}</span></Link>
          <Link to="/contact" className="btn-outline hero-btn-pop" {...hover}><span>{t('Contact Concierge')}</span></Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
