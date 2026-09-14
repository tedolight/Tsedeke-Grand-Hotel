import React, { useState } from 'react';
import NavLogo from './NavLogo.jsx';
import NavLinks from './NavLinks.jsx';
import NavBookButton from './NavBookButton.jsx';
import MobileMenu from './MobileMenu.jsx';
import useUiStore from '../../../store/ui/themeStore.js';

const Navbar = () => {
  const { setCursorHovered } = useUiStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-15 py-5 bg-black/95 backdrop-blur-md transition-all">
      <NavLogo />
      <NavLinks />
      <NavBookButton />
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden text-gold text-2xl focus:outline-none"
        onMouseEnter={() => setCursorHovered(true)}
        onMouseLeave={() => setCursorHovered(false)}
        aria-label="Toggle mobile menu"
      >
        <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`} />
      </button>
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </nav>
  );
};

export default Navbar;
