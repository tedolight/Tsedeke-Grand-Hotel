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
];

const NavLinks = () => {
  const { setCursorHovered } = useUiStore();
  return (
    <ul className="hidden lg:flex items-center gap-9 list-none font-montserrat text-[11px] tracking-[3px] uppercase">
      {NAV_ITEMS.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `relative py-1 text-white-dim no-underline transition-colors hover:text-gold ${isActive ? 'text-gold' : ''}`
            }
            onMouseEnter={() => setCursorHovered(true)}
            onMouseLeave={() => setCursorHovered(false)}
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default NavLinks;
