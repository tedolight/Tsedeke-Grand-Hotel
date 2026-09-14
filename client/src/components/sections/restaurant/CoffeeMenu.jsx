import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import api from '../../../services/api/api.js';
import { unwrapData } from '../../../utils/apiHelpers.js';
import { AnimatedSection, AnimatedCard } from '../../ui/AnimatedSection.jsx';

const CoffeeMenu = () => {
  const { t } = useTranslation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoffee = async () => {
      try {
        setLoading(true);
        const res = await api.get('/restaurant/items');
        const data = unwrapData(res);
        if (data && data.length > 0) {
          const drinks = data.filter(item => {
            const cat = item.category?.name?.toLowerCase() || item.category?.toLowerCase() || '';
            return cat === 'drinks' || cat === 'coffee' || cat === 'beverages';
          });
          setItems(drinks);
        }
      } catch (err) {
        console.error('Error fetching coffee menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoffee();
  }, []);

  return (
    <AnimatedSection animation="fade-up" className="bg-dark-2 border border-border-gold/15 p-8">
      <h3 className="font-cinzel text-[12px] tracking-[4px] uppercase text-gold mb-6 pb-3 border-b border-border-gold/25">{t('☕ Coffee & Beverages')}</h3>
      {loading ? (
        <p className="text-white-dim text-xs font-montserrat animate-pulse">{t('Loading coffee menu...')}</p>
      ) : items.length > 0 ? (
        items.map((item, i) => (
          <AnimatedCard key={i} index={i} animation="fade-left" className="flex justify-between items-start py-3.5 border-b border-border-gold/8 last:border-0 hover:pl-2 transition-all duration-300 group">
            <div className="pr-4">
              <div className="font-cormorant text-base text-white group-hover:text-gold transition-colors">{item.name}</div>
              <div className="text-[11px] text-white-dim/60 font-montserrat mt-0.5">{item.description}</div>
            </div>
            <span className="font-cinzel text-[11px] text-gold tracking-wider whitespace-nowrap">{item.price} ETB</span>
          </AnimatedCard>
        ))
      ) : (
        <p className="text-white-dim text-xs font-montserrat">{t('No beverages currently available.')}</p>
      )}
    </AnimatedSection>
  );
};

export default CoffeeMenu;
