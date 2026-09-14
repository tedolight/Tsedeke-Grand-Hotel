import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import useUiStore from '../../../store/ui/themeStore.js';
import contactService from '../../../services/contact/contactService.js';

const SOCIALS = [
  { label: 'Facebook', icon: 'f', href: 'https://facebook.com' },
  { label: 'Instagram', icon: 'in', href: 'https://instagram.com' },
  { label: 'Twitter', icon: 'tw', href: 'https://twitter.com' },
  { label: 'TikTok', icon: 'tt', href: 'https://www.tiktok.com/@grandtsedekehotelresort' },
];

const FooterSocials = () => {
  const { t } = useTranslation();

  const { setCursorHovered, addToast } = useUiStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      addToast('Please enter a valid email address', 'error');
      return;
    }
    setLoading(true);
    try {
      await contactService.submit({
        name: 'Newsletter Subscriber',
        email,
        subject: 'Newsletter Subscription',
        message: 'Please add this email to the Tsedeke Grand Hotel newsletter list.',
      });
      addToast('Thank you for subscribing!', 'success');
      setEmail('');
    } catch (err) {
      addToast(err.message || 'Subscription failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="font-cinzel text-[11px] tracking-[3px] uppercase text-gold mb-5 font-semibold">{t('Follow Us')}</h4>
      <div className="flex gap-3 mb-6">
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="w-9 h-9 border border-border-gold/30 text-white-dim/60 font-cinzel text-[10px] flex items-center justify-center hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 no-underline"
            onMouseEnter={() => setCursorHovered(true)}
            onMouseLeave={() => setCursorHovered(false)}
          >
            {s.icon}
          </a>
        ))}
      </div>
      <div>
        <h4 className="font-cinzel text-[10px] tracking-[3px] uppercase text-gold mb-3 font-semibold">{t('Newsletter')}</h4>
        <form onSubmit={handleNewsletter} className="flex">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('Your email')}
            disabled={loading}
            className="bg-dark-3 border border-border-gold/20 border-r-0 text-white font-montserrat text-[12px] px-3 py-2.5 outline-none focus:border-gold flex-1 placeholder:text-white-dim/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gold text-black font-cinzel text-[9px] tracking-[1px] px-3 hover:bg-gold-light transition-colors border border-gold disabled:opacity-50"
          >
            {loading ? '…' : '→'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FooterSocials;
