import React from 'react';
import { useTranslation } from 'react-i18next';

const COFFEE_ITEMS = [
  { name: 'Traditional Bunna (Ethiopian Coffee Ceremony)', price: 'ETB 120', description: 'Full three-round ceremony with popcorn and incense', emoji: '☕' },
  { name: 'Macchiato (Tsedeke Grand Style)', price: 'ETB 45', description: 'Rich espresso with a touch of frothy milk, Ethiopian style', emoji: '☕' },
  { name: 'Spiced Chai Latte', price: 'ETB 60', description: 'Warming blend of spices, black tea, and steamed milk', emoji: '🍵' },
  { name: 'Cold Brew Coffee', price: 'ETB 80', description: '12-hour cold steeped smooth coffee over ice', emoji: '🧊' },
];

const CoffeeSection = () => {
  const { t, i18n } = useTranslation();
  return (
    <section className="py-20 px-6 md:px-15 bg-dark-3 border-y border-border-gold/10">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
          <span className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('Coffee Lounge')}</span>
          <h2 className="text-4xl font-cormorant font-light mb-4">{t('The Art of Ethiopian Coffee')}</h2>
          <div className="gold-line" />
          <p className="text-[14px] text-white-dim font-montserrat leading-relaxed mb-8">{t('Experience the world-famous Ethiopian coffee ceremony. Our coffee lounge serves authentic specialty coffees roasted in-house, alongside international café favorites.')}</p>
          <div className="space-y-1">
            {COFFEE_ITEMS.map((item, i) => (
              <div key={i} className="flex justify-between items-start py-3.5 border-b border-border-gold/10 hover:border-gold/30 hover:pl-2 transition-all duration-300 group">
                <div className="flex items-start gap-3">
                  <span className="text-base mt-0.5">{item.emoji}</span>
                  <div>
                    <div className="font-cormorant text-lg text-white group-hover:text-gold transition-colors">{t(item.name)}</div>
                    <div className="text-[11px] text-white-dim/60 font-montserrat">{t(item.description)}</div>
                  </div>
                </div>
                <span className="font-cinzel text-[12px] text-gold tracking-wider ml-4 whitespace-nowrap">{t(item.price)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative h-[420px] overflow-hidden">
          <img src="/images/custom/cafe.png" alt={t("Coffee Ceremony")} className="w-full h-full object-cover brightness-95" style={{ imageRendering: 'auto' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default CoffeeSection;
