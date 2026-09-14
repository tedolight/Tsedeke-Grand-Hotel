import React, { useState, useEffect } from 'react';
import useUiStore from '../../store/ui/themeStore.js';
import useAuthStore from '../../store/auth/authStore.js';
import AuthModal from '../../components/common/AuthModal.jsx';
import api from '../../services/api/api.js';
import { unwrapData } from '../../utils/apiHelpers.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '../../store/settings/settingsStore.js';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../components/ui/AnimatedSection.jsx';
import { getImageUrl } from '../../utils/helpers/imageHelpers.js';

// ─── Fallback static data (used when API is unavailable) ───────────────────
const FALLBACK_PACKAGES = [];

const FALLBACK_VENUES = [];

const Events = () => {
  const { t, i18n } = useTranslation();
  const { hotelSettings } = useSettingsStore();
  const establishedYear = hotelSettings.establishedYear || 2024;
  const yearsOfLove = new Date().getFullYear() - establishedYear;
  usePageMeta(t('Events & Weddings'), t('Host your wedding, conference, or corporate event at {{hotelName}}. Premium venues, expert coordination, and elegant packages in {{city}}.', { hotelName: hotelSettings.hotelName || 'Tsedeke Grand Hotel', city: hotelSettings.city || 'Hossana' }));
  const { setCursorHovered, addToast } = useUiStore();
  const { isAuthenticated } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  // ─── Data State ────────────────────────────────────────────────────────────
  const [weddingPackages, setWeddingPackages] = useState(FALLBACK_PACKAGES);
  const [venues, setVenues] = useState(FALLBACK_VENUES);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [venuesLoading, setVenuesLoading] = useState(false);

  // ─── Enquiry Form State ────────────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState('Wedding Ceremony & Reception');
  const [preferredDate, setPreferredDate] = useState('');
  const [expectedGuests, setExpectedGuests] = useState('81 – 150');
  const [preferredVenue, setPreferredVenue] = useState('Shenkola');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('#wedding');

  // ─── Fetch from API ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPackages = async () => {
      setPackagesLoading(true);
      try {
        const res = await api.get('/events/packages');
        const data = unwrapData(res);
        if (data && data.length > 0) {
          // Normalize to expected format
          const normalized = data.map((pkg) => ({
            _id: pkg._id,
            name: pkg.name,
            category: pkg.category?.toLowerCase() || 'wedding',
            capacity: pkg.capacity || `Up to ${pkg.maxGuests || 100} guests`,
            price: pkg.price || 0,
            popular: pkg.popular || pkg.isFeatured || false,
            features: pkg.features || pkg.inclusions || []
          }));
          setWeddingPackages(normalized.filter(p => p.category === 'wedding' || p.category === 'events'));
        }
      } catch (err) {
        // Stay with fallback data silently
      } finally {
        setPackagesLoading(false);
      }
    };

    const fetchVenues = async () => {
      setVenuesLoading(true);
      try {
        const res = await api.get('/events');
        const data = unwrapData(res);
        if (data && data.length > 0) {
          const normalized = data.map((venue) => ({
            _id: venue._id,
            name: venue.name,
            category: venue.category || (venue.name.toLowerCase().includes('ballroom') ? 'Wedding' : venue.name.toLowerCase().includes('hall') ? 'Conference' : 'Birthday'),
            images: venue.images || [],
            capacity: venue.capacity ? `${venue.capacity} pax` : 'N/A',
            setup: Array.isArray(venue.setupOptions) ? venue.setupOptions.join(' · ') : venue.setup || 'Flexible',
            avEquipment: Array.isArray(venue.avEquipment) ? venue.avEquipment.join(' · ') : venue.avEquipment || 'Standard AV',
            halfDayPrice: venue.halfDayPrice || venue.priceHalfDay || 0,
            fullDayPrice: venue.fullDayPrice || venue.priceFullDay || 0,
            status: venue.status || 'Available'
          }));
          setVenues(normalized);
        }
      } catch (err) {
        // Stay with fallback data silently
      } finally {
        setVenuesLoading(false);
      }
    };

    fetchPackages();
    fetchVenues();
  }, []);

  // ─── Scroll Spy for Active Tab ───────────────────────────────────────────
  useEffect(() => {
    const sections = ['#wedding', '#conference', '#banquet', '#meeting', '#enquiry'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (const id of sections) {
        const el = document.querySelector(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = () => setCursorHovered(true);
  const handleMouseLeave = () => setCursorHovered(false);

  const handleEnquiry = async (e) => {
    e.preventDefault();

    // Auth gate — must be logged in
    if (!isAuthenticated) {
      addToast(t('Please sign in to submit an event enquiry'), 'error');
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }

    if (!fullName || !phone || !email || !preferredDate) {
      addToast(t('Please fill in name, phone, email, and preferred date'), 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/events/enquiries', {
        fullName,
        phone,
        email,
        eventType,
        preferredDate,
        expectedGuests,
        preferredVenue,
        message
      });
      addToast(t('Event enquiry submitted successfully! Our events team will contact you soon.'), 'success');
      // Reset form
      setFullName('');
      setPhone('');
      setEmail('');
      setPreferredDate('');
      setMessage('');
    } catch (err) {
      addToast(t(err.message) || t('Failed to submit event enquiry'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ─── Dynamic venue names for select dropdown ──────────────────────────────
  const venueNames = venues.map(v => v.name);

  return (
    <>
      <div className="events-page select-none">
        {/* ─── HERO SECTION ─── */}
        <section className="page-hero relative h-[65vh] min-h-[480px] flex items-center px-6 md:px-15 overflow-hidden pt-[68px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/images/custom/events-hero.jpg')`
            }}
          />

          <div className="page-hero-content relative z-10 max-w-2xl text-left">
            <AnimatedText tag="div" animation="fade-right" delay={100} className="hero-3d-badge mb-3 flex items-center gap-3">
              <span className="w-10 block" /> {t('{{hotel}} · {{city}}', { hotel: hotelSettings.tradingName || 'Tsedeke Grand Hotel', city: hotelSettings.city || 'Hossana' })}
            </AnimatedText>
            <AnimatedText tag="h1" animation="fade-up" delay={300} className="hero-3d-title text-3xl md:text-5xl leading-tight mb-4">
              {t('Create')}<br /><em className="hero-3d-gold">{t('Unforgettable')}</em><br />{t('Moments')}
            </AnimatedText>
            <AnimatedText tag="p" animation="fade-up" delay={500} className="hero-3d-sub text-xs md:text-sm leading-relaxed mb-6 max-w-[480px]">
              {t('From intimate wedding ceremonies to grand corporate conferences, {{hotelName}} delivers flawless events in the heart of {{city}}.', { hotelName: hotelSettings.tradingName || 'Tsedeke Grand Hotel', city: hotelSettings.city || 'Hossana' })}
            </AnimatedText>
            <AnimatedSection tag="div" animation="scale" delay={700} className="flex gap-4 flex-wrap">
              <button onClick={() => scrollToSection('#enquiry')} className="btn-gold font-jost" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>{t('Plan Your Event')}</button>
              <button onClick={() => scrollToSection('#wedding')} className="btn-outline font-jost" style={{ background: 'none', border: '1px solid var(--color-gold)', cursor: 'pointer' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>{t('Explore Venues')}</button>
            </AnimatedSection>
          </div>

          <div className="absolute right-[8%] top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-10">
            {[
              { num: '500+', label: 'Events Hosted' },
              { num: venues.length > 0 ? `${venues.length}` : '4', label: 'Unique Venues' },
              { num: '300', label: 'Max Capacity' }
            ].map((stat, i) => (
              <AnimatedCard key={i} index={i} animation="scale" className="bg-black/80 border-2 border-gold/60 p-5 w-48 text-center backdrop-blur-md rounded-md shadow-2xl hover:border-gold transition-all duration-300">
                <div className="font-cinzel text-4xl text-gold leading-none font-bold drop-shadow-lg">{stat.num}</div>
                <div className="text-[11px] tracking-[2px] uppercase text-white font-bold font-montserrat mt-2.5">{t(stat.label)}</div>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* ─── EVENT TYPE TABS (STICKY) ─── */}
        <div className="bg-dark-2/95 backdrop-blur-md px-6 md:px-15 border-b border-border-gold/25 sticky top-[78px] z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-start md:justify-center items-center gap-1 md:gap-4 h-[64px] overflow-x-auto no-scrollbar">
            {[
              { icon: '💍', label: 'Wedding', id: '#wedding' },
              { icon: '🎤', label: 'Conference', id: '#conference' },
              { icon: '🥂', label: 'Banquet', id: '#banquet' },
              { icon: '📋', label: 'Meetings', id: '#meeting' },
              { icon: '✉️', label: 'Enquiry', id: '#enquiry' }
            ].map((tab) => {
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`group relative h-full flex items-center gap-2 px-3.5 md:px-5 text-xs font-montserrat tracking-[2px] uppercase transition-all duration-300 cursor-pointer font-medium whitespace-nowrap ${
                    isActive
                      ? 'text-gold font-semibold'
                      : 'text-white-dim hover:text-white'
                  }`}
                  onClick={() => {
                    setActiveSection(tab.id);
                    scrollToSection(tab.id);
                  }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <span className="text-sm opacity-90 transition-transform group-hover:scale-110">{tab.icon}</span>
                  <span>{t(tab.label)}</span>

                  {/* Golden Underline Bar */}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-gold-dark via-gold to-gold-light opacity-100 shadow-[0_0_10px_rgba(201,168,76,0.7)]'
                        : 'bg-gold/40 opacity-0 group-hover:opacity-100 scale-x-75 group-hover:scale-x-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── WEDDING SECTION ─── */}
        <section className="py-24 px-6 md:px-15 bg-black" id="wedding">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-20">
              <AnimatedSection animation="fade-right" className="relative max-w-lg mx-auto lg:mx-0 w-full">
                {venues.filter(v => v.category?.toLowerCase() === 'wedding' && v.images && v.images.length > 0).length > 0 ? (
                  <div className="w-full aspect-[4/3] overflow-hidden border border-border-gold/20 relative rounded-sm shadow-lg">
                    <img
                      src={getImageUrl(venues.filter(v => v.category?.toLowerCase() === 'wedding' && v.images && v.images.length > 0)[0].images[0])}
                      alt="Wedding Venue"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] bg-gradient-to-tr from-gold/5 via-transparent to-transparent border border-border-gold/20 flex items-center justify-center text-[100px] relative rounded-sm shadow-inner">
                    <div className="absolute inset-3 border border-border-gold/10" />
                    💍
                  </div>
                )}
                <div className="absolute -bottom-5 -right-5 bg-gold text-black p-4 text-center rounded-sm shadow-lg">
                  <div className="font-cormorant text-2xl font-semibold leading-none">{yearsOfLove}+</div>
                  <div className="text-[9px] tracking-[2px] uppercase font-bold mt-1 font-montserrat">{t('Years of Love Stories')}</div>
                </div>
              </AnimatedSection>

              <div className="space-y-6">
                <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('Wedding Celebrations')}</AnimatedText>
                <AnimatedText tag="h2" animation="fade-up" delay={200} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-5">{t('Your Perfect')}<br /><em>{t('Wedding Day')}</em></AnimatedText>
                <AnimatedSection animation="scale" delay={300} className="gold-line"></AnimatedSection>
                <AnimatedText tag="p" animation="fade-up" delay={400} className="font-montserrat text-[14px] leading-relaxed text-white-dim mb-8">
                  {t('Begin your forever at {{hotelName}}, where every detail is curated to reflect your unique love story. Our dedicated wedding team handles everything from elegant decorations to exquisite dining, ensuring a day beyond imagination.', { hotelName: hotelSettings.tradingName || 'Tsedeke Grand Hotel' })}
                </AnimatedText>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {venues.filter(v => v.category?.toLowerCase() === 'wedding').slice(0, 4).map((venue, i) => (
                    <AnimatedCard key={venue._id || i} index={i} animation="fade-left" className="border-l-2 border-gold pl-4">
                      <div className="font-cormorant text-lg text-white font-medium mb-1">{t(venue.name)}</div>
                      <div className="text-[13px] text-white-dim font-montserrat">{t(venue.capacity)}</div>
                    </AnimatedCard>
                  ))}
                </div>
                <AnimatedSection animation="scale" delay={500}>
                  <button onClick={() => scrollToSection('#enquiry')} className="btn-gold" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>{t('Request Wedding Quote')}</button>
                </AnimatedSection>
              </div>
            </div>

            {/* Wedding Packages Grid */}
            <div className="mt-20">
              <div className="text-center mb-10">
                <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('Wedding Packages')}</AnimatedText>
                <AnimatedText tag="h3" animation="fade-up" delay={200} className="text-3xl md:text-4xl font-cormorant font-light">{t('Choose Your')} <em>{t('Package')}</em></AnimatedText>
                <AnimatedSection animation="scale" delay={300} className="gold-line center" />
              </div>
              {packagesLoading ? (
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-dark-2 p-6 rounded-lg animate-pulse border border-border-gold/15">
                      <div className="h-5 bg-white/5 rounded mb-3 w-3/4" />
                      <div className="h-3 bg-white/5 rounded mb-4 w-1/2" />
                      <div className="h-8 bg-white/5 rounded mb-4 w-1/3" />
                      <div className="space-y-2.5">
                        {[1, 2, 3, 4].map(j => <div key={j} className="h-2.5 bg-white/5 rounded w-full" />)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(weddingPackages.length > 0 ? weddingPackages : FALLBACK_PACKAGES).map((pkg, i) => (
                    <AnimatedCard key={pkg._id || i} index={i} animation="flip-up" className={`premium-card relative p-6 md:p-7 rounded-xl border border-border-gold/25 group flex flex-col items-center text-center transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(201,168,76,0.15)] hover:border-gold/70 cursor-pointer ${pkg.popular ? 'border-gold bg-dark-3/70' : 'bg-dark-2/90'}`}>
                      {/* Hover Glow Background */}
                      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"></div>

                      {/* Animated Top Border */}
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center rounded-t-xl"></div>

                      {pkg.popular && <span className="absolute top-3.5 right-3.5 bg-gold text-black font-montserrat text-[8px] tracking-[1.5px] uppercase py-0.5 px-2.5 font-bold rounded-sm shadow-md animate-pulse">{t('Most Popular')}</span>}

                      <div className="relative z-10 w-full flex flex-col items-center flex-1">
                        <div className="font-cormorant text-2xl md:text-[26px] text-white font-medium mb-1.5 transition-colors duration-300 group-hover:text-gold">{t(pkg.name)}</div>
                        <div className="text-white-dim text-[11px] tracking-[1px] font-montserrat mb-3.5 opacity-80">{t(pkg.capacity)}</div>

                        <div className="font-cormorant text-3xl md:text-4xl text-gold leading-none mb-3.5 transform transition-transform duration-300 group-hover:scale-105 origin-center font-normal">
                          {(pkg.price || 0).toLocaleString()} <span className="text-xs font-montserrat text-white-dim font-light">{t('ETB')}</span>
                        </div>

                        <div className="h-[1px] bg-gold/40 my-3 mx-auto transition-all duration-500 w-8 group-hover:w-16" />

                        <ul className="list-none flex flex-col gap-2 mb-6 text-[12px] text-white-dim/90 font-montserrat w-full text-left flex-1">
                          {(pkg.features || []).map((feat, fIdx) => (
                            <li key={fIdx} className="flex gap-2.5 items-start leading-tight">
                              <span className="text-gold font-semibold text-xs">—</span> {t(feat)}
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => scrollToSection('#enquiry')}
                          className="w-full mt-auto relative overflow-hidden bg-transparent border border-border-gold/40 text-gold py-2.5 text-[10px] tracking-[2px] uppercase font-semibold cursor-pointer transition-all duration-300 hover:border-gold hover:bg-gold hover:text-black font-jost rounded-sm"
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          <span className="relative z-10">{t('Select Package')}</span>
                        </button>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── CONFERENCE SECTION ─── */}
        <section className="py-24 px-6 md:px-15 bg-dark" id="conference">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">
              <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('Corporate Events')}</AnimatedText>
              <AnimatedText tag="h2" animation="fade-up" delay={200} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-5">{t('Conference &')}<br /><em>{t('Business Events')}</em></AnimatedText>
              <AnimatedSection animation="scale" delay={300} className="gold-line"></AnimatedSection>
              <AnimatedText tag="p" animation="fade-up" delay={450} className="font-montserrat text-[14px] leading-relaxed text-white-dim mb-8">
                {t('State-of-the-art facilities equipped with the latest technology, perfect for conferences, seminars, product launches and corporate gatherings. High-speed internet, full AV setup and professional catering included.')}
              </AnimatedText>
              <div className="grid grid-cols-2 gap-3 mt-6 font-montserrat">
                {[
                  { icon: '👥', label: 'Max Capacity', val: '200 Delegates' },
                  { icon: '📡', label: 'Internet Speed', val: '100 Mbps' },
                  { icon: '🎬', label: 'Screen Size', val: '200" Projector' },
                  { icon: '🎤', label: 'Sound System', val: 'Full PA + Wireless' }
                ].map((spec, i) => (
                  <AnimatedCard key={i} index={i} animation="scale" className="premium-card p-3.5 md:p-4 group rounded-lg border border-border-gold/20 hover:border-gold/60 transition-all duration-300">
                    <div className="text-xl mb-1.5">{spec.icon}</div>
                    <div className="text-[9px] tracking-[1.5px] uppercase text-white-dim/70 mb-0.5 font-semibold">{t(spec.label)}</div>
                    <div className="font-cormorant text-base md:text-lg text-gold font-semibold leading-tight">{t(spec.val)}</div>
                  </AnimatedCard>
                ))}
              </div>
              <AnimatedSection animation="scale" delay={500}>
                <button onClick={() => scrollToSection('#enquiry')} className="btn-gold" style={{ marginTop: '32px' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>{t('Request Conference Quote')}</button>
              </AnimatedSection>
            </div>
            <AnimatedSection animation="fade-left" className="relative text-center w-full">
              <div className="w-full aspect-[4/3] overflow-hidden border border-border-gold/20 relative rounded-sm shadow-lg group">
                <img
                  src="/images/custom/1.jpg"
                  alt="Conference Venue"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ─── BANQUET SECTION ─── */}
        <section className="py-24 px-6 md:px-15 bg-dark-2" id="banquet">
          <div className="max-w-7xl mx-auto">
            <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold block mb-3 font-semibold font-montserrat">{t('Celebrations')}</AnimatedText>
            <AnimatedText tag="h2" animation="fade-up" delay={200} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-5">{t('Banquet &')}<br /><em>{t('Special Occasions')}</em></AnimatedText>
            <AnimatedSection animation="scale" delay={300} className="gold-line"></AnimatedSection>
            <div className="flex flex-col lg:flex-row gap-5 h-[520px] lg:h-[420px] mt-12 w-full">
              {[
                { image: '/images/custom/7.jpg', name: 'Birthday Celebrations', cap: 'Up to 150 guests', desc: 'Personalized décor, custom cake, DJ setup and a dedicated event host.' },
                { image: '/images/custom/5.jpg', name: 'Graduation Parties', cap: 'Up to 200 guests', desc: 'Celebrate academic achievements in style. Stage setup and buffet dining.' },
                { image: '/images/custom/restaurant.jpg', name: 'Corporate Dinners', cap: 'Up to 120 guests', desc: 'Private venue, premium customized menu, and impeccable service.' }
              ].map((banq, i) => (
                <AnimatedCard
                  key={i}
                  index={i}
                  animation="fade-up"
                  className="relative flex-1 group hover:flex-[2.5] transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer overflow-hidden rounded-xl border border-border-gold/20 shadow-2xl on-dark-surface"
                >
                  {/* Image Background */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={banq.image}
                      alt={banq.name}
                      className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 brightness-95 group-hover:brightness-75"
                      style={{ imageRendering: 'auto' }}
                    />
                    <div
                      className="absolute inset-0 transition-opacity duration-1000 opacity-90 group-hover:opacity-100"
                      style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.2), transparent)' }}
                    ></div>
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 p-6 lg:p-10 flex flex-col justify-end z-10 overflow-hidden">
                    {/* min-w to prevent text wrap on shrink */}
                    <div className="min-w-[280px]">
                      <div className="w-8 h-[2px] bg-gold mb-4 transition-all duration-1000 group-hover:w-16"></div>

                      <div className="font-cormorant text-3xl md:text-4xl text-white font-medium mb-1 transform transition-transform duration-[1200ms] translate-y-6 group-hover:translate-y-0 drop-shadow-lg whitespace-nowrap">
                        {t(banq.name)}
                      </div>

                      <div className="text-[11px] tracking-[2px] uppercase text-gold mb-3 font-semibold font-montserrat transform transition-transform duration-[1200ms] translate-y-6 group-hover:translate-y-0 opacity-70 group-hover:opacity-100">
                        {t(banq.cap)}
                      </div>

                      {/* Collapsible Details */}
                      <div className="overflow-hidden transition-all duration-[1200ms] max-h-0 opacity-0 group-hover:max-h-[150px] group-hover:opacity-100 lg:mt-3">
                        <p className="font-montserrat text-[13px] text-white leading-relaxed drop-shadow-md w-full whitespace-normal pr-4">
                          {t(banq.desc)}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); scrollToSection('#enquiry'); }}
                          className="mt-6 border border-gold text-gold hover:bg-gold hover:text-black transition-colors duration-500 font-jost text-[10px] tracking-[2px] uppercase py-3 px-8 rounded-sm font-semibold"
                        >
                          {t('Enquire Now')}
                        </button>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* ─── MEETING ROOMS LIST ─── */}
        <section className="py-24 px-6 md:px-15 bg-black overflow-x-auto" id="meeting">
          <div className="max-w-7xl mx-auto">
            <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold block mb-3 font-semibold font-montserrat">{t('Meeting Rooms')}</AnimatedText>
            <AnimatedText tag="h2" animation="fade-up" delay={200} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-5">{t('Spaces for Every')}<br /><em>{t('Gathering')}</em></AnimatedText>
            <AnimatedSection animation="scale" delay={300} className="gold-line"></AnimatedSection>
            {venuesLoading ? (
              <div className="space-y-4 mt-12">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <AnimatedSection animation="fade-up" delay={400}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 w-full">
                  {venues.map((venue, idx) => (
                    <div key={venue._id || idx} className="group relative bg-dark-2 border border-border-gold/10 rounded-sm overflow-hidden transition-all duration-700 hover:border-gold/30 hover:-translate-y-2 hover:shadow-2xl flex flex-col cursor-pointer">
                      
                      {/* Large Image Header */}
                      <div className="h-64 relative overflow-hidden border-b border-border-gold/10">
                         {venue.images && venue.images.length > 0 ? (
                           <img src={venue.images[0]} alt={venue.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                         ) : (
                           <div className="w-full h-full bg-dark-3 flex items-center justify-center">
                             <span className="text-gold text-4xl">{venue.icon || '🏢'}</span>
                           </div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-dark-2 via-dark-2/20 to-transparent z-0"></div>
                         
                         {/* Status Badge */}
                         <div className="absolute top-4 right-4 z-10">
                           <span className={`inline-flex items-center gap-2 text-[9px] tracking-[2px] uppercase font-bold py-1.5 px-3 rounded-full border shadow-lg backdrop-blur-md ${venue.status === 'Available'
                               ? 'bg-green-950/80 text-green-400 border-green-500/30'
                               : 'bg-dark-4/80 text-gold border-gold/30'
                             }`}>
                             <span className={`w-1.5 h-1.5 rounded-full ${venue.status === 'Available' ? 'bg-green-400' : 'bg-gold'} animate-pulse`}></span>
                             {t(venue.status) || t('Available')}
                           </span>
                         </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-8 flex flex-col flex-1 relative z-10 bg-dark-2">
                        <div className="mb-6">
                           <div className="text-[10px] tracking-[3px] uppercase text-gold mb-2 font-semibold font-montserrat">{t('Venue Space')}</div>
                           <h3 className="font-cormorant text-3xl text-white font-medium group-hover:text-gold transition-colors">{t(venue.name)}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div>
                            <div className="text-[9px] tracking-[2px] uppercase text-white-dim mb-1 font-montserrat">{t('Capacity')}</div>
                            <div className="text-white text-sm flex items-center gap-2">
                              <span className="text-gold">👥</span> {t(venue.capacity)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] tracking-[2px] uppercase text-white-dim mb-1 font-montserrat">{t('Starting At')}</div>
                            <div className="text-gold font-cormorant text-xl leading-none">
                              {venue.halfDayPrice ? `${venue.halfDayPrice.toLocaleString()} ETB` : 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-border-gold/10 pt-6 mt-auto">
                           <div className="flex justify-between items-center mb-4">
                             <span className="text-[10px] tracking-[1px] text-white-dim font-montserrat uppercase">{t('Half Day')}</span>
                             <span className="text-gold font-cormorant text-xl">{venue.halfDayPrice ? `${venue.halfDayPrice.toLocaleString()} ETB` : '-'}</span>
                           </div>
                           <div className="flex justify-between items-center mb-6">
                             <span className="text-[10px] tracking-[1px] text-white-dim font-montserrat uppercase">{t('Full Day')}</span>
                             <span className="text-gold font-cormorant text-xl">{venue.fullDayPrice ? `${venue.fullDayPrice.toLocaleString()} ETB` : '-'}</span>
                           </div>
                           <button
                             onClick={(e) => { e.stopPropagation(); setPreferredVenue(venue.name); scrollToSection('#enquiry'); }}
                             className="w-full btn-gold font-jost text-[11px] tracking-[2px] py-3 rounded-sm"
                           >
                             {t('Book This Venue')}
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            )}
          </div>
        </section>

        {/* ─── ENQUIRY SECTION ─── */}
        <section className="py-24 px-6 md:px-15 bg-dark-2 relative overflow-hidden" id="enquiry">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_30%_50%,var(--color-gold)_0%,transparent_60%)]" />
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start relative z-10">
            <div>
              <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold block mb-3 font-semibold font-montserrat">{t('Event Enquiry')}</AnimatedText>
              <AnimatedText tag="h2" animation="fade-up" delay={200} className="font-cormorant text-3xl md:text-5xl leading-tight text-white mb-5 font-light">{t("Let's Plan")}<br /><em>{t('Together')}</em></AnimatedText>
              <AnimatedSection animation="scale" delay={300} className="gold-line"></AnimatedSection>
              <AnimatedText tag="p" animation="fade-up" delay={400} className="font-montserrat text-[14px] leading-relaxed text-white-dim mb-8">
                {t('Fill in the form and our dedicated events team will get back to you within 24 hours with a tailored proposal.')}
              </AnimatedText>
              <div className="flex flex-col gap-5 mt-10">
                <AnimatedSection animation="fade-up" delay={450} className="flex gap-4 items-start">
                  <div className="w-9 h-9 border border-border-gold/25 flex items-center justify-center text-lg rounded-sm">📞</div>
                  <div>
                    <div className="text-[10px] tracking-[2px] uppercase text-white-dim mb-0.5 font-montserrat">{t('Phone')}</div>
                    <div className="text-14px text-white font-medium font-montserrat">
                      <a href={`tel:${hotelSettings.reservationsPhone || hotelSettings.mainPhone || '+251909517777'}`} className="hover:text-gold">
                        {hotelSettings.reservationsPhone || hotelSettings.mainPhone || '+251 90 951 7777'}
                      </a>
                    </div>
                  </div>
                </AnimatedSection>
                <AnimatedSection animation="fade-up" delay={500} className="flex gap-4 items-start">
                  <div className="w-9 h-9 border border-border-gold/25 flex items-center justify-center text-lg rounded-sm">✉️</div>
                  <div>
                    <div className="text-[10px] tracking-[2px] uppercase text-white-dim mb-0.5 font-montserrat">{t('Email')}</div>
                    <div className="text-14px text-white font-medium font-montserrat">
                      <a href={`mailto:${hotelSettings.reservationsEmail || hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com'}`} className="hover:text-gold">
                        {hotelSettings.reservationsEmail || hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com'}
                      </a>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>

            <AnimatedSection animation="fade-up" tag="form" className="flex flex-col gap-3.5 w-full font-montserrat" onSubmit={handleEnquiry}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input
                  type="text"
                  placeholder={t("Full Name")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-black border border-border-gold/20 text-white p-3.5 outline-none focus:border-gold w-full text-[13px] rounded-sm"
                />
                <input
                  type="tel"
                  placeholder={t("Phone Number")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-black border border-border-gold/20 text-white p-3.5 outline-none focus:border-gold w-full text-[13px] rounded-sm"
                />
              </div>
              <input
                type="email"
                placeholder={t("Email Address")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black border border-border-gold/20 text-white p-3.5 outline-none focus:border-gold w-full text-[13px] rounded-sm"
              />
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="bg-black border border-border-gold/20 text-white-dim p-3.5 outline-none focus:border-gold w-full text-[13px] rounded-sm"
              >
                <option value="Wedding Ceremony & Reception">{t('Wedding Ceremony & Reception')}</option>
                <option value="Corporate Conference">{t('Corporate Conference')}</option>
                <option value="Birthday Celebration">{t('Birthday Celebration')}</option>
                <option value="Graduation Party">{t('Graduation Party')}</option>
                <option value="Corporate Dinner">{t('Corporate Dinner')}</option>
                <option value="Meeting / Workshop">{t('Meeting / Workshop')}</option>
                <option value="Other">{t('Other')}</option>
              </select>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="bg-black border border-border-gold/20 text-white p-3.5 outline-none focus:border-gold w-full text-[13px] rounded-sm"
                />
                <select
                  value={expectedGuests}
                  onChange={(e) => setExpectedGuests(e.target.value)}
                  className="bg-black border border-border-gold/20 text-white-dim p-3.5 outline-none focus:border-gold w-full text-[13px] rounded-sm"
                >
                  <option value="1 – 30">1 – 30</option>
                  <option value="31 – 80">31 – 80</option>
                  <option value="81 – 150">81 – 150</option>
                  <option value="151 – 200">151 – 200</option>
                  <option value="200 – 300">200 – 300</option>
                </select>
              </div>
              <select
                value={preferredVenue}
                onChange={(e) => setPreferredVenue(e.target.value)}
                className="bg-black border border-border-gold/20 text-white-dim p-3.5 outline-none focus:border-gold w-full text-[13px] rounded-sm"
              >
                {venueNames.length > 0 ? (
                  <>
                    {venueNames.map((name, i) => <option key={i} value={name}>{t(name)}</option>)}
                    <option value="Not sure — please advise">{t('Not sure — please advise')}</option>
                  </>
                ) : (
                  <>
                    <option value="Shenkola">{t('Shenkola')}</option>
                    <option value="Ajora">{t('Ajora')}</option>
                    <option value="Yahode">{t('Yahode')}</option>
                    <option value="Not sure — please advise">{t('Not sure — please advise')}</option>
                  </>
                )}
              </select>
              <textarea
                placeholder={t("Tell us about your event — date, theme, special requirements...")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-black border border-border-gold/20 text-white p-3.5 outline-none focus:border-gold w-full text-[13px] min-h-[110px] rounded-sm"
              />
              <button
                type="submit"
                className="btn-gold font-jost w-44 self-start mt-2 rounded-sm"
                disabled={loading}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {loading ? t('Sending...') : t('Send Enquiry')}
              </button>
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

export default Events;
