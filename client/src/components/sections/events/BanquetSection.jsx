import { useTranslation } from 'react-i18next';
import React from 'react';
import useSettingsStore from '../../../store/settings/settingsStore.js';

const BanquetSection = () => {
  const { t } = useTranslation();
  const { hotelSettings } = useSettingsStore();
  return (

  <section className="py-20 px-6 md:px-15 bg-black">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <span className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('🍽️ Banquets & Galas')}</span>
        <h2 className="text-4xl md:text-5xl font-cormorant font-light">{t('Grand Banquet Experiences')}</h2>
        <div className="gold-line center" />
        <p className="text-[14px] text-white-dim font-montserrat max-w-xl mx-auto">{t('Host exquisite banquet dinners and gala evenings with impeccable service and world-class catering.')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { img: '/images/custom/1.jpg', title: 'The Grand Ballroom', desc: 'Our flagship venue, accommodating up to 500 guests in a breathtaking setting.', cap: '500 guests' },
          { img: '/images/custom/4.jpg', title: 'The Crystal Hall', desc: 'An intimate setting ideal for mid-sized banquets with full chandelier lighting.', cap: '250 guests' },
          { img: '/images/custom/5.jpg', title: 'The Garden Terrace', desc: t('Outdoor al-fresco dining experience under the {{city}} night sky.', { city: hotelSettings.city || 'Hossana' }), cap: '150 guests' },
        ].map((venue, i) => (
          <div key={i} className="bg-dark-2 border border-border-gold/15 overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img src={venue.img} alt={venue.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
              <span className="absolute bottom-3 left-4 bg-black/70 border border-border-gold/30 text-gold text-[9px] px-2.5 py-1 font-montserrat tracking-widest">{venue.cap}</span>
            </div>
            <div className="p-6">
              <h3 className="font-cormorant text-xl font-light text-white mb-2 group-hover:text-gold transition-colors">{venue.title}</h3>
              <p className="text-[12px] text-white-dim font-montserrat leading-relaxed">{venue.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>

  );
};


export default BanquetSection;
