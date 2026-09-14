import { useTranslation } from 'react-i18next';
import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../../store/ui/themeStore.js';

const NavBookButton = () => {
  const { t } = useTranslation();

  const { setCursorHovered } = useUiStore();
  return (
    <div className="hidden lg:block">
      <Link
        to="/booking"
        className="font-cinzel text-[10px] tracking-[3px] text-black bg-gold px-6 py-3 no-underline transition-all hover:bg-gold-light font-semibold"
        onMouseEnter={() => setCursorHovered(true)}
        onMouseLeave={() => setCursorHovered(false)}
      >
        {t('Book Now')}
      </Link>
    </div>
  );
};

export default NavBookButton;
