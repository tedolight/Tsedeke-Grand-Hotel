import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';
import useSettingsStore from '../../store/settings/settingsStore.js';

const NotFound = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { setCursorHovered } = useUiStore();
  const [countdown, setCountdown] = useState(15);
  const { hotelSettings } = useSettingsStore();
  const [localTime, setLocalTime] = useState('--:--:--');

  // Clock: Timezone offset dynamically calculated based on hotel settings country
  useEffect(() => {
    const COUNTRY_OFFSETS = {
      Ethiopia: 3,
      Kenya: 3,
      Uganda: 3,
      Tanzania: 3
    };
    const offset = COUNTRY_OFFSETS[hotelSettings.country] || 3;

    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const local = new Date(utc + offset * 3600000);
      const h = String(local.getHours()).padStart(2, '0');
      const m = String(local.getMinutes()).padStart(2, '0');
      const s = String(local.getSeconds()).padStart(2, '0');
      setLocalTime(`${h}:${m}:${s}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [hotelSettings.country]);

  // Countdown timer redirecting to Home
  useEffect(() => {
    if (countdown <= 0) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Cancel countdown on user interaction (mouse move)
    const cancelCountdown = () => {
      clearInterval(timer);
      setCountdown(Infinity);
      window.removeEventListener('mousemove', cancelCountdown);
    };

    window.addEventListener('mousemove', cancelCountdown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', cancelCountdown);
    };
  }, [countdown, navigate]);

  const handleMouseEnter = () => setCursorHovered(true);
  const handleMouseLeave = () => setCursorHovered(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-black select-none text-white font-montserrat">
      {/* BACKGROUND */}
      <div 
        className="absolute inset-0 bg-cover bg-center brightness-[0.85]"
        style={{
          backgroundImage: `url('/images/custom/7.jpg')`
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] z-1 pointer-events-none" />

      {/* GIANT 404 WATERMARK */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] md:text-[22vw] font-cormorant font-light leading-none tracking-tighter text-transparent select-none pointer-events-none z-2 select-none opacity-40 whitespace-nowrap" style={{ WebkitTextStroke: '1px rgba(201, 168, 76, 0.15)' }}>
        404
      </div>

      {/* CORNER ORNAMENTS */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-gold/25 pointer-events-none z-5 hidden sm:block" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-gold/25 pointer-events-none z-5 hidden sm:block" />
      <div className="absolute bottom-24 left-8 w-12 h-12 border-b border-l border-gold/25 pointer-events-none z-5 hidden sm:block" />
      <div className="absolute bottom-24 right-8 w-12 h-12 border-b border-r border-gold/25 pointer-events-none z-5 hidden sm:block" />

      {/* CLOCK */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10">
        <div className="font-cormorant text-[13px] tracking-[4px] text-gold font-semibold">{localTime}</div>
        <div className="text-[7.5px] tracking-[3px] uppercase text-white-dim mt-1.5">{hotelSettings.city || 'Hossana'}, {hotelSettings.country || 'Ethiopia'}</div>
      </div>

      {/* CENTER CONTENT */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl px-6">
        {/* Door illustration */}
        <div className="relative mb-6">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gold text-black font-cinzel text-[7.5px] tracking-[3px] uppercase px-4 py-1 rounded-sm whitespace-nowrap shadow-md">
            {t('Room Not Found')}
          </div>
          
          <div className="w-[85px] h-[120px] bg-dark-2 border border-gold/35 relative flex flex-col justify-start pt-6 shadow-2xl rounded-sm">
            {/* Panel details inside door */}
            <div className="absolute inset-2 border border-gold/15 pointer-events-none" />
            <div className="font-cinzel text-[11px] tracking-[3px] text-gold text-center font-medium">404</div>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gold rounded-full shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <div className="absolute right-2.5 top-[calc(50%+10px)] w-2.5 h-1.5 border border-gold/40 rounded-full flex justify-center">
              <div className="w-[1px] h-1 bg-gold/40" />
            </div>
          </div>
          
          {/* Hanging key */}
          <div className="absolute -bottom-8 right-2.5 transform-origin-top animate-bounce">
            <span className="text-xl filter drop-shadow-[0_0_4px_rgba(201,168,76,0.4)]">🔑</span>
          </div>
        </div>

        {/* Headlines */}
        <div className="space-y-3">
          <span className="text-[9px] tracking-[6px] uppercase text-gold block">{t('✦ Lost in the Corridors ✦')}</span>
          <h2 className="font-cormorant text-4xl md:text-5xl font-light text-white leading-tight">
            {t('This Suite')} <em className="italic text-gold-light">{t('Does Not Exist')}</em>
          </h2>
          <p className="font-cormorant text-[13px] md:text-base italic text-white-dim">
            {t('"The room door you knocked on leads nowhere — let us guide you back"')}
          </p>
        </div>

        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent my-6" />

        <p className="text-[12px] text-white-dim leading-relaxed max-w-sm mb-8">
          {t('It seems the page you were looking for has checked out, moved rooms, or never existed. Let our front desk direct you to the right space.')}
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <Link
            to="/"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="bg-gold hover:bg-gold-light text-black font-cinzel text-[10px] tracking-[2.5px] uppercase font-semibold px-8 py-4.5 transition-colors duration-300 rounded-sm shadow-lg"
          >
            {t('Return to Home')}
          </Link>
          <Link
            to="/rooms"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="border border-border-gold/40 hover:bg-gold/10 text-gold font-cinzel text-[10px] tracking-[2.5px] uppercase font-semibold px-8 py-4.5 transition-colors duration-300 rounded-sm"
          >
            {t('Explore Rooms')}
          </Link>
        </div>

        {/* Redirect notice */}
        {countdown !== Infinity && (
          <p className="text-[9px] text-white-dim/40 tracking-[2px] uppercase mt-6">
            {t('Auto-returning home in')} <span className="text-gold font-semibold">{countdown}</span> {t('seconds')}
          </p>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 md:px-15 bg-black/60 border-t border-border-gold/10 backdrop-blur-md">
        <Link to="/" className="font-cinzel text-sm tracking-[5px] text-gold hover:text-gold-light transition-colors duration-300">
          {hotelSettings.tradingName?.toUpperCase() || 'TSEDEKE GRAND HOTEL'}
        </Link>
        <div className="flex gap-6 text-[9.5px] tracking-[2px] uppercase text-white-dim">
          <Link to="/" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="hover:text-gold transition-colors duration-300">{t('Home')}</Link>
          <Link to="/rooms" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="hover:text-gold transition-colors duration-300">{t('Rooms')}</Link>
          <Link to="/restaurant" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="hover:text-gold transition-colors duration-300">{t('Restaurant')}</Link>
          <Link to="/contact" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="hover:text-gold transition-colors duration-300">{t('Contact')}</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
