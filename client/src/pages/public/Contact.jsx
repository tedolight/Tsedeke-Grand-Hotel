import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';
import useAuthStore from '../../store/auth/authStore.js';
import AuthModal from '../../components/common/AuthModal.jsx';
import api from '../../services/api/api.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '../../store/settings/settingsStore.js';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../components/ui/AnimatedSection.jsx';

const Contact = () => {
  const { t, i18n } = useTranslation();
  const { hotelSettings } = useSettingsStore();
  usePageMeta(t('Contact Us'), t('Get in touch with {{hotelName}} in {{city}}, Ethiopia. Phone, email, or our online form — our concierge is available 24/7.', { hotelName: hotelSettings.hotelName || 'Tsedeke Grand Hotel', city: hotelSettings.city || 'Hossana' }));
  const { setCursorHovered, addToast } = useUiStore();
  const { isAuthenticated } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Enquiry');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleMouseEnter = () => setCursorHovered(true);
  const handleMouseLeave = () => setCursorHovered(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Auth gate — must be logged in
    if (!isAuthenticated) {
      addToast(t('Please sign in to send us a message'), 'error');
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }

    if (!firstName || !lastName || !email || !message) {
      addToast(t('Please fill in name, email, and message'), 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: `${firstName} ${lastName}`,
        email,
        subject,
        message: `${message}\n\nContact Phone: ${phone}`
      };
      await api.post('/contact', payload);
      setSuccess(true);
      addToast(t('Your query was submitted successfully!'), 'success');
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      addToast(err.message || t('Failed to submit query. Please try again.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="contact-page select-none">
        {/* ─── PAGE HERO ─── */}
        <div className="page-hero relative h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden pt-[68px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/images/reception.png')`
            }}
          />
          <div className="page-hero-content relative z-10 text-center px-4 sm:px-6">
            <AnimatedText tag="span" animation="fade-down" delay={100} className="hero-3d-badge mb-5 block">{t('✦ Get in Touch')}</AnimatedText>
            <AnimatedText tag="h1" animation="fade-up" delay={300} className="hero-3d-title text-3xl md:text-5xl leading-tight mb-4">{t('Contact')} <span className="hero-3d-gold">{t('Us')}</span></AnimatedText>
            <AnimatedText tag="p" animation="fade-up" delay={500} className="hero-3d-sub mt-6 text-[12px] tracking-[2.5px] uppercase">
              <Link to="/" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="no-underline">{t('Home')}</Link> &nbsp;/&nbsp; {t('Contact Us')}
            </AnimatedText>
          </div>
        </div>

        {/* ─── CONTACT SECTION ─── */}
        <section className="py-24 px-6 md:px-15 bg-black">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left Column - Contact Info */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold mb-3.5 block font-semibold font-montserrat">
                  {(hotelSettings.tradingName || 'Tsedeke Grand Hotel')} · {(hotelSettings.city || 'Hossana')}
                </AnimatedText>
                <AnimatedText tag="h2" animation="fade-up" delay={200} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-5 text-white">{t("We'd love")}<br />{t('to')} <span className="italic text-gold-light">{t('hear from you')}</span></AnimatedText>
                <AnimatedSection animation="scale" delay={300} className="gold-line" />
                <AnimatedText tag="p" animation="fade-up" delay={400} className="text-[14px] leading-relaxed text-white-dim mb-10 font-montserrat">
                  {t("Whether you're planning a stay, hosting an event, or have questions about our dining, our team is on hand around the clock to assist you with everything you need.")}
                </AnimatedText>
              </div>

              <div className="flex flex-col gap-[2px] bg-border-gold/15 border border-border-gold/15 rounded-sm overflow-hidden">
                {[
                  {
                    icon: '📍',
                    label: 'Location',
                    val: hotelSettings.streetAddress || 'Hossana, Hadiya Zone',
                    sub: `${hotelSettings.subCity ? `${hotelSettings.subCity}, ` : ''}${hotelSettings.city || 'SNNPR'}, ${hotelSettings.country || 'Ethiopia'}`
                  },
                  {
                    icon: '📞',
                    label: 'Telephone',
                    val: hotelSettings.mainPhone || '+251 90 951 7777',
                    sub: t('24 hours · 7 days a week')
                  },
                  {
                    icon: '✉️',
                    label: 'Email',
                    val: hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com',
                    sub: t('We reply within 2 business hours')
                  }
                ].map((card, idx) => (
                  <AnimatedCard key={idx} index={idx} animation="fade-right" className="flex items-start gap-5 p-6 bg-dark-2 border-l-2 border-transparent hover:border-gold hover:bg-dark-3 transition-all duration-300">
                    <div className="w-11 h-11 bg-gold/10 border border-gold/25 flex items-center justify-center text-lg text-gold flex-shrink-0 rounded-sm">
                      {card.icon}
                    </div>
                    <div className="font-montserrat">
                      <div className="text-[9px] tracking-[2px] uppercase text-gold mb-1 font-semibold">{t(card.label)}</div>
                      <div className="text-[14px] text-white font-medium">{card.val}</div>
                      <div className="text-[11px] text-white-dim/60 mt-0.5">{card.sub}</div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>

              <AnimatedSection animation="fade-up" className="bg-dark-2 p-7 border border-border-gold/20 rounded-sm">
                <div className="text-[9px] tracking-[2px] uppercase text-gold mb-4.5 block font-semibold font-montserrat border-b border-border-gold/10 pb-3">{t('Front Desk Hours')}</div>
                <div className="flex flex-col gap-3 font-montserrat text-[13px]">
                  {[
                    { name: 'Lobby & Reception', time: '24 / 7', active: true },
                    { name: 'Restaurant - Breakfast', time: `${hotelSettings.breakfastStart || '6:00 AM'} – ${hotelSettings.breakfastEnd || '10:30 AM'}` },
                    { name: 'Restaurant - Lunch', time: `${hotelSettings.lunchStart || '12:00 PM'} – ${hotelSettings.lunchEnd || '3:00 PM'}` },
                    { name: 'Restaurant - Dinner', time: `${hotelSettings.dinnerStart || '6:30 PM'} – ${hotelSettings.dinnerEnd || '10:30 PM'}` },
                    { name: 'Coffee Bar', time: '7:00 AM – 11:00 PM' }
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-border-gold/5 last:border-b-0 pb-2">
                      <span className="text-white-dim">{t(row.name)}</span>
                      <span className={`font-semibold ${row.active ? 'text-gold' : 'text-white'}`}>{t(row.time)}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            {/* Right Column - Contact Form */}
            <div className="lg:col-span-7">
              <AnimatedSection animation="fade-up" delay={200} className="bg-dark-3 border border-border-gold/20 p-8 md:p-12 rounded-sm shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold-dark via-gold to-gold-light" />

                {!success ? (
                  <form className="font-montserrat" onSubmit={handleSubmit}>
                    <h3 className="font-cormorant text-3xl font-light text-white mb-1">{t('Send us a Message')}</h3>
                    <p className="text-[13px] text-white-dim mb-8">{t('Fill in the form and our concierge desk will respond shortly.')}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] tracking-[2px] uppercase text-gold font-semibold">{t('First Name')}</label>
                        <input
                          type="text"
                          placeholder={t('e.g. Tigist')}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-black border border-border-gold/15 text-white p-3 outline-none focus:border-gold w-full text-[13.5px] rounded-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] tracking-[2px] uppercase text-gold font-semibold">{t('Last Name')}</label>
                        <input
                          type="text"
                          placeholder={t('e.g. Bekele')}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-black border border-border-gold/15 text-white p-3 outline-none focus:border-gold w-full text-[13.5px] rounded-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] tracking-[2px] uppercase text-gold font-semibold">{t('Email Address')}</label>
                        <input
                          type="email"
                          placeholder={t('you@example.com')}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-black border border-border-gold/15 text-white p-3 outline-none focus:border-gold w-full text-[13.5px] rounded-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] tracking-[2px] uppercase text-gold font-semibold">{t('Phone Number')}</label>
                        <input
                          type="tel"
                          placeholder={t('+251 9XX XXX XXX')}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-black border border-border-gold/15 text-white p-3 outline-none focus:border-gold w-full text-[13.5px] rounded-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-4">
                      <label className="text-[9px] tracking-[2px] uppercase text-gold font-semibold">{t('Subject')}</label>
                      <div className="flex flex-wrap gap-2">
                        {['General Enquiry', 'Room Reservation', 'Event Planning', 'Restaurant', 'Feedback', 'Other'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSubject(tag)}
                            className={`py-1.5 px-4 text-[11px] tracking-wide cursor-pointer transition-all rounded-sm border ${subject === tag
                              ? 'bg-gold/10 border-gold text-gold font-semibold'
                              : 'bg-black border-border-gold/20 text-white-dim hover:border-gold hover:text-gold'
                              }`}
                          >
                            {t(tag)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-6">
                      <label className="text-[9px] tracking-[2px] uppercase text-gold font-semibold">{t('Message')}</label>
                      <textarea
                        placeholder={t('Tell us how we can help you…')}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-black border border-border-gold/15 text-white p-3 outline-none focus:border-gold w-full text-[13.5px] min-h-[120px] rounded-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-gold w-full py-4 text-xs font-semibold uppercase tracking-[2px] flex items-center justify-center gap-2 rounded-sm"
                      disabled={loading}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {loading ? t('Sending...') : t('Send Message')}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gold text-black flex items-center justify-center text-3xl mx-auto mb-6 rounded-full font-bold shadow-lg">✓</div>
                    <h3 className="font-cormorant text-3xl font-light text-white mb-2">{t('Message Sent!')}</h3>
                    <p className="text-[14px] text-white-dim leading-relaxed max-w-sm mx-auto">{t('Thank you for reaching out. Our concierge desk will review your message and reply within 2 business hours.')}</p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="btn-outline mt-8"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {t('Send Another Message')}
                    </button>
                  </div>
                )}
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ─── MAP SECTION ─── */}
        <section className="py-12 px-6 md:px-15 bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <AnimatedText tag="span" className="text-[9px] tracking-[2px] uppercase text-gold font-mono block mb-2">{t('Find Us')}</AnimatedText>
              <AnimatedText tag="h2" animation="fade-up" delay={200} className="font-cormorant text-3xl md:text-5xl leading-tight text-white font-light">
                {t('Our Location in')} <span className="italic text-gold-light">{hotelSettings.city || 'Hossana'}</span>
              </AnimatedText>
            </div>
            <AnimatedSection animation="scale" className="w-full h-[450px] bg-dark-3 border border-border-gold/20 overflow-hidden rounded-sm shadow-xl relative">
              <iframe
                title="Tsedeke Grand Hotel Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.6201625091726!2d37.8573708!3d7.566884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17b249006a5a3c27%3A0xacbe2c03ded69975!2sTSEDEKE%20GRAND%20HOTEL!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-none filter grayscale-[30%] invert-[90%] hue-rotate-180"
              />
              <a
                href="https://maps.google.com/?q=Tsedeke+Grand+Hotel,Hossana,Ethiopia&cid=12443476993461510517"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-5 right-5 bg-black border border-border-gold/30 text-white-dim text-[11px] tracking-wide py-2.5 px-4.5 rounded-sm hover:border-gold hover:text-gold flex items-center gap-2 transition-colors z-10"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {t('Open in Google Maps')}
              </a>
            </AnimatedSection>
          </div>
        </section>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
};

export default Contact;

