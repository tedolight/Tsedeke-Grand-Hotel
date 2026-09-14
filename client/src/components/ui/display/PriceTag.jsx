import { useTranslation } from 'react-i18next';
import React from 'react';

const PriceTag = ({ amount, currency = 'ETB', period = 'night', size = 'md' }) => {
  const { t } = useTranslation();

  const sizeMap = { sm: 'text-xl', md: 'text-3xl', lg: 'text-5xl' };
  return (
    <div className="flex flex-col">
      <span className="text-[8px] tracking-[2px] uppercase text-white-dim font-montserrat">{t('Starting from')}</span>
      <span className={`font-cormorant ${sizeMap[size]} text-gold leading-none`}>
        {currency} {typeof amount === 'number' ? amount.toLocaleString() : amount}
      </span>
      <span className="text-[10px] text-white-dim font-montserrat">per {period}</span>
    </div>
  );
};

export default PriceTag;
