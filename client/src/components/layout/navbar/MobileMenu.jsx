import React from 'react';
import { NavLink } from 'react-router-dom';
import useUiStore from '../../../store/ui/themeStore.js';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/rooms', label: 'Rooms' },
  { path: '/restaurant', label: 'Restaurant' },
  { path: '/events', label: 'Events' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/contact', label: 'Contact' },
  { path: '/booking', label: 'Book Now' },
];

const MobileMenu = ({ isOpen, onClose }) => {
  const { setCursorHovered } = useUiStore();

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-black/97 border-b border-border-gold backdrop-blur-md flex flex-col items-center py-6 gap-5 lg:hidden z-40">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          onClick={onClose}
          className={({ isActive }) =>
            `font-montserrat text-[12px] tracking-[3px] uppercase no-underline transition-colors ${isActive ? 'text-gold' : 'text-white-dim hover:text-gold'}`
          }
          onMouseEnter={() => setCursorHovered(true)}
          onMouseLeave={() => setCursorHovered(false)}
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
};

export default MobileMenu;
