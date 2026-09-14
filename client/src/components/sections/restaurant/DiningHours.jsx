import { useTranslation } from 'react-i18next';
import React from 'react';

const HOURS = [
  { meal: 'Breakfast', time: '6:30 AM – 10:30 AM', days: 'Daily' },
  { meal: 'Lunch', time: '12:00 PM – 3:00 PM', days: 'Daily' },
  { meal: 'Afternoon Tea', time: '3:00 PM – 5:30 PM', days: 'Daily' },
  { meal: 'Dinner', time: '6:00 PM – 10:30 PM', days: 'Daily' },
  { meal: 'Room Service', time: '24 Hours', days: 'Daily' },
];

const DiningHours = () => {
  const { t } = useTranslation();
  return (

  <div className="bg-dark-2 border border-border-gold/15 p-8">
    <h3 className="font-cinzel text-[12px] tracking-[4px] uppercase text-gold mb-6 pb-3 border-b border-border-gold/25">{t('Dining Hours')}</h3>
    <div className="space-y-3">
      {HOURS.map((h, i) => (
        <div key={i} className="flex justify-between items-center py-2 border-b border-border-gold/8 last:border-0">
          <span className="font-cormorant text-base text-white">{h.meal}</span>
          <div className="text-right">
            <div className="font-cinzel text-[10px] text-gold tracking-wider">{h.time}</div>
            <div className="text-[9px] text-white-dim/50 font-montserrat">{h.days}</div>
          </div>
        </div>
      ))}
    </div>
  </div>

  );
};


export default DiningHours;
