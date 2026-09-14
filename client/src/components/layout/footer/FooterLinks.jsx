import { useTranslation } from 'react-i18next';
import React from 'react';
import { Link } from 'react-router-dom';

const LINKS = [
  { label: 'Rooms & Suites', to: '/rooms' },
  { label: 'Restaurant', to: '/restaurant' },
  { label: 'Events', to: '/events' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Book Now', to: '/booking' },
];

const FooterLinks = () => {
  const { t } = useTranslation();
  return (

  <div>
    <h4 className="font-cinzel text-[11px] tracking-[3px] uppercase text-gold mb-5 font-semibold">{t('Quick Links')}</h4>
    <ul className="space-y-2.5">
      {LINKS.map((link) => (
        <li key={link.to}>
          <Link to={link.to} className="text-[12px] text-white-dim font-montserrat hover:text-gold no-underline transition-colors duration-200">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>

  );
};


export default FooterLinks;
