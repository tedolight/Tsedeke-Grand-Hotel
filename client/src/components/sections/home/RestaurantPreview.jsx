import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../../store/ui/themeStore.js';
import useMenu from '../../../hooks/restaurant/useMenu.js';
import { useTranslation } from 'react-i18next';
import { AnimatedSection, AnimatedText } from '../../ui/AnimatedSection.jsx';

const RestaurantPreview = () => {
  const { setCursorHovered } = useUiStore();
  const { items, loading } = useMenu();
  const { t } = useTranslation();
  const hover = { onMouseEnter: () => setCursorHovered(true), onMouseLeave: () => setCursorHovered(false) };

  const menuItems = items.length > 0 ? items.slice(0, 3).map((i) => ({ name: i.name, price: i.price })) : [];

  return (
    <section className="bg-dark grid grid-cols-1 lg:grid-cols-2 items-stretch p-0">

      {/* Image — slides in from left */}
      <AnimatedSection animation="fade-right" delay={0} className="relative p-6 sm:p-10 lg:p-12 flex items-center justify-center bg-dark">
        <div className="relative w-full max-w-[500px] mx-auto overflow-hidden border border-border-gold/20 p-2 bg-dark-2 group" style={{ height: '340px' }}>
          <img src="/images/custom/7.jpg" alt={t('Fine Dining')}
            className="w-full h-full object-cover brightness-95 transition-transform duration-1000 group-hover:scale-105"
            style={{ imageRendering: 'auto' }} />
        </div>
      </AnimatedSection>

      {/* Text content — each line animates independently from right */}
      <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center bg-dark">
        <AnimatedText tag="span" animation="fade-left" delay={100}
          className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">
          {t('Culinary Masterpieces')}
        </AnimatedText>
        <AnimatedText tag="h2" animation="fade-up" delay={200}
          className="text-3xl md:text-5xl font-cormorant font-bold leading-tight mb-6">
          {t('Gourmet Dining')}
        </AnimatedText>
        <AnimatedText tag="p" animation="fade-up" delay={300}
          className="text-[14px] leading-relaxed text-white-dim mb-8 font-montserrat">
          {t('Experience traditional Ethiopian flavors fused with international cuisine in our fine dining room.')}
        </AnimatedText>

        {/* Menu items — each line animates in with stagger */}
        <div className="my-8 flex flex-col">
          {loading ? (
            <p className="text-white-dim text-sm font-montserrat animate-pulse">{t('Loading menu highlights…')}</p>
          ) : (
            menuItems.map((item, i) => (
              <AnimatedSection key={i} animation="fade-left" delay={350 + i * 100}
                className="flex justify-between items-center py-3.5 border-b border-border-gold/10 hover:pl-2.5 hover:border-gold transition-all duration-300 group">
                <span className="font-cormorant text-lg text-white group-hover:text-gold transition-colors">{t(item.name)}</span>
                <span className="font-cinzel text-[12px] text-gold tracking-wider">ETB {item.price?.toLocaleString?.() ?? item.price}</span>
              </AnimatedSection>
            ))
          )}
        </div>

        <AnimatedSection animation="scale" delay={500}>
          <Link to="/restaurant" className="btn-outline" {...hover}><span>{t('Explore Restaurant')}</span></Link>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default RestaurantPreview;
