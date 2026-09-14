import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarMenu = ({ label, items }) => {
  return (
    <div className="px-4 mb-6">
      {label && (
        <h3 className="text-[9px] tracking-[2.5px] uppercase text-text-muted px-3 mb-2 font-semibold">
          {label}
        </h3>
      )}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 p-3 rounded-md text-[13px] font-montserrat transition-all duration-200 hover:bg-dark-4 hover:text-white group relative ${
                  isActive
                    ? 'bg-gold-glow border border-border-gold text-gold font-semibold'
                    : 'text-text-muted border border-transparent'
                }`
              }
            >
              <i className={`${item.icon} text-[14px] w-[18px] text-center shrink-0 group-hover:text-gold`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`ml-auto font-bold text-[9px] py-0.5 px-1.5 rounded-full shrink-0 ${
                  item.badgeColor || 'bg-gold text-black'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarMenu;
