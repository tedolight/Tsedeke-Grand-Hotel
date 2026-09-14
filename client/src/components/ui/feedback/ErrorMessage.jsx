import { useTranslation } from 'react-i18next';
import React from 'react';

const ErrorMessage = ({ message = 'Something went wrong. Please try again.', onRetry }) => {
  const { t } = useTranslation();
  return (

  <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
    <div className="text-4xl">⚠️</div>
    <h3 className="font-cinzel text-lg tracking-[2px] text-gold uppercase">{t('Error')}</h3>
    <p className="text-[13px] text-white-dim font-montserrat max-w-xs">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="btn-outline"
        style={{ padding: '10px 28px', fontSize: '10px' }}
      >
        <span>{t('Try Again')}</span>
      </button>
    )}
  </div>

  );
};


export default ErrorMessage;
