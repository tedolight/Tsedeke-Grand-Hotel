import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import useUiStore from '../../../store/ui/themeStore.js';

const ScrollTopButton = () => {
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);
  const { setCursorHovered } = useUiStore();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => {t('window.removeEventListener(\'scroll\', onScroll);
  }, []);

  if (!visible) return null;

  return (')}
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gold text-black flex items-center justify-center hover:bg-gold-light transition-all duration-300 shadow-lg hover:shadow-gold/30 hover:-translate-y-1"
      onMouseEnter={() => setCursorHovered(true)}
      onMouseLeave={() => setCursorHovered(false)}
      title={t('Scroll to top')}
    >
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
};

export default ScrollTopButton;
