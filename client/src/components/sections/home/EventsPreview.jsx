import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../../store/ui/themeStore.js';
import { useTranslation } from 'react-i18next';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../ui/AnimatedSection.jsx';

const EVENTS = [
  { title: 'Grand Weddings', desc: 'Unforgettable ceremonies in our elegantly decorated ballroom for up to 500 guests.', img: '/images/custom/8.jpg' },
  { title: 'Conference & Business', desc: 'Modern conference halls with AV equipment and high-speed internet for up to 200 delegates.', img: '/images/custom/1.jpg' },
  { title: 'Private Celebrations', desc: 'Birthdays, anniversaries, and private dinners tailored to your vision and requirements.', img: '/images/custom/4.jpg' },
];

const EventsPreview = () => {
  const { setCursorHovered } = useUiStore();
  const { t } = useTranslation();
  const hover = { onMouseEnter: () => setCursorHovered(true), onMouseLeave: () => setCursorHovered(false) };

  return (
    <section className="py-24 px-6 md:px-15 bg-dark">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-5">
          <div>
            <AnimatedText tag="span" animation="fade-left" delay={0}
              className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">
              {t('Unforgettable Events')}
            </AnimatedText>
            <AnimatedText tag="h2" animation="fade-up" delay={100}
              className="text-3xl md:text-5xl font-cormorant font-bold text-white leading-tight">
              {t('Events & Celebrations')}
            </AnimatedText>
          </div>
          <AnimatedSection animation="fade-right" delay={200}>
            <Link to="/events" className="btn-outline" {...hover}><span>{t('All Events')}</span></Link>
          </AnimatedSection>
        </div>

        {/* Cards — each animates independently with stagger */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EVENTS.map((ev, i) => (
            <AnimatedCard key={i} index={i} animation="flip-up" baseDelay={100} staggerMs={150}
              className="premium-card overflow-hidden group gold-corner" {...hover}>
              <div className="relative h-56 overflow-hidden">
                <img src={ev.img} alt={t(ev.title)}
                  className="w-full h-full object-cover group-hover:scale-108 brightness-95 transition-all duration-700"
                  style={{ imageRendering: 'auto' }} />
              </div>
              <div className="p-6">
                <AnimatedText tag="h3" animation="fade-up" delay={i * 80 + 200}
                  className="font-cormorant text-2xl font-light text-white mb-2 group-hover:text-gold transition-colors">
                  {t(ev.title)}
                </AnimatedText>
                <AnimatedText tag="p" animation="fade-up" delay={i * 80 + 320}
                  className="text-[12px] text-white-dim font-montserrat leading-relaxed">
                  {t(ev.desc)}
                </AnimatedText>
              </div>
            </AnimatedCard>
          ))}
        </div>

      </div>
    </section>
  );
};

export default EventsPreview;
