import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore, { isBlackTheme } from '../../store/ui/themeStore.js';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '../../store/settings/settingsStore.js';


const Footer = () => {
  const { setCursorHovered, theme } = useUiStore();
  const { t, i18n } = useTranslation();
  const { hotelSettings } = useSettingsStore();

  const handleMouseEnter = () => setCursorHovered(true);
  const handleMouseLeave = () => setCursorHovered(false);

  const isBlack = isBlackTheme(theme);
  const logoSrc = isBlack ? '/logo-black.png' : (hotelSettings.logoUrl || '/logo-dark.svg');

  return (
    <footer className="bg-black px-6 md:px-15 py-16 border-t border-border-gold">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Column 1: Brand */}
        <div className="footer-brand">
          <Link
            to="/"
            className="footer-logo flex items-center h-10 mb-5 no-underline transition-opacity hover:opacity-85"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-2">
              <div className="h-10 w-auto flex items-center justify-center shrink-0">
                <img
                  src={logoSrc}
                  alt={hotelSettings.hotelName || 'Tsedeke Grand Hotel'}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = isBlack ? '/logo-black.png' : '/logo-dark.svg';
                  }}
                  className="h-10 w-10 object-contain rounded"
                  style={{ imageRendering: 'auto', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}
                />
              </div>
              <span className="font-cormorant text-2xl text-gold font-bold tracking-[3px]">{hotelSettings.logoName || 'Tsedeke Grand'}</span>
            </div>
          </Link>
          <p className="text-[13px] leading-relaxed text-white-dim max-w-[260px] font-montserrat">
            {hotelSettings.description || t('A sanctuary of luxury and Ethiopian warmth in the heart of Hossana City. Where every stay becomes a cherished memory.')}
          </p>

          {/* Socials */}
          <div className="footer-social flex gap-3 mt-6">
            {[
              { icon: 'fa-facebook-f', href: hotelSettings.facebook || 'https://facebook.com', label: 'Facebook' },
              { icon: 'fa-instagram', href: hotelSettings.instagram || 'https://instagram.com', label: 'Instagram' },
              { icon: 'fa-twitter', href: hotelSettings.twitter || 'https://twitter.com', label: 'Twitter' },
              { icon: 'fa-tiktok', href: hotelSettings.tiktok || 'https://www.tiktok.com/@grandtsedekehotelresort', label: 'TikTok' },
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="w-[34px] h-[34px] border border-border-gold flex items-center justify-center text-white-dim transition-all hover:border-gold hover:bg-gold/10 hover:text-gold rounded-sm"
              >
                <i className={`fab ${social.icon} text-[13px]`}></i>
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div className="footer-col font-montserrat">
          <h4 className="font-cinzel text-[10px] tracking-[3px] text-gold uppercase mb-5 font-semibold">
            {t('Navigation')}
          </h4>
          <ul className="list-none flex flex-col gap-3">
            {[
              { path: '/', label: 'Home' },
              { path: '/about', label: 'About Us' },
              { path: '/rooms', label: 'Rooms & Suites' },
              { path: '/restaurant', label: 'Restaurant' },
              { path: '/events', label: 'Events & Weddings' },
              { path: '/amenities', label: 'Amenities' },
              { path: '/gallery', label: 'Gallery' },
              { path: '/contact', label: 'Contact Us' },
            ].map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="text-[13px] text-white-dim no-underline transition-colors hover:text-gold"
                >
                  {t(link.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Dining & Events */}
        <div className="footer-col font-montserrat">
          <h4 className="font-cinzel text-[10px] tracking-[3px] text-gold uppercase mb-5 font-semibold">
            {t('Dining & Venues')}
          </h4>
          <ul className="list-none flex flex-col gap-3">
            {[
              { path: '/restaurant', label: 'Fine Dining Restaurant' },
              { path: '/bar', label: 'Lounge Bar' },
              { path: '/coffee-bar', label: 'Coffee Bar' },
              { path: '/wedding', label: 'Wedding Packages' },
              { path: '/conference', label: 'Conference Halls' },
              { path: '/booking', label: 'Make a Reservation' },
            ].map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="text-[13px] text-white-dim no-underline transition-colors hover:text-gold"
                >
                  {t(link.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div className="footer-col font-montserrat">
          <h4 className="font-cinzel text-[10px] tracking-[3px] text-gold uppercase mb-5 font-semibold">
            {t('Contact Info')}
          </h4>
          <ul className="list-none flex flex-col gap-4 text-[13px] text-white-dim">
            <li className="flex items-start gap-3">
              <i className="fas fa-map-marker-alt text-gold mt-0.5 text-sm w-4 shrink-0" />
              <span>
                {hotelSettings.streetAddress || t('Hossana, Hadiya Zone')}
                <br />
                {(hotelSettings.subCity ? `${hotelSettings.subCity}, ` : '') + (hotelSettings.city || 'SNNPR')}, {hotelSettings.country || 'Ethiopia'}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <i className="fas fa-phone text-gold text-sm w-4 shrink-0" />
              <a href={`tel:${hotelSettings.mainPhone || '+251909517777'}`} className="text-white-dim hover:text-gold transition-colors no-underline">
                {hotelSettings.mainPhone || '+251 90 951 7777'}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <i className="fas fa-envelope text-gold text-sm w-4 shrink-0" />
              <a href={`mailto:${hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com'}`} className="text-white-dim hover:text-gold transition-colors no-underline">
                {hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com'}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <i className="fas fa-clock text-gold mt-0.5 text-sm w-4 shrink-0" />
              <span>{t('Front Desk: 24 / 7')}</span>
            </li>
          </ul>

          <div className="mt-6">
            <Link
              to="/booking"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="inline-block bg-gold hover:bg-gold-light text-black font-cinzel text-[10px] tracking-[2.5px] uppercase font-semibold px-6 py-3 no-underline transition-colors rounded-sm cursor-pointer"
            >
              {t('Book Now')}
            </Link>
          </div>
        </div>
      </div>


      {/* Footer Bottom */}
      <div className="footer-bottom max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center pt-7 border-t border-border-gold text-[11px] text-white-dim/40 tracking-wider font-montserrat gap-3">
        <p>© {new Date().getFullYear()} {hotelSettings.tradingName || 'Tsedeke Grand Hotel'}. {t('All rights reserved.')}</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gold transition-colors">{t('Privacy Policy')}</a>
          <span className="text-border-gold/30">·</span>
          <a href="#" className="hover:text-gold transition-colors">{t('Terms of Service')}</a>
          <span className="text-border-gold/30">·</span>
          <p className="text-gold tracking-[2px] font-semibold">
            {((hotelSettings.city || 'Hossana') + ' · ' + (hotelSettings.country || 'Ethiopia')).toUpperCase()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
