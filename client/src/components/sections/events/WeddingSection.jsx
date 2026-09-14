import { useTranslation } from 'react-i18next';
import React from 'react';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../ui/AnimatedSection.jsx';

const WeddingSection = () => {
  const { t } = useTranslation();
  return (

  <section className="py-24 px-6 md:px-15 bg-dark">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <AnimatedSection animation="fade-right" className="relative">
        <img src="/images/custom/7.jpg" alt={t('Wedding Venue')} className="w-full h-[500px] object-cover brightness-80" />
        <div className="absolute -bottom-6 -right-6 bg-gold p-6 text-black text-center shadow-lg">
          <div className="font-cormorant text-4xl font-light leading-none">500+</div>
          <div className="text-[9px] tracking-[2px] uppercase font-bold mt-1">{t('Weddings Hosted')}</div>
        </div>
      </AnimatedSection>
      <div className="space-y-6">
        <div>
          <AnimatedText tag="span" animation="fade-down" className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('Weddings at Tsedeke Grand')}</AnimatedText>
          <AnimatedText tag="h2" animation="fade-up" delay={100} className="text-3xl md:text-5xl font-cormorant font-light mb-4 leading-tight">{t('Your Dream Wedding')} <span className="italic text-gold-light">{t('Awaits')}</span></AnimatedText>
          <div className="gold-line" />
          <AnimatedText tag="p" animation="fade-up" delay={200} className="text-[14px] text-white-dim font-montserrat leading-relaxed">{t('From intimate ceremonies to grand receptions, Tsedeke Grand Hotel creates the perfect backdrop for your love story. Our dedicated wedding planners ensure every detail is flawlessly executed.')}</AnimatedText>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '👗', title: 'Bridal Suite', desc: 'Luxury preparation room' },
            { icon: '🌸', title: 'Floral Design', desc: 'Custom arrangements' },
            { icon: '🎵', title: 'Live Music', desc: 'Orchestra & DJ options' },
            { icon: '📸', title: 'Photography', desc: 'Professional service' },
          ].map((f, i) => (
            <AnimatedCard key={i} index={i} animation="scale" className="bg-dark-2 p-4 border border-border-gold/15">
              <div className="text-xl mb-2">{f.icon}</div>
              <div className="font-cinzel text-[10px] tracking-[2px] text-gold uppercase font-semibold">{t(f.title)}</div>
              <div className="text-[11px] text-white-dim font-montserrat mt-1">{t(f.desc)}</div>
            </AnimatedCard>
          ))}
        </div>
        <AnimatedSection animation="scale" delay={300}>
          <a href="/contact" className="btn-primary inline-block"><span>{t('Plan Your Wedding')}</span></a>
        </AnimatedSection>
      </div>
    </div>
  </section>

  );
};

export default WeddingSection;
