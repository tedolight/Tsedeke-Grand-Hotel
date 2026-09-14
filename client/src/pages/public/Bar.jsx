import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';
import api from '../../services/api/api.js';
import { unwrapData } from '../../utils/apiHelpers.js';
import { useTranslation } from 'react-i18next';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../components/ui/AnimatedSection.jsx';

const Bar = () => {
  const { setCursorHovered } = useUiStore();
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        setLoading(true);
        const res = await api.get('/restaurant/items');
        const data = unwrapData(res);
        if (data && data.length > 0) {
          const drinks = data.filter(item => {
            const cat = item.category?.name?.toLowerCase() || item.category?.toLowerCase() || '';
            return cat === 'drinks' || cat === 'bar' || cat === 'beverages';
          });
          setItems(drinks);
        }
      } catch (err) {
        console.error('Error fetching bar items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrinks();
  }, []);

  const cocktails = items
    .filter(item => {
      const name = item.name.toLowerCase();
      const desc = item.description.toLowerCase();
      const badge = (item.badge || '').toLowerCase();
      return (
        badge.includes('signature') || 
        badge.includes('special') ||
        name.includes('cocktail') || 
        desc.includes('cocktail') || 
        desc.includes('whiskey') || 
        desc.includes('rum') || 
        desc.includes('gin') || 
        desc.includes('vodka') ||
        name.includes('sunset') ||
        name.includes('sling') ||
        name.includes('gold')
      );
    })
    .map(item => ({
      name: item.name,
      price: `ETB ${item.price}`,
      ingredients: item.description,
      signature: (item.badge || '').toLowerCase().includes('signature') || (item.badge || '').toLowerCase().includes('special')
    }));

  const spirits = items
    .filter(item => !items.some(c => {
      const name = c.name.toLowerCase();
      const desc = c.description.toLowerCase();
      const badge = (c.badge || '').toLowerCase();
      const isCocktail = (
        badge.includes('signature') || 
        badge.includes('special') ||
        name.includes('cocktail') || 
        desc.includes('cocktail') || 
        desc.includes('whiskey') || 
        desc.includes('rum') || 
        desc.includes('gin') || 
        desc.includes('vodka') ||
        name.includes('sunset') ||
        name.includes('sling') ||
        name.includes('gold')
      );
      return isCocktail && item._id === c._id;
    }))
    .map(item => ({
      name: item.name,
      price: `ETB ${item.price}`,
      desc: item.description
    }));

  return (
    <div className="bar-page select-none">
      {/* Hero */}
      <div className="relative h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url('/images/custom/bar.jpg')`, filter: 'brightness(0.55) saturate(1.15)' }}
        />
        {/* Nano Banana gradient overlay: deep black → warm banana-gold glow */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(10,8,4,0.92) 0%, rgba(30,22,0,0.70) 35%, rgba(255,225,53,0.18) 70%, rgba(255,200,0,0.08) 100%)'
          }}
        />
        {/* Bottom vignette for depth */}
        <div
          className="absolute inset-x-0 bottom-0 h-32"
          style={{ background: 'linear-gradient(to top, rgba(5,4,2,0.85), transparent)' }}
        />
        {/* Nano Banana left-edge glow accent */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: 'linear-gradient(to bottom, transparent, #FFE135, transparent)', opacity: 0.6 }}
        />
        <div className="page-hero relative z-10 text-center px-4 sm:px-6">
          <AnimatedText
            tag="span"
            animation="fade-down"
            delay={100}
            className="text-[10px] tracking-[6px] uppercase mb-5 block font-montserrat"
            style={{ color: '#FFE135', textShadow: '0 0 20px rgba(255,225,53,0.7), 0 2px 8px rgba(0,0,0,0.9)' }}
          >
            🍹 {t('The Tsedeke Grand Bar')}
          </AnimatedText>
          <AnimatedText
            tag="h1"
            animation="fade-up"
            delay={300}
            className="text-3xl md:text-5xl font-cormorant font-light text-white leading-tight"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.95), 0 0 40px rgba(255,225,53,0.15)' }}
          >
            {t('Spirits &')} <em style={{ color: '#FFE135', fontStyle: 'italic', textShadow: '0 0 25px rgba(255,225,53,0.55)' }}>{t('Cocktails')}</em>
          </AnimatedText>
          <AnimatedText
            tag="p"
            animation="fade-up"
            delay={500}
            className="mt-4 text-[12px] font-montserrat tracking-widest"
            style={{ color: 'rgba(255,225,53,0.55)', textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
          >
            {t('Open Daily · 5:00 PM – 12:00 AM')}
          </AnimatedText>
        </div>
      </div>

      {/* Intro */}
      <section className="py-16 px-6 md:px-15 bg-dark text-center">
        <div className="max-w-2xl mx-auto">
          <AnimatedText tag="p" animation="fade-up" className="text-[15px] font-cormorant italic text-white-dim leading-relaxed">
            {t('"The perfect end to a perfect day — unwind with handcrafted cocktails, premium spirits, and the warm ambiance of our elegantly designed bar."')}
          </AnimatedText>
        </div>
      </section>

      {/* Signature Cocktails */}
      <section className="py-16 px-6 md:px-15 bg-dark-2">
        <div className="max-w-5xl mx-auto">
          <AnimatedText tag="h2" animation="fade-right" className="font-cormorant text-2xl md:text-3xl font-light text-gold mb-10 pb-4 border-b border-border-gold/25 tracking-wide">✨ {t('Signature Cocktails')}</AnimatedText>
          {loading ? (
            <p className="text-white-dim text-sm font-montserrat animate-pulse">{t('Loading signature cocktails...')}</p>
          ) : cocktails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cocktails.map((c, i) => (
                <AnimatedCard key={i} index={i} animation="fade-up" className="premium-card p-6 group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-cormorant text-xl text-white group-hover:text-gold transition-colors">{t(c.name)}</h3>
                    <span className="font-cinzel text-[12px] text-gold tracking-wider">{t(c.price)}</span>
                  </div>
                  <p className="text-[11px] text-white-dim/70 font-montserrat italic">{t(c.ingredients)}</p>
                  {c.signature && <span className="text-[9px] tracking-[2px] uppercase text-gold-dark font-montserrat mt-2 block">★ {t("Chef's Signature")}</span>}
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <p className="text-white-dim text-sm font-montserrat">{t('No signature cocktails currently available.')}</p>
          )}
        </div>
      </section>

      {/* Spirits & More */}
      <section className="py-16 px-6 md:px-15 bg-black">
        <div className="max-w-3xl mx-auto">
          <AnimatedText tag="h2" animation="fade-right" className="font-cormorant text-2xl md:text-3xl font-light text-gold mb-10 pb-4 border-b border-border-gold/25 tracking-wide">{t('Spirits, Wine & More')}</AnimatedText>
          {loading ? (
            <p className="text-white-dim text-sm font-montserrat animate-pulse">{t('Loading spirits...')}</p>
          ) : spirits.length > 0 ? (
            spirits.map((s, i) => (
              <AnimatedCard key={i} index={i} staggerMs={40} animation="fade-up" className="flex justify-between items-start py-4 border-b border-border-gold/10 hover:border-gold/30 hover:pl-2 transition-all duration-300 group">
                <div>
                  <div className="font-cormorant text-lg text-white group-hover:text-gold transition-colors">{t(s.name)}</div>
                  <div className="text-[11px] text-white-dim/60 font-montserrat">{t(s.desc)}</div>
                </div>
                <span className="font-cinzel text-[12px] text-gold tracking-wider ml-6 whitespace-nowrap">{t(s.price)}</span>
              </AnimatedCard>
            ))
          ) : (
            <p className="text-white-dim text-sm font-montserrat">{t('No spirits currently available.')}</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center bg-dark-2 border-t border-border-gold/10">
        <AnimatedText tag="p" animation="fade-up" className="font-cormorant text-2xl italic text-white-dim mb-6">{t('Reserve a table for a special evening')}</AnimatedText>
        <AnimatedSection animation="scale" delay={200}>
          <Link to="/contact" className="btn-primary" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}><span>{t('Make a Reservation')}</span></Link>
        </AnimatedSection>
      </section>
    </div>
  );
};

export default Bar;

