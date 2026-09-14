import { useTranslation } from 'react-i18next';
import React from 'react';

const PhoneInput = ({ label = 'Phone Number', id, value, onChange, error, className = '' }) => {
  const { t } = useTranslation();
  return (

  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label htmlFor={id} className="text-[9px] tracking-[3px] uppercase text-gold font-montserrat">
        {label}
      </label>
    )}
    <div className="flex">
      <span className="bg-dark-4 border border-border-gold/25 border-r-0 px-3 flex items-center text-gold-dim font-montserrat text-[13px]">
        +251
      </span>
      <input
        id={id}
        type="tel"
        value={value}
        onChange={onChange}
        placeholder={t('9XXXXXXXX')}
        className={`bg-dark-3 border ${error ? 'border-red-500/50' : 'border-border-gold/25'} text-white font-montserrat text-[13px] px-4 py-3 outline-none focus:border-gold flex-1 transition-colors duration-200 ${className}`}
      />
    </div>
    {error && <span className="text-[11px] text-red-400 font-montserrat">{error}</span>}
  </div>

  );
};


export default PhoneInput;
