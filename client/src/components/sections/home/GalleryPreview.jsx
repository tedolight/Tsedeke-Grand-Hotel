import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../../store/ui/themeStore.js';
import { useTranslation } from 'react-i18next';
import { AnimatedSection, AnimatedText } from '../../ui/AnimatedSection.jsx';
import { useScrollReveal } from '../../../hooks/useScrollReveal.js';

const GalleryPreview = () => {
  const { setCursorHovered } = useUiStore();
  const { t } = useTranslation();

  const photos = [
    '/images/custom/5.jpg',
    '/images/custom/7.jpg',
    '/images/custom/8.jpg',
    '/images/custom/1.jpg',
    '/images/custom/4.jpg',
    '/images/custom/5.jpg',
  ];

  return (
    <section className="py-24 px-6 md:px-15 bg-black">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12">
          <AnimatedText tag="span" animation="fade-up" delay={0}
            className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">
            {t('Photo Gallery')}
          </AnimatedText>
          <AnimatedText tag="h2" animation="scale" delay={100}
            className="text-3xl md:text-5xl font-cormorant font-bold leading-tight">
            {t('A Glimpse of Tsedeke Grand')}
          </AnimatedText>
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="gold-line center" />
          </AnimatedSection>
        </div>

        {/* Photo grid — each image uses zoom-tilt with column stagger */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-10">
          {photos.map((src, i) => (
            <AnimatedSection
              key={i}
              animation="zoom-tilt"
              delay={i * 90}
              className="relative overflow-hidden h-64 group cursor-pointer"
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
            >
              <img
                src={src}
                alt={`${t('Gallery')} ${i + 1}`}
                className="w-full h-full object-cover brightness-95 group-hover:scale-108 group-hover:brightness-75 transition-all duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-gold text-3xl">⊕</span>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA */}
        <AnimatedSection animation="fade-up" delay={300} className="text-center">
          <Link to="/gallery" className="btn-outline"
            onMouseEnter={() => setCursorHovered(true)}
            onMouseLeave={() => setCursorHovered(false)}>
            <span>{t('View Full Gallery')}</span>
          </Link>
        </AnimatedSection>

      </div>
    </section>
  );
};

export default GalleryPreview;
