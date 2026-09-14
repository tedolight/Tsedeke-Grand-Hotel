import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionReveal } from '../../../hooks/useScrollReveal.js';
import useSettingsStore from '../../../store/settings/settingsStore.js';

// Animated counter hook
function useCountUp(target, duration = 1200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const StatCard = ({ num, suffix, label, animating }) => {
  const count = useCountUp(num, 1400, animating);
  const { t, i18n } = useTranslation();
  return (
    <div className="py-10 px-8 text-center border-b sm:border-b-0 sm:border-r border-border-gold/25 last:border-0 hover:bg-gold/[0.03] transition-colors duration-300">
      <div className="text-5xl font-cormorant font-light text-gold mb-1.5 leading-none">
        {animating ? count : 0}{suffix}
      </div>
      <div className="text-[9px] tracking-[3px] uppercase text-white-dim font-montserrat">{t(label)}</div>
    </div>
  );
};

const StatsSection = () => {
  const ref = useRef(null);
  const [animating, setAnimating] = useState(false);
  const section = useSectionReveal('stagger-children', { threshold: 0.25 });
  const { hotelSettings } = useSettingsStore();

  const STATS = [
    { num: parseInt(hotelSettings.totalRooms) || 38, suffix: '+', label: 'Luxury Rooms & Suites' },
    { num: parseInt(hotelSettings.diningVenuesCount) || 2, suffix: '', label: 'Fine Dining Venues' },
    { num: parseInt(hotelSettings.eventHallsCount) || 3, suffix: '', label: 'Event & Conference Halls' },
    { num: parseInt(hotelSettings.guestSatisfaction) || 99, suffix: '%', label: 'Guest Satisfaction' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animating) {
          setAnimating(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animating]);

  return (
    <section
      ref={(el) => { ref.current = el; section.ref.current = el; }}
      className={`bg-dark-2 border-y border-border-gold grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-0 ${section.className}`}
    >
      {STATS.map((stat, i) => (
        <StatCard key={i} {...stat} animating={animating} />
      ))}
    </section>
  );
};

export default StatsSection;
