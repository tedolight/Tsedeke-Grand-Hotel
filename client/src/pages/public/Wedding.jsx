import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';
import WeddingSection from '../../components/sections/events/WeddingSection.jsx';
import EventEnquiry from '../../components/sections/events/EventEnquiry.jsx';
import { useTranslation } from 'react-i18next';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../components/ui/AnimatedSection.jsx';

const Wedding = () => {
  const { setCursorHovered } = useUiStore();
  const { t, i18n } = useTranslation();

  return (
    <div className="wedding-page select-none">
      {/* Hero */}
      <div className="relative h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 brightness-[0.6]" style={{ backgroundImage: `var(--hero-overlay-dark), url('/images/custom/8.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="page-hero relative z-10 text-center px-6">
          <AnimatedText tag="span" animation="fade-down" delay={100} className="text-[10px] tracking-[6px] uppercase text-gold mb-5 block font-montserrat">{t('Weddings at Tsedeke Grand')}</AnimatedText>
          <AnimatedText tag="h1" animation="fade-up" delay={300} className="text-3xl md:text-5xl font-cormorant font-light text-white leading-tight">
            {t('Your Dream')} <em className="text-gold-light">{t('Wedding')}</em>
          </AnimatedText>
          <AnimatedText tag="p" animation="fade-up" delay={500} className="mt-4 text-[13px] text-white-dim font-cormorant italic tracking-wide">{t('Where love stories become timeless memories')}</AnimatedText>
          <AnimatedSection animation="scale" delay={700} className="mt-8 flex gap-5 justify-center flex-wrap">
            <Link to="/contact" className="btn-primary" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}><span>{t('Plan My Wedding')}</span></Link>
          </AnimatedSection>
        </div>
      </div>

      <WeddingSection />

      {/* Testimonial */}
      <section className="py-20 px-6 md:px-15 bg-black text-center">
        <div className="max-w-2xl mx-auto">
          <AnimatedText tag="div" className="text-6xl font-cormorant text-gold/20 leading-none mb-4">"</AnimatedText>
          <AnimatedText tag="p" animation="fade-up" className="font-cormorant text-xl italic text-white-dim leading-relaxed mb-6">
            {t('Tsedeke Grand Hotel made our wedding day absolutely perfect. Every detail was handled with such care and professionalism. Our guests are still talking about the beautiful venue and the incredible food!')}
          </AnimatedText>
          <AnimatedText tag="div" animation="scale" delay={200} className="text-gold text-sm tracking-[4px]">★★★★★</AnimatedText>
          <AnimatedText tag="div" animation="fade-up" delay={300} className="font-cinzel text-[11px] text-gold tracking-[2px] mt-3 font-semibold">{t('SARAH & MICHAEL')}</AnimatedText>
          <AnimatedText tag="div" animation="fade-up" delay={400} className="text-[10px] text-white-dim/40 mt-1 font-montserrat">{t('Wedding, March 2025')}</AnimatedText>
        </div>
      </section>

      <EventEnquiry />
    </div>
  );
};

export default Wedding;

