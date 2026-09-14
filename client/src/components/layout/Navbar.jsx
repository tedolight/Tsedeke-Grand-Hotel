import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useUiStore, { isBlackTheme } from '../../store/ui/themeStore.js';
import useAuthStore from '../../store/auth/authStore.js';
import AuthModal from '../common/AuthModal.jsx';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '../../store/settings/settingsStore.js';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/rooms', label: 'Rooms' },
  { path: '/restaurant', label: 'Restaurant' },
  { path: '/events', label: 'Events' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/contact', label: 'Contact' },
];

const ThemeToggle = ({ theme, onToggle, onHover }) => (
  <button
    type="button"
    onClick={onToggle}
    className="theme-toggle-btn w-9 h-9 xl:w-10 xl:h-10 border border-border-gold/30 text-gold text-sm xl:text-base flex items-center justify-center hover:bg-gold/10 transition-colors shrink-0 rounded-sm cursor-pointer"
    aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    {...onHover}
  >
    {theme === 'dark' ? (
      <i className="fas fa-sun text-[13px]" aria-hidden="true" />
    ) : (
      <i className="fas fa-moon text-[13px]" aria-hidden="true" />
    )}
  </button>
);

const LanguageToggle = ({ language, onToggle, onHover }) => (
  <button
    type="button"
    onClick={onToggle}
    className="theme-toggle-btn w-9 h-9 xl:w-10 xl:h-10 border border-border-gold/30 text-gold text-[10px] flex items-center justify-center hover:bg-gold/10 transition-colors shrink-0 rounded-sm font-montserrat font-bold cursor-pointer"
    aria-label={language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
    title={language === 'en' ? 'Amharic' : 'English'}
    {...onHover}
  >
    {language === 'en' ? 'አማ' : 'EN'}
  </button>
);

const Navbar = () => {
  const { setCursorHovered, theme, toggleTheme } = useUiStore();
  const { user, isAuthenticated, logout, loadUser } = useAuthStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const hover = {
    onMouseEnter: () => setCursorHovered(true),
    onMouseLeave: () => setCursorHovered(false),
  };

  // Load user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      loadUser();
    }
  }, [user, loadUser]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openLogin = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const openRegister = () => {
    setAuthModalTab('register');
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const { hotelSettings } = useSettingsStore();
  const isBlack = isBlackTheme(theme);
  const logoSrc = isBlack ? '/logo-black.png' : (hotelSettings.logoUrl || '/logo-dark.svg');

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-6 lg:px-6 xl:px-10 bg-black/95 backdrop-blur-md transition-colors duration-300 border-b border-white/10"
        style={{ height: '68px', maxHeight: '68px', minHeight: '68px' }}
      >
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          <Link
            to="/"
            className="nav-logo flex items-center h-12 transition-opacity hover:opacity-85 no-underline"
            {...hover}
          >
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-start shrink-0">
                <img
                  src={logoSrc}
                  alt={hotelSettings.hotelName || 'Tsedeke Grand Hotel'}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = isBlack ? '/logo-black.png' : '/logo-dark.svg';
                  }}
                  className="object-contain rounded"
                  style={{ height: '56px', width: '56px', imageRendering: 'auto', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}
                />
              </div>
              <span className="font-cormorant text-xl xl:text-2xl text-gold font-bold tracking-[2px] xl:tracking-[3px] whitespace-nowrap">
                {hotelSettings.logoName || 'Tsedeke Grand'}
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Links */}
        <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 mx-2 xl:mx-6">
          <ul className="nav-links flex items-center justify-center gap-3.5 xl:gap-6 2xl:gap-8 list-none m-0 p-0">
            {NAV_LINKS.map((item) => (
              <li key={item.path} className="shrink-0">
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `relative py-1 text-white-dim no-underline transition-colors hover:text-gold ${isActive ? 'text-gold active' : ''}`
                  }
                  style={i18n.language === 'am'
                    ? { fontFamily: "'Noto Sans Ethiopic', sans-serif", fontSize: '13px', letterSpacing: 0, textTransform: 'none', fontWeight: 400, whiteSpace: 'nowrap' }
                    : { fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 400, whiteSpace: 'nowrap' }
                  }
                  {...hover}
                >
                  {t(item.label)}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Controls */}
        <div className="hidden lg:flex items-center justify-end gap-2 xl:gap-3 shrink-0">
          <ThemeToggle theme={theme} onToggle={toggleTheme} onHover={hover} />
          <LanguageToggle language={i18n.language} onToggle={() => i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en')} onHover={hover} />

          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                {...hover}
                className="w-9 h-9 xl:w-10 xl:h-10 bg-gold text-black rounded-full font-cinzel text-[11px] font-bold flex items-center justify-center hover:bg-gold-light transition-colors cursor-pointer shrink-0"
              >
                {initials}
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-dark-2 border border-border-gold/25 shadow-2xl rounded-sm overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border-gold/15">
                    <div className="text-[11px] text-white font-medium truncate">{user.name}</div>
                    <div className="text-[9px] text-text-dim truncate">{user.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    {...hover}
                    className="flex items-center gap-3 px-4 py-3 text-[11px] text-white-dim hover:text-gold hover:bg-dark-3 transition-colors no-underline border-b border-border-gold/10"
                  >
                    <i className="fas fa-user-circle text-gold text-sm" />
                    {t('My Profile & Bookings')}
                  </Link>
                  <Link
                    to="/booking"
                    onClick={() => setUserMenuOpen(false)}
                    {...hover}
                    className="flex items-center gap-3 px-4 py-3 text-[11px] text-white-dim hover:text-gold hover:bg-dark-3 transition-colors no-underline border-b border-border-gold/10"
                  >
                    <i className="fas fa-calendar-check text-gold text-sm" />
                    {t('Book a Room')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    {...hover}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] text-red-400 hover:text-red-300 hover:bg-dark-3 transition-colors text-left"
                  >
                    <i className="fas fa-sign-out-alt text-sm" />
                    {t('Sign Out')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openLogin}
              {...hover}
              className="h-9 xl:h-10 flex items-center justify-center text-[9px] xl:text-[10px] tracking-[1.5px] xl:tracking-[2px] uppercase text-white-dim border border-border-gold/30 px-3.5 xl:px-5 hover:border-gold hover:text-gold transition-colors font-montserrat rounded-sm cursor-pointer whitespace-nowrap shrink-0"
            >
              {t('Sign In')}
            </button>
          )}

          <Link
            to="/booking"
            className="nav-book h-9 xl:h-10 flex items-center justify-center font-cinzel text-[9px] xl:text-[10px] tracking-[2px] xl:tracking-[3px] text-black bg-gold px-4 xl:px-6 no-underline transition-all hover:bg-gold-light font-semibold rounded-sm whitespace-nowrap shrink-0"
            {...hover}
          >
            {t('Book Now')}
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="lg:hidden flex justify-end items-center gap-3">
          <ThemeToggle theme={theme} onToggle={toggleTheme} onHover={hover} />
          <LanguageToggle language={i18n.language} onToggle={() => i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en')} onHover={hover} />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gold text-2xl focus:outline-none w-10 h-10 flex items-center justify-center rounded-sm cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            {...hover}
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-black/98 backdrop-blur-xl flex flex-col items-center py-6 gap-5 lg:hidden z-50 shadow-2xl max-h-[calc(100vh-68px)] overflow-y-auto custom-scrollbar">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `font-montserrat text-[12px] tracking-[3px] uppercase text-white-dim no-underline ${isActive ? 'text-gold' : ''}`
                }
                {...hover}
              >
                {t(item.label)}
              </NavLink>
            ))}
            <div className="w-20 h-[1px] bg-border-gold/20 my-1" />
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-montserrat text-[12px] tracking-[3px] uppercase text-gold no-underline"
                  {...hover}
                >
                  {t('My Profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="font-montserrat text-[12px] tracking-[3px] uppercase text-red-400"
                  {...hover}
                >
                  {t('Sign Out')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={openLogin}
                  className="font-montserrat text-[12px] tracking-[3px] uppercase text-white-dim"
                  {...hover}
                >
                  {t('Sign In')}
                </button>
                <button
                  onClick={openRegister}
                  className="font-montserrat text-[12px] tracking-[3px] uppercase text-gold"
                  {...hover}
                >
                  {t('Register')}
                </button>
              </>
            )}
            <Link
              to="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-book font-cinzel text-[10px] tracking-[3px] text-black bg-gold px-8 py-3 no-underline hover:bg-gold-light font-semibold rounded-sm"
              {...hover}
            >
              {t('Book Now')}
            </Link>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
};

export default Navbar;
