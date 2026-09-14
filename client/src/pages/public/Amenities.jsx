import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';
import { useTranslation } from 'react-i18next';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../components/ui/AnimatedSection.jsx';

const Amenities = () => {
  const { setCursorHovered } = useUiStore();
  const { t, i18n } = useTranslation();

  const amenityGroups = [
    {
      category: 'Accommodation',
      items: [
        { icon: '🛏️', name: 'Luxury Bedding', desc: 'Premium Egyptian cotton linens and plush pillows on all beds.' },
        { icon: '🛁', name: 'Premium Bathrooms', desc: 'Marble en-suites with rain showers, jacuzzis in VIP suites.' },
        { icon: '❄️', name: 'Climate Control', desc: 'Individual AC/heating controls in every room.' },
        { icon: '📺', name: 'Smart Entertainment', desc: '4K Smart TV with international channels and streaming apps.' },
        { icon: '📶', name: 'Free High-Speed WiFi', desc: 'Fiber-optic internet throughout property, no time limits.' },
        { icon: '🔒', name: 'In-Room Safe', desc: 'Digital safe with enough space for laptops and valuables.' },
      ]
    },
    {
      category: 'Dining & Beverages',
      items: [
        { icon: '🍽️', name: '24/7 Room Service', desc: 'Full menu available round the clock, including late-night options.' },
        { icon: '🍷', name: 'Mini Bar', desc: 'Stocked mini bar in Deluxe rooms and above.' },
        { icon: '☕', name: 'Coffee Machine', desc: 'In-room espresso machine with Ethiopian premium blend capsules.' },
        { icon: '🥐', name: 'Complimentary Breakfast', desc: 'Full Ethiopian and continental breakfast for all room types.' },
      ]
    },
    {
      category: 'Wellness & Recreation',
      items: [
        { icon: '🏊', name: 'Swimming Pool', desc: 'Temperature-controlled rooftop pool with sunbeds and pool bar.' },
        { icon: '💆', name: 'Spa & Wellness Center', desc: 'Full-service spa with Ethiopian and international treatments.' },
        { icon: '💪', name: 'Fitness Center', desc: '24-hour gym with modern equipment and personal trainer on request.' },
      ]
    },
    {
      category: 'Business & Services',
      items: [
        { icon: '🏢', name: 'Business Center', desc: 'Fully equipped with printers, scanners, and meeting rooms.' },
        { icon: '🛎️', name: 'Concierge Service', desc: '24-hour concierge for tours, reservations, and local assistance.' },
        { icon: '🅿️', name: 'Free Parking', desc: 'Secure underground parking with 24-hour security.' },
        { icon: '🚗', name: 'Airport Transfer', desc: 'Arranged airport pickup and drop-off for all guests.' },
        { icon: '👕', name: 'Laundry Service', desc: 'Same-day laundry and dry cleaning service.' },
      ]
    }
  ];

  return (
    <div className="amenities-page select-none">
      {/* Hero */}
      <div className="page-hero relative h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center brightness-[0.65]" style={{ backgroundImage: `url('/images/custom/parking.jpg')` }} />
        <div className="page-hero-content relative z-10 text-center px-4 sm:px-6">
          <AnimatedText tag="span" animation="fade-down" delay={100} className="hero-3d-badge mb-5 block">{t('✦ Premium Facilities')}</AnimatedText>
          <AnimatedText tag="h1" animation="fade-up" delay={300} className="hero-3d-title text-3xl md:text-5xl leading-tight mb-4">{t('Hotel')} <em className="hero-3d-gold">{t('Amenities')}</em></AnimatedText>
          <AnimatedText tag="p" animation="fade-up" delay={500} className="hero-3d-sub mt-6 text-[12px] tracking-[2.5px] uppercase">
            <Link to="/" className="no-underline" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>{t('Home')}</Link> &nbsp;/&nbsp; {t('Amenities')}
          </AnimatedText>
        </div>
      </div>

      {/* Intro */}
      <section className="py-20 px-6 md:px-15 bg-dark text-center">
        <div className="max-w-3xl mx-auto">
          <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('Everything You Need')}</AnimatedText>
          <AnimatedText tag="h2" animation="fade-up" delay={200} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-4">{t('World-Class Amenities')}</AnimatedText>
          <AnimatedSection animation="scale" delay={300} className="gold-line center" />
          <AnimatedText tag="p" animation="fade-up" delay={400} className="text-[14px] text-white-dim font-montserrat leading-relaxed">{t('At Tsedeke Grand Hotel, we believe that true luxury lies in the details. From the moment you arrive to the moment you depart, every amenity is designed to elevate your stay to an extraordinary experience.')}</AnimatedText>
        </div>
      </section>

      {/* Amenity Groups */}
      {amenityGroups.map((group, gi) => (
        <section key={gi} className={`py-16 px-6 md:px-15 ${gi % 2 === 0 ? 'bg-black' : 'bg-dark-2'}`}>
          <div className="max-w-7xl mx-auto">
            <AnimatedText tag="h3" animation="fade-right" className="font-cinzel text-[13px] tracking-[5px] uppercase text-gold mb-10 pb-4 border-b border-border-gold/25">{t(group.category)}</AnimatedText>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.items.map((item, i) => (
                <AnimatedCard key={i} index={i} animation="fade-up" className="premium-card p-7 group">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h4 className="font-cinzel text-[11px] tracking-[2px] uppercase text-gold mb-2 font-semibold group-hover:text-gold-light transition-colors">{t(item.name)}</h4>
                  <p className="text-[12px] text-white-dim font-montserrat leading-relaxed">{t(item.desc)}</p>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-24 px-6 text-center bg-dark">
        <AnimatedText tag="h2" animation="fade-up" className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-4">{t('Ready to Experience Tsedeke Grand?')}</AnimatedText>
        <AnimatedSection animation="scale" delay={200} className="gold-line center" />
        <AnimatedSection animation="scale" delay={300} className="flex gap-5 justify-center flex-wrap">
          <Link to="/booking" className="btn-primary" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}><span>{t('Book Your Stay')}</span></Link>
          <Link to="/rooms" className="btn-outline" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}><span>{t('Explore Rooms')}</span></Link>
        </AnimatedSection>
      </section>
    </div>
  );
};

export default Amenities;
