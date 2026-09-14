import { useTranslation } from 'react-i18next';
import React from 'react';

const BAR_DRINKS = [
  { name: 'Tej (Ethiopian Honey Wine)', price: 'ETB 150', category: 'Ethiopian Specialties', description: 'Traditional fermented honey wine, served chilled' },
  { name: 'Tsedeke Grand Gold Cocktail', price: 'ETB 280', category: 'Signature Cocktails', description: 'Whiskey, honey, lemon, ginger — our signature blend' },
  { name: 'Single Malt Scotch', price: 'ETB 350', category: 'Spirits', description: 'Premium selection of aged single malts' },
  { name: 'Red Wine (Glass)', price: 'ETB 180', category: 'Wine', description: 'Curated selection of imported wines' },
  { name: 'Fresh Mango Juice', price: 'ETB 60', category: 'Non-Alcoholic', description: 'Freshly blended seasonal fruits' },
  { name: 'Sparkling Water', price: 'ETB 35', category: 'Non-Alcoholic', description: 'San Pellegrino or local sparkling water' },
];

const BarSection = () => {
  const { t } = useTranslation();
  return (

  <section className="py-20 px-6 md:px-15 bg-dark-3">
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div className="relative h-[380px] overflow-hidden">
        <img src="/images/custom/bar.jpg" alt={t('Hotel Bar')} className="w-full h-full object-cover brightness-95" style={{ imageRendering: 'auto' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6">
          <div className="font-cinzel text-[11px] tracking-[3px] uppercase text-gold font-semibold">{t('Open Daily')}</div>
          <div className="text-white-dim font-montserrat text-[12px]">{t('5:00 PM – 12:00 AM')}</div>
        </div>
      </div>
      <div>
        <span className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('The Tsedeke Grand Bar')}</span>
        <h2 className="text-4xl font-cormorant font-light mb-4">{t('Premium Spirits & Cocktails')}</h2>
        <div className="gold-line" />
        <p className="text-[14px] text-white-dim font-montserrat leading-relaxed mb-6">{t('Wind down at our elegantly designed bar with a curated selection of local and international spirits, signature cocktails, and fine wines.')}</p>
        <div>
          {BAR_DRINKS.map((drink, i) => (
            <div key={i} className="flex justify-between items-start py-3 border-b border-border-gold/10 hover:border-gold/30 group transition-all duration-300 hover:pl-2">
              <div>
                <div className="font-cormorant text-base text-white group-hover:text-gold transition-colors">{drink.name}</div>
                <div className="text-[10px] text-white-dim/50 font-montserrat">{drink.description}</div>
              </div>
              <span className="font-cinzel text-[11px] text-gold tracking-wider ml-4 whitespace-nowrap">{drink.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>

  );
};


export default BarSection;
