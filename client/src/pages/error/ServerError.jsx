import { useTranslation } from 'react-i18next';
import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';

const ServerError = () => {
  const { t } = useTranslation();

  const { setCursorHovered } = useUiStore();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-dark">
      <div className="text-[120px] font-cormorant font-light text-gold/20 leading-none">500</div>
      <h1 className="font-cormorant text-4xl font-light text-white mb-4">{t('Server Error')}</h1>
      <div className="gold-line center" />
      <p className="text-[14px] text-white-dim font-montserrat max-w-sm mb-10">{t('Something went wrong on our end. Please try again in a moment. If the problem persists, contact our team.')}</p>
      <div className="flex gap-4 flex-wrap justify-center">
        <button onClick={() => window.location.reload()} className="btn-primary" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>
          <span>{t('Try Again')}</span>
        </button>
        <Link to="/" className="btn-outline" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>
          <span>{t('Back to Home')}</span>
        </Link>
      </div>
    </div>
  );
};

export default ServerError;
