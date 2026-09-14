import React from 'react';
import { useTranslation } from 'react-i18next';
import { Projector, Wifi, Mic, Coffee, Car, Printer } from 'lucide-react';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../ui/AnimatedSection.jsx';

const FEATURES = [
  { icon: Projector, title: 'HD Projectors & LED Displays', desc: 'State-of-the-art visual presentation equipment' },
  { icon: Wifi,      title: 'High-Speed Fiber WiFi',       desc: 'Dedicated enterprise connection up to 1Gbps' },
  { icon: Mic,       title: 'Professional PA Systems',     desc: 'Crystal-clear acoustic and wireless microphones' },
  { icon: Coffee,    title: 'Executive Catering',          desc: 'Customized coffee breaks, lunches & buffets' },
  { icon: Car,       title: 'Transfer Arrangements',       desc: 'Seamless VIP airport and city transfers' },
  { icon: Printer,   title: 'Business Center',             desc: 'Full printing, copying and scanning support' },
];

const STATS = [
  { val: '4',    lbl: 'Conference Halls' },
  { val: '200+', lbl: 'Max Capacity' },
  { val: '24/7', lbl: 'IT & AV Support' },
];

const ConferenceSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 px-6 md:px-15 bg-dark-2 border-y border-border-gold/15">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

        {/* Left Column: Information & Features (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <AnimatedText
              tag="span"
              animation="fade-down"
              className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat"
            >
              {t('Business Events')}
            </AnimatedText>
            <AnimatedText
              tag="h2"
              animation="fade-up"
              delay={100}
              className="text-3xl md:text-5xl font-cormorant font-light text-white mb-4 leading-tight"
            >
              {t('Conference & Business')} <span className="italic text-gold-light">{t('Solutions')}</span>
            </AnimatedText>
            <div className="gold-line mb-4" />
            <AnimatedText
              tag="p"
              animation="fade-up"
              delay={200}
              className="text-[14px] text-white-dim font-montserrat leading-relaxed"
            >
              {t('Our modern conference facilities are equipped with the latest technology to support productive meetings, workshops, seminars, and corporate events with unmatched hospitality.')}
            </AnimatedText>
          </div>

          {/* 2-Column Aligned Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((item, i) => {
              const IconComp = item.icon;
              return (
                <AnimatedCard
                  key={i}
                  index={i}
                  animation="fade-right"
                  delay={150 + i * 50}
                  className="flex items-start gap-3.5 p-3.5 rounded bg-dark/60 border border-border-gold/10 hover:border-border-gold/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-gold/10 border border-border-gold/25 flex items-center justify-center shrink-0 text-gold mt-0.5">
                    <IconComp size={16} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-cinzel text-white tracking-wide font-medium">
                      {t(item.title)}
                    </h4>
                    <p className="text-[11px] text-white-dim/70 font-montserrat mt-0.5 leading-snug">
                      {t(item.desc)}
                    </p>
                  </div>
                </AnimatedCard>
              );
            })}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {STATS.map((s, i) => (
              <AnimatedCard
                key={i}
                index={i}
                animation="scale"
                className="bg-dark-3/90 border border-border-gold/20 p-4 text-center rounded hover:border-gold/50 transition-all duration-300"
              >
                <div className="font-cormorant text-3xl md:text-4xl text-gold font-light leading-none">
                  {s.val}
                </div>
                <div className="text-[9px] sm:text-[10px] tracking-widest uppercase text-white-dim font-montserrat mt-2">
                  {t(s.lbl)}
                </div>
              </AnimatedCard>
            ))}
          </div>

          {/* Action CTA */}
          <AnimatedSection animation="fade-up" delay={350} className="pt-1">
            <a href="/contact" className="btn-primary inline-block">
              <span>{t('Book Conference Hall')}</span>
            </a>
          </AnimatedSection>
        </div>

        {/* Right Column: Visual Showcase (5 cols) */}
        <AnimatedSection animation="fade-left" className="lg:col-span-5 relative">
          <div className="relative rounded-lg overflow-hidden border border-border-gold/25 shadow-2xl">
            <img
              src="/images/custom/1.jpg"
              alt={t('Conference Hall')}
              className="w-full h-[480px] lg:h-[580px] object-cover brightness-85 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Floating Luxury Accent Badge */}
            <div className="absolute bottom-6 left-6 right-6 p-5 bg-dark-2/95 border border-border-gold/40 backdrop-blur-md rounded shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-cinzel text-xs text-gold uppercase tracking-[2px] font-semibold">
                    {t('Executive Ready')}
                  </div>
                  <div className="text-white text-sm font-cormorant mt-1">
                    {t('Custom seating & stage arrangements available')}
                  </div>
                </div>
                <div className="text-right pl-4 border-l border-border-gold/30">
                  <div className="font-cormorant text-2xl text-gold leading-none">200+</div>
                  <div className="text-[8px] uppercase tracking-wider text-white-dim mt-1 font-montserrat">
                    {t('Guests')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

      </div>
    </section>
  );
};

export default ConferenceSection;

