import { useTranslation } from 'react-i18next';
import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore, { isBlackTheme } from '../../../store/ui/themeStore.js';
import useSettingsStore from '../../../store/settings/settingsStore.js';

const NavLogo = () => {
  const { t } = useTranslation();
  const { setCursorHovered, theme } = useUiStore();
  const { hotelSettings } = useSettingsStore();

  const isBlack = isBlackTheme(theme);
  const logoSrc = isBlack ? '/logo-black.png' : (hotelSettings.logoUrl || '/logo-dark.svg');

  return (
    <Link
      to="/"
      className="flex items-center h-12 transition-opacity hover:opacity-85"
      onMouseEnter={() => setCursorHovered(true)}
      onMouseLeave={() => setCursorHovered(false)}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md overflow-hidden flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.15)] bg-black/40">
          <img
            src={logoSrc}
            alt={hotelSettings.hotelName || t('Tsedeke Grand Hotel')}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = isBlack ? '/logo-black.png' : '/logo-dark.svg';
            }}
            className="h-full w-full object-contain"
            style={{ imageRendering: 'high-quality' }}
          />
        </div>
        <span className="font-cormorant text-xl text-gold font-bold tracking-[2px]">{hotelSettings.logoName || 'Tsedeke Grand'}</span>
      </div>
    </Link>
  );
};

export default NavLogo;
