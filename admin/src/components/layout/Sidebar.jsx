import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/auth/authStore.js';
import useThemeStore from '../../store/ui/themeStore.js';
import dashboardService from '../../services/dashboard/dashboardService.js';

const Sidebar = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [badgeCounts, setBadgeCounts] = useState({ bookings: null, messages: null });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await dashboardService.getStats();
        const stats = res.data || res;
        setBadgeCounts({
          bookings: stats.pendingBookings > 0 ? stats.pendingBookings : null,
          messages: stats.unreadMessagesCount > 0 ? stats.unreadMessagesCount : null
        });
      } catch (err) {
        console.error('Failed to fetch sidebar counts:', err);
      }
    };
    fetchCounts();
  }, [location.pathname]); // Refresh counts when navigating

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'CORE',
      items: [
        { path: '/', label: 'Dashboard', icon: 'fas fa-th-large' },
        { path: '/bookings', label: 'Bookings', icon: 'fas fa-calendar-check', badge: badgeCounts.bookings },
        { path: '/rooms', label: 'Rooms', icon: 'fas fa-bed' }
      ]
    },
    {
      label: 'OPERATIONS',
      items: [
        { path: '/restaurant', label: 'Restaurant', icon: 'fas fa-utensils' },
        { path: '/events', label: 'Events', icon: 'fas fa-glass-cheers' },
        { path: '/gallery', label: 'Gallery', icon: 'fas fa-images' },
        { path: '/amenities', label: 'Amenities', icon: 'fas fa-spa' }
      ]
    },
    {
      label: 'COMMUNICATION',
      items: [
        { path: '/messages', label: 'Messages', icon: 'fas fa-envelope', badge: badgeCounts.messages, badgeColor: 'bg-danger text-white' },
        { path: '/testimonials', label: 'Testimonials', icon: 'fas fa-star' }
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { path: '/users', label: 'Users', icon: 'fas fa-users-cog' }
      ]
    },
    {
      label: 'SETTINGS',
      items: [
        { path: '/settings', label: 'Hotel Settings', icon: 'fas fa-cog' },
        { path: '/settings/pricing', label: 'Pricing', icon: 'fas fa-tag' },
        { path: '/settings/notifications', label: 'Notifications', icon: 'fas fa-bell' }
      ]
    }
  ];

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <aside className={`w-[260px] min-w-[260px] bg-dark-2 flex flex-col border-r border-border-gold-soft fixed top-0 left-0 bottom-0 z-50 overflow-y-auto transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      {/* Brand Header */}
      <div className="p-5 sm:p-7 border-b border-border-gold-soft flex items-center justify-between gap-3.5">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-start shrink-0">
            <img
              src="/logo.svg"
              alt="Tsedeke Grand Hotel"
              onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
              className="object-contain"
              style={{ height: '52px', width: '52px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-cinzel text-sm text-gold tracking-[2px] font-semibold leading-none mb-1">TSEDEKE GRAND</span>
            <span className="text-[9px] tracking-[2px] uppercase text-text-muted font-montserrat">HOTEL · HOSSANA</span>
          </div>
        </div>

        {/* Close Button on Mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-text-muted hover:text-white p-1 text-lg"
            aria-label="Close menu"
          >
            <i className="fas fa-times" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 py-4">
        {navItems.map((sec, idx) => (
          <div key={idx} className="px-4 mb-6">
            <h3 className="text-[9px] tracking-[2.5px] uppercase text-text-muted px-3 mb-2 font-semibold">
              {sec.label}
            </h3>
            <ul className="space-y-1">
              {sec.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 p-3 rounded-md text-[13px] font-montserrat transition-all duration-200 hover:bg-dark-4 hover:text-[color:var(--text)] group relative ${isActive
                        ? 'bg-gold-glow border border-border-gold text-gold font-semibold'
                        : 'text-text-muted border border-transparent'
                      }`
                    }
                  >
                    <i className={`${item.icon} text-[14px] w-[18px] text-center shrink-0 group-hover:text-gold`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto font-bold text-[9px] py-0.5 px-1.5 rounded-full shrink-0 ${item.badgeColor || 'bg-gold text-black'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Session Bottom */}
      <div className="p-4 border-t border-border-gold-soft mt-auto">
        <div className="flex items-center gap-3 p-2.5 rounded-md hover:bg-dark-4 transition-colors duration-200 cursor-pointer mb-2">
          <div className="w-[34px] h-[34px] bg-gradient-to-br from-gold-dark to-gold rounded-full flex items-center justify-center text-black font-cinzel font-semibold text-[13px] shrink-0 shadow-md">
            {getInitials(user?.name || 'Ahmed Suleiman')}
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] text-[color:var(--text)] font-medium truncate w-[130px]">{user?.name || 'Ahmed Suleiman'}</span>
            <span className="text-[9px] text-text-muted uppercase tracking-[1px] font-medium">{user?.role || 'Super Admin'}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <button
            onClick={toggleTheme}
            className="flex-1 bg-transparent border border-border-gold hover:border-gold hover:text-gold text-text-muted rounded-md p-2.5 text-[10px] tracking-[2px] uppercase font-montserrat flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 font-semibold"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <><i className="fas fa-moon" /> <span>DARK</span></>
            ) : (
              <><i className="fas fa-sun" /> <span>LIGHT</span></>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex-1 bg-transparent border border-border-gold hover:border-danger hover:text-danger text-text-muted rounded-md p-2.5 text-[10px] tracking-[2px] uppercase font-montserrat flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 font-semibold"
          >
            <i className="fas fa-sign-out-alt" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
