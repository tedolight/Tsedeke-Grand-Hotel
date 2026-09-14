import React from 'react';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '../../../store/settings/settingsStore.js';

const LocationSection = () => {
  const { t, i18n } = useTranslation();
  const { hotelSettings } = useSettingsStore();

  return (
    <section className="py-20 px-6 md:px-15 bg-dark-2 border-t border-border-gold/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('Find Us')}</span>
          <h2 className="text-4xl md:text-5xl font-cormorant font-light mb-4">{t('Our Location')}</h2>
          <div className="gold-line" />
          <p className="text-[14px] text-white-dim font-montserrat leading-relaxed mb-6">
            {t('Located in the heart of {{city}} City, {{hotel}} is easily accessible and centrally positioned for both business and leisure travel.', { city: hotelSettings.city || 'Hossana', hotel: hotelSettings.tradingName || 'Tsedeke Grand Hotel' })}
          </p>
          <div className="space-y-3">
            {[
              { icon: '📍', text: `${hotelSettings.streetAddress || 'Hossana City, Hadiya Zone'}, ${hotelSettings.city || 'Hossana'}, ${hotelSettings.country || 'Ethiopia'}` },
              { icon: '📞', text: hotelSettings.mainPhone || '+251 90 951 7777', isLink: true, href: `tel:${hotelSettings.mainPhone || '+251909517777'}` },
              { icon: '✉️', text: hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com', isLink: true, href: `mailto:${hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com'}` },
              { icon: '🕐', text: `${t('Check-in')}: ${hotelSettings.checkIn || '14:00'} | ${t('Check-out')}: ${hotelSettings.checkOut || '12:00'}` },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-base mt-0.5">{item.icon}</span>
                {item.isLink ? (
                  <a href={item.href} className="text-[13px] text-white-dim hover:text-gold font-montserrat transition-colors">{item.text}</a>
                ) : (
                  <span className="text-[13px] text-white-dim font-montserrat">{t(item.text)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-dark-3 border border-border-gold/20 flex items-center justify-center h-72 text-center p-8">
          <div>
            <div className="text-5xl mb-4">🗺️</div>
            <p className="font-cinzel text-[11px] tracking-[2px] uppercase text-gold">{t('{{city}} City', { city: hotelSettings.city || 'Hossana' })}</p>
            <p className="text-[12px] text-white-dim font-montserrat mt-2">{t('{{address}}, {{country}}', { address: hotelSettings.streetAddress || 'Hadiya Zone', country: hotelSettings.country || 'Ethiopia' })}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
