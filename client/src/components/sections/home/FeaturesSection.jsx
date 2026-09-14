import React from 'react';
import { useTranslation } from 'react-i18next';

const FEATURES = [
  { icon: '🏆', title: 'Award-Winning Service', description: 'Recognized for outstanding hospitality across multiple national and regional awards.' },
  { icon: '🌿', title: 'Eco-Conscious', description: 'Committed to sustainable practices while delivering a premium guest experience.' },
  { icon: '👨‍🍳', title: 'Culinary Excellence', description: 'Chefs trained in top international schools, fusing local and global flavors.' },
  { icon: '🔒', title: '24/7 Security', description: 'Round-the-clock professional security ensuring your complete safety and peace of mind.' },
];

const FeaturesSection = () => {
  const { t, i18n } = useTranslation();
  return (
    <section className="py-20 px-6 md:px-15 bg-black border-y border-border-gold/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5 bg-border-gold/10">
        {FEATURES.map((f, i) => (
          <div key={i} className="bg-black p-10 text-center hover:bg-dark-2 transition-colors duration-300 group">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h4 className="font-cinzel text-[11px] tracking-[2px] uppercase text-gold mb-2 font-semibold group-hover:text-gold-light transition-colors">{t(f.title)}</h4>
            <p className="text-[12px] text-white-dim font-montserrat leading-relaxed">{t(f.description)}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
