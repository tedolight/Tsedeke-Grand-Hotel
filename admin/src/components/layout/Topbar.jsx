import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NotificationPanel from './NotificationPanel.jsx';

const Topbar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const [timeStr, setTimeStr] = useState('');

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const opts = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      setTimeStr(now.toLocaleString('en-US', opts).toUpperCase());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getBreadcrumbName = (pathname) => {
    if (pathname === '/') return 'DASHBOARD';
    const clean = pathname.replace('/', '').toUpperCase();
    return clean || 'DASHBOARD';
  };

  return (
    <header className="h-[64px] bg-dark-2 border-b border-border-gold-soft flex items-center px-4 sm:px-7 gap-3 sm:gap-4 sticky top-0 z-40">
      {/* Mobile Drawer Toggle */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden w-[38px] h-[38px] bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted rounded-md flex items-center justify-center cursor-pointer transition-all shrink-0"
        aria-label="Toggle navigation menu"
      >
        <i className="fas fa-bars text-[16px]" />
      </button>

      {/* Title / Breadcrumbs */}
      <div className="flex items-center font-montserrat min-w-0">
        <h2 className="font-cinzel text-xs sm:text-sm text-[color:var(--text)] tracking-[1px] font-semibold truncate">Tsedeke Grand Hotel And Resort Admin System</h2>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted pl-4 ml-4 border-l border-border-gold-soft shrink-0">
          <span>/</span>
          <span className="text-gold font-medium tracking-[1px]">{getBreadcrumbName(location.pathname)}</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Functional Notification Bell */}
        <NotificationPanel />

        {/* Date Display */}
        <div className="hidden md:block text-[10px] text-text-muted tracking-[1.5px] uppercase pl-4 border-l border-border-gold-soft font-semibold font-montserrat">
          {timeStr}
        </div>
      </div>
    </header>
  );
};

export default Topbar;

