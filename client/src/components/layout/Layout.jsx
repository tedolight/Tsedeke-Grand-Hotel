import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Cursor from '../common/Cursor.jsx';
import ScrollToTop from '../common/ScrollToTop.jsx';
import Toast from '../ui/feedback/Toast.jsx';
import AiConcierge from '../ai/AiConcierge.jsx';
import useUiStore from '../../store/ui/themeStore.js';
import useSettingsStore from '../../store/settings/settingsStore.js';

const Layout = () => {
  const { initTheme } = useUiStore();
  const { fetchSettings } = useSettingsStore();

  useEffect(() => {
    initTheme();
    fetchSettings();
  }, [initTheme, fetchSettings]);

  return (
    <div className="site-layout min-h-screen bg-black text-white select-none">
      <ScrollToTop />
      <Cursor />
      <Toast />
      <Navbar />
      <main className="pt-[80px] min-h-[calc(100vh-80px)] page-enter">
        <Outlet />
      </main>
      <AiConcierge />
      <Footer />
    </div>
  );
};

export default Layout;
