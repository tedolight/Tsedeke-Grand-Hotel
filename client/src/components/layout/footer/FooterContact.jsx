import { useTranslation } from 'react-i18next';
import React from 'react';

const FooterContact = () => {
  const { t } = useTranslation();
  return (

  <div>
    <h4 className="font-cinzel text-[11px] tracking-[3px] uppercase text-gold mb-5 font-semibold">{t('Contact Us')}</h4>
    <ul className="space-y-3">
      {[
        { icon: '📍', text: 'Hossana City, Hadiya Zone\nSNNPR, Ethiopia' },
        { icon: '📞', text: '+251 94 XXX XXXX' },
        { icon: '✉️', text: 'info@tsedekegrandhotel.com' },
        { icon: '🕐', text: 'Check-in: 2:00 PM\nCheck-out: 12:00 PM' },
      ].map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="text-base mt-0.5 flex-shrink-0">{item.icon}</span>
          <span className="text-[12px] text-white-dim font-montserrat leading-relaxed whitespace-pre-line">{item.text}</span>
        </li>
      ))}
    </ul>
  </div>

  );
};


export default FooterContact;
