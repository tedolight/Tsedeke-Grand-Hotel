import React from 'react';
import FooterBrand from './FooterBrand.jsx';
import FooterLinks from './FooterLinks.jsx';
import FooterContact from './FooterContact.jsx';
import FooterSocials from './FooterSocials.jsx';

const Footer = () => (
  <footer className="bg-dark-2 border-t border-border-gold/20">
    <div className="max-w-7xl mx-auto px-6 md:px-15 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <FooterBrand />
        <FooterLinks />
        <FooterContact />
        <FooterSocials />
      </div>
      <div className="border-t border-border-gold/15 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[11px] text-white-dim/40 font-montserrat">
          © {new Date().getFullYear()} Tsedeke Grand Hotel. All rights reserved.
        </p>
        <div className="flex gap-6">
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
            <a key={item} href="#" className="text-[10px] text-white-dim/40 hover:text-gold font-montserrat no-underline transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
