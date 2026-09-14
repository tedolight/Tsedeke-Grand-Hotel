import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';
import CoffeeMenu from '../../components/sections/restaurant/CoffeeMenu.jsx';
import { useTranslation } from 'react-i18next';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../components/ui/AnimatedSection.jsx';

const CoffeeBar = () => {
  const { setCursorHovered } = useUiStore();
  const { t, i18n } = useTranslation();

  return (
    <div className="coffee-bar-page select-none">
      {/* Hero */}
      <div className="relative h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `var(--hero-gradient), url('/images/custom/coffe-bar.jpg')` }} />
        <div className="page-hero relative z-10 text-center px-4 sm:px-6">
          <AnimatedText tag="span" animation="fade-down" delay={100} className="text-[10px] tracking-[6px] uppercase text-gold mb-5 block font-montserrat">☕ {t('Coffee Lounge')}</AnimatedText>
          <AnimatedText tag="h1" animation="fade-up" delay={300} className="text-3xl md:text-5xl font-cormorant font-light text-white leading-tight">{t('The Art of')} <em className="text-gold-light">{t('Ethiopian Coffee')}</em></AnimatedText>
          <AnimatedText tag="p" animation="fade-up" delay={500} className="mt-4 text-[12px] text-white-dim/70 font-montserrat tracking-widest">{t('Open Daily · 7:00 AM – 10:00 PM')}</AnimatedText>
        </div>
      </div>

      {/* Story Section */}
      <section className="py-20 px-6 md:px-15 bg-dark grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-4">
          <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('Ethiopia, Birthplace of Coffee')}</AnimatedText>
          <AnimatedText tag="h2" animation="fade-up" delay={200} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-4">{t('A Ritual, Not Just a Drink')}</AnimatedText>
          <AnimatedSection animation="scale" delay={300} className="gold-line" />
          <AnimatedText tag="p" animation="fade-up" delay={400} className="text-[14px] text-white-dim font-montserrat leading-relaxed mb-5">{t('The Ethiopian coffee ceremony, known as "Bunna", is a sacred ritual of hospitality stretching back centuries. At Tsedeke Grand Coffee Lounge, we honor this tradition while offering the finest specialty coffees from Ethiopia\'s legendary coffee regions: Yirgacheffe, Sidama, and Guji.')}</AnimatedText>
          <AnimatedText tag="p" animation="fade-up" delay={500} className="text-[14px] text-white-dim font-montserrat leading-relaxed">{t('Our beans are sourced directly from local farmers, roasted in-house, and brewed by our trained baristas to deliver an unparalleled coffee experience.')}</AnimatedText>
        </div>
        <AnimatedSection animation="fade-left" className="relative h-[420px] overflow-hidden">
          <img src="/images/custom/cafe.jpg" alt={t('Ethiopian Coffee')} className="w-full h-full object-cover brightness-95" style={{ imageRendering: 'auto' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </AnimatedSection>
      </section>

      {/* Coffee Ceremony Experience */}
      <section className="py-16 px-6 md:px-15 bg-dark-2">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <AnimatedText tag="h2" animation="fade-up" className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-4">{t('The Ceremony Experience')}</AnimatedText>
          <AnimatedSection animation="scale" delay={200} className="gold-line center" />
          <AnimatedText tag="p" animation="fade-up" delay={300} className="text-[14px] text-white-dim font-montserrat">{t('Book the full traditional coffee ceremony: a three-round experience with freshly roasted beans, incense, and popcorn. ETB 120 per person.')}</AnimatedText>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Abol (First Round)', desc: 'The strongest cup. Pure, black, aromatic. The spiritual beginning of the ceremony.' },
            { step: '02', title: 'Tona (Second Round)', desc: 'Slightly lighter, representing reflection. Traditionally shared with neighbors and family.' },
            { step: '03', title: 'Baraka (Third Round)', desc: 'The blessing cup. Lightest and symbolic of good fortune and farewell.' },
          ].map((step, i) => (
            <AnimatedCard key={i} index={i} animation="flip-up" className="premium-card p-8 text-center group">
              <div className="font-cormorant text-4xl text-gold/30 font-light mb-3">{step.step}</div>
              <h4 className="font-cinzel text-[11px] tracking-[2px] uppercase text-gold mb-3 font-semibold">{t(step.title)}</h4>
              <p className="text-[12px] text-white-dim font-montserrat leading-relaxed">{t(step.desc)}</p>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* Menu */}
      <section className="py-16 px-6 md:px-15 bg-black">
        <AnimatedSection animation="fade-up" className="max-w-3xl mx-auto">
          <h2 className="text-center font-cormorant text-2xl md:text-3xl font-light text-gold mb-10 tracking-wide">☕ {t('Full Menu')}</h2>
          <CoffeeMenu />
        </AnimatedSection>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center bg-dark">
        <AnimatedText tag="p" animation="fade-up" className="font-cormorant text-2xl italic text-white-dim mb-6">{t('Visit our coffee lounge, open to all guests')}</AnimatedText>
        <AnimatedSection animation="scale" delay={200}>
          <Link to="/restaurant" className="btn-outline" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}><span>{t('View Full Restaurant')}</span></Link>
        </AnimatedSection>
      </section>
    </div>
  );
};

export default CoffeeBar;

