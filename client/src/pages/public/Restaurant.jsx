import React, { useEffect, useState } from 'react';
import useUiStore from '../../store/ui/themeStore.js';
import useAuthStore from '../../store/auth/authStore.js';
import AuthModal from '../../components/common/AuthModal.jsx';
import api from '../../services/api/api.js';
import { unwrapData } from '../../utils/apiHelpers.js';
import { reservationService } from '../../services/restaurant/reservationService.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '../../store/settings/settingsStore.js';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../components/ui/AnimatedSection.jsx';

const MOCK_ITEMS = {
  breakfast: [],
  lunch: [],
  dinner: [],
  ethiopian: [],
  drinks: [],
  desserts: []
};

const Restaurant = () => {
  const { t, i18n } = useTranslation();
  const { hotelSettings } = useSettingsStore();
  usePageMeta(t('Fine Dining Restaurant'), t('Experience authentic Ethiopian cuisine and international dishes at {{hotelName}}’s fine dining restaurant in {{city}}. Reserve your table today.', { hotelName: hotelSettings.hotelName || 'Tsedeke Grand Hotel', city: hotelSettings.city || 'Hossana' }));
  const { setCursorHovered, addToast } = useUiStore();
  const { isAuthenticated } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [activeTab, setActiveTab] = useState('breakfast');
  const [menuItems, setMenuItems] = useState(MOCK_ITEMS);
  const [loading, setLoading] = useState(false);
  const [diningHours, setDiningHours] = useState([
    { image: '/images/custom/1.jpg', icon: '🌅', name: 'Breakfast', time: '06:00 – 10:30', desc: 'Daily · All guests welcome. Buffet & à la carte options.' },
    { image: '/images/custom/restaurant-hero.jpg', icon: '☀️', name: 'Lunch', time: '12:00 – 15:00', desc: 'Daily · Open to public. Executive set menu available.' },
    { image: '/images/custom/restaurant.jpg', icon: '🌙', name: 'Dinner', time: '18:00 – 22:30', desc: 'Daily · Reservation advised. À la carte & tasting menus.' },
    { image: '/images/custom/coffe-bar.jpg', icon: '☕', name: 'Coffee Bar', time: '07:00 – 23:00', desc: 'Daily · Walk-in welcome. Traditional ceremony daily.' }
  ]);

  // Reservation Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState('');
  const [area, setArea] = useState('Main Dining Room');
  const [guests, setGuests] = useState('2 Guests');
  const [occasion, setOccasion] = useState('Regular Dining');
  const [resLoading, setResLoading] = useState(false);

  useEffect(() => {
    const fetchDiningHours = async () => {
      try {
        const res = await api.get('/admin/settings/dining_hours');
        const val = unwrapData(res);
        if (val && Array.isArray(val) && val.length > 0) {
          setDiningHours(val);
        }
      } catch (err) {
        console.error('Error fetching dining hours:', err);
      }
    };

    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await api.get('/restaurant/items');
        const items = unwrapData(res);
        if (items && items.length > 0) {
          // Categorize backend items
          const categorized = {
            breakfast: [],
            lunch: [],
            dinner: [],
            ethiopian: [],
            drinks: [],
            desserts: []
          };
          items.forEach(item => {
            const cat = item.category?.name?.toLowerCase() || item.category?.toLowerCase() || 'lunch';
            const mappedItem = {
              name: item.name,
              desc: item.description,
              price: item.price,
              badge: item.badge || '',
              image: item.image || null
            };
            if (categorized[cat]) {
              categorized[cat].push(mappedItem);
            } else {
              categorized.lunch.push(mappedItem);
            }
          });
          setMenuItems(categorized);
        }
      } catch (err) {
        console.error('Error fetching menu items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiningHours();
    fetchMenu();
  }, []);

  const handleMouseEnter = () => setCursorHovered(true);
  const handleMouseLeave = () => setCursorHovered(false);

  const handleReservation = async (e) => {
    e.preventDefault();

    // Auth gate — must be logged in
    if (!isAuthenticated) {
      addToast(t('Please sign in to make a reservation'), 'error');
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }

    if (!fullName || !phone || !email || !resDate || !resTime) {
      addToast(t('Please fill in all reservation fields'), 'error');
      return;
    }

    setResLoading(true);
    try {
      const guestCount = parseInt(guests, 10) || parseInt(String(guests).match(/\d+/)?.[0], 10) || 2;
      await reservationService.create({
        fullName,
        email,
        phone,
        date: resDate,
        time: resTime,
        guests: guestCount,
        occasion,
        specialRequests: `Dining area: ${area}`,
      });
      addToast(t('Table reservation request submitted successfully! We will contact you soon.'), 'success');
      // Reset form
      setFullName('');
      setPhone('');
      setEmail('');
      setResDate('');
      setResTime('');
    } catch (err) {
      addToast(t(err.message) || t('Failed to submit reservation request'), 'error');
    } finally {
      setResLoading(false);
    }
  };

  return (
    <>
      <div className="restaurant-page select-none">
        {/* ─── HERO SECTION ─── */}
        <section className="page-hero relative h-[65vh] min-h-[480px] flex items-center px-6 md:px-15 overflow-hidden bg-black pt-[68px]">
          {/* Pure, 100% Raw Untouched Background Image (No Gradient) */}
          <img
            src="/images/custom/restaurant.jpg"
            alt="Tsedeke Grand Hotel Restaurant"
            className="absolute inset-0 w-full h-full object-cover object-center z-0"
          />

          {/* Direct Text Layer */}
          <div className="page-hero-content relative z-10 max-w-2xl text-left">
            <AnimatedText tag="div" animation="fade-right" delay={100} className="hero-3d-badge mb-3 flex items-center gap-3">
              <span className="w-10 block" /> {t('{{hotel}} · {{city}}', { hotel: hotelSettings.tradingName || 'Tsedeke Grand Hotel', city: hotelSettings.city || 'Hossana' })}
            </AnimatedText>

            <AnimatedText tag="h1" animation="fade-up" delay={300} className="hero-3d-title text-3xl md:text-5xl leading-tight mb-4">
              {t('Fine')} <span className="hero-3d-gold">{t('Dining')}</span><br />& {t('Ethiopian')}<br />{t('Cuisine')}
            </AnimatedText>

            <AnimatedText tag="p" animation="fade-up" delay={500} className="hero-3d-sub text-xs md:text-sm leading-relaxed mb-6 max-w-[500px]">
              {t('An elevated culinary journey where traditional Ethiopian flavors meet modern presentation. From intimate breakfasts to lavish dinner gatherings.')}
            </AnimatedText>

            <AnimatedSection tag="div" animation="scale" delay={700} className="flex gap-4 flex-wrap">
              <a href="#menu" className="btn-gold font-jost font-bold shadow-[0_4px_20px_rgba(0,0,0,0.8)]" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>{t('View Full Menu')}</a>
              <a href="#reservation" className="btn-outline font-jost font-bold shadow-[0_4px_20px_rgba(0,0,0,0.8)]" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>{t('Reserve a Table')}</a>
            </AnimatedSection>
          </div>
          <AnimatedSection animation="scale" className="absolute right-[8%] top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center opacity-80 z-10">
            <div className="w-48 h-48 rounded-full border border-gold/25 flex items-center justify-center text-[72px] bg-gradient-to-br from-gold/5 via-transparent to-transparent shadow-inner">
              🍽️
            </div>
            <div className="mt-3 text-[11px] tracking-[3px] uppercase text-gold font-semibold font-montserrat">{t('VIP Dining Experience')}</div>
          </AnimatedSection>
        </section>

        {/* ─── DINING HOURS ─── */}
        <section className="bg-dark-2 py-24 px-6 md:px-15">
          <div className="text-center mb-16">
            <AnimatedText tag="span" className="text-[11px] tracking-[4px] uppercase text-gold block mb-3 font-semibold font-montserrat">{t('Opening Hours')}</AnimatedText>
            <AnimatedText tag="h2" animation="fade-up" delay={200} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-5">{t('When')} <em>{t('We Serve')}</em></AnimatedText>
            <AnimatedSection animation="scale" delay={300} className="gold-line center" style={{ margin: '0 auto 20px' }}></AnimatedSection>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
            {diningHours.map((item, i) => (
              <AnimatedCard key={i} index={i} animation="flip-up" className="premium-card on-dark-surface relative overflow-hidden group h-[380px] flex flex-col justify-end rounded-xl shadow-2xl cursor-pointer">
                {/* Background Image with crisp rendering */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={item.image || '/images/custom/restaurant.jpg'}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/custom/restaurant.jpg';
                    }}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 brightness-95 group-hover:brightness-75"
                    style={{ imageRendering: 'auto' }}
                  />
                  <div
                    className="absolute inset-0 transition-opacity duration-700 opacity-60 group-hover:opacity-75"
                    style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }}
                  ></div>
                </div>

                {/* Inner animated border */}
                <div className="absolute inset-4 border border-gold/0 transition-all duration-700 group-hover:border-gold/30 rounded-lg pointer-events-none z-20 scale-95 group-hover:scale-100"></div>

                {/* Text Content */}
                <div className="relative z-10 p-8 text-center flex flex-col items-center justify-end h-full">

                  <div className="transform transition-transform duration-500 ease-out translate-y-[60px] group-hover:translate-y-0 flex flex-col items-center">
                    <div className="font-cormorant text-4xl text-gold mb-2 font-medium drop-shadow-md transition-transform duration-500 group-hover:scale-105">{t(item.name)}</div>
                    <strong className="text-white block text-[13px] font-semibold tracking-[2px] uppercase opacity-90">{t(item.time)}</strong>

                    {/* Description - fades in and expands */}
                    <div className="font-montserrat text-[13px] text-white leading-relaxed drop-shadow-lg opacity-0 transition-opacity duration-500 delay-100 group-hover:opacity-90 mt-4">
                      <div className="h-[1px] bg-gold/50 mx-auto mb-3 transition-all duration-700 delay-200 w-0 group-hover:w-12"></div>
                      {t(item.desc)}
                    </div>
                  </div>

                </div>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* ─── MENU TABS SECTION ─── */}
        <section className="py-24 px-6 md:px-15 bg-black" id="menu">
          <div className="max-w-7xl mx-auto">
            <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold block mb-3 font-semibold font-montserrat">{t('Our Menu')}</AnimatedText>
            <AnimatedText tag="h2" animation="fade-up" delay={200} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-5">{t('Crafted With')} <em>{t('Passion')}</em></AnimatedText>
            <AnimatedSection animation="scale" delay={300} className="gold-line"></AnimatedSection>

            <AnimatedSection animation="fade-up" delay={400} className="flex gap-1 border-b border-border-gold/20 mb-12 overflow-x-auto pb-0.5">
              {Object.keys(menuItems).map((cat) => (
                <button
                  key={cat}
                  className={`py-3.5 px-7 text-xs font-montserrat tracking-[2px] uppercase cursor-pointer transition-all border-none bg-none outline-none border-b-2 ${activeTab === cat
                      ? 'text-gold border-gold font-semibold'
                      : 'text-white-dim border-transparent hover:text-gold'
                    }`}
                  onClick={() => setActiveTab(cat)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {t(cat)}
                </button>
              ))}
            </AnimatedSection>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-dark-2 border border-border-gold/15 rounded-lg overflow-hidden flex flex-col animate-pulse">
                    <div className="aspect-[4/3] bg-white/5 w-full" />
                    <div className="p-6 flex flex-col gap-4 flex-1">
                      <div className="flex justify-between items-center">
                        <div className="h-5 bg-white/5 rounded w-1/2" />
                        <div className="h-5 bg-white/5 rounded w-1/4" />
                      </div>
                      <div className="h-3 bg-white/5 rounded w-full" />
                      <div className="h-3 bg-white/5 rounded w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {menuItems[activeTab] && menuItems[activeTab].map((item, idx) => {
                  const getImageSrc = (img) => {
                    if (!img) return '/images/custom/restaurant.jpg';
                    if (typeof img === 'string') {
                      if (img.startsWith('http') || img.startsWith('/') || img.startsWith('data:')) {
                        return img;
                      }
                      if (img.includes('/') || img.includes('.')) {
                        return `/${img}`;
                      }
                    }
                    return '/images/custom/restaurant.jpg';
                  };
                  const imageSrc = getImageSrc(item.image);

                  return (
                    <AnimatedCard
                      key={idx}
                      index={idx}
                      animation="fade-up"
                      className="premium-card flex flex-col group"
                    >
                      {/* Food Image Area */}
                      <div className="relative aspect-[4/3] bg-dark-3 overflow-hidden border-b border-border-gold/10 shrink-0">
                        <img
                          src={imageSrc}
                          alt={t(item.name)}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/custom/restaurant.jpg';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.85] group-hover:brightness-[0.95]"
                        />
                        {item.badge && (
                          <span className="absolute top-4 left-4 bg-gold text-black font-cinzel text-[8px] tracking-[1.5px] py-1 px-2.5 z-10 font-bold uppercase rounded-sm shadow-md">
                            {t(item.badge)}
                          </span>
                        )}
                      </div>

                      {/* Food Details */}
                      <div className="p-8 flex flex-col items-center justify-between flex-1 text-center">
                        <div>
                          <div className="flex flex-col items-center gap-2 mb-3">
                            <h3 className="font-cormorant text-2xl text-white group-hover:text-gold transition-colors font-semibold leading-snug">
                              {t(item.name)}
                            </h3>
                            <div className="w-8 h-[1px] bg-gold/50"></div>
                            <span className="font-cormorant text-2xl text-gold font-semibold whitespace-nowrap shrink-0 mt-1">
                              {item.price} <small className="text-[10px] tracking-[1px] font-montserrat text-white-dim uppercase">{t('ETB')}</small>
                            </span>
                          </div>
                          <p className="text-[13px] text-white-dim leading-relaxed font-montserrat mt-2">
                            {t(item.desc)}
                          </p>
                        </div>
                      </div>
                    </AnimatedCard>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ─── COFFEE CEREMONY SECTION ─── */}
        <section className="py-24 px-6 md:px-15 bg-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_70%_50%,var(--color-gold)_0%,transparent_60%)]" />
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
            <div>
              <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold block mb-3 font-semibold font-montserrat">{t('Coffee Ceremony')}</AnimatedText>
              <AnimatedText tag="h2" animation="fade-up" delay={200} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-5">{t('The')} <em>{t('Sacred')}</em><br />{t('Ethiopian Ritual')}</AnimatedText>
              <AnimatedSection animation="scale" delay={300} className="gold-line"></AnimatedSection>
              <AnimatedText tag="p" animation="fade-up" delay={400} className="text-[15px] text-white-dim leading-relaxed mb-8 font-montserrat">
                {t('Join us daily at 10AM, 3PM & 8PM for an authentic Ethiopian coffee ceremony: roasting, grinding & brewing single-origin beans tableside.')}
              </AnimatedText>
              <div className="flex flex-col gap-5 mt-10">
                {[
                  { num: '01', title: 'Roasting', text: 'Green beans roasted fresh over charcoal in a traditional pan. The aroma fills the room.' },
                  { num: '02', title: 'Grinding', text: 'Hand-ground using a wooden mortar, releasing the full spectrum of natural flavors.' },
                  { num: '03', title: 'Brewing', text: 'Brewed three rounds in a traditional jebena clay pot. Each round lighter & more refined.' }
                ].map((step, idx) => (
                  <AnimatedCard key={idx} index={idx} animation="fade-left" className="flex gap-5 items-start">
                    <div className="font-cormorant text-4xl text-gold/30 leading-none min-w-[40px] font-light">{step.num}</div>
                    <div>
                      <h4 className="font-cormorant text-lg text-white font-medium mb-1">{t(step.title)}</h4>
                      <p className="text-[13px] text-white-dim leading-relaxed font-montserrat">{t(step.text)}</p>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
            <AnimatedSection animation="scale" className="text-center relative">
              <div className="w-72 h-72 rounded-full border border-border-gold/25 mx-auto flex items-center justify-center text-[100px] bg-gradient-to-br from-gold/5 via-transparent to-transparent relative shadow-inner">
                ☕
              </div>
              <p className="mt-6 text-[13px] text-white-dim letter-spacing-[2px] uppercase font-montserrat">{t('Served Daily · 3 Times')}</p>
            </AnimatedSection>
          </div>
        </section>

        {/* ─── RESERVATION SECTION ─── */}
        <section className="bg-dark-2 py-24 px-6 md:px-15" id="reservation">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold block mb-3 font-semibold font-montserrat">{t('Reservations')}</AnimatedText>
            <AnimatedText tag="h2" animation="fade-up" delay={200} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-5">{t('Reserve Your')} <em>{t('Table')}</em></AnimatedText>
            <AnimatedSection animation="scale" delay={300} className="gold-line center" style={{ margin: '0 auto 20px' }}></AnimatedSection>
            <AnimatedText tag="p" animation="fade-up" delay={400} className="text-[15px] text-white-dim mb-12 font-montserrat">
              {t('Secure your dining experience. For parties of 8+, please call us directly at {{phone}}', { phone: hotelSettings.reservationsPhone || hotelSettings.mainPhone || '+251 90 951 7777' })}
            </AnimatedText>
            <AnimatedSection animation="fade-up" tag="form" className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left" onSubmit={handleReservation}>
              <input
                type="text"
                placeholder={t("Full Name")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-black border border-border-gold/25 text-white p-3.5 outline-none focus:border-gold w-full text-[13px] font-montserrat rounded-sm"
              />
              <input
                type="tel"
                placeholder={t("Phone Number")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-black border border-border-gold/25 text-white p-3.5 outline-none focus:border-gold w-full text-[13px] font-montserrat rounded-sm"
              />
              <input
                type="email"
                placeholder={t("Email Address")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black border border-border-gold/25 text-white p-3.5 outline-none focus:border-gold w-full text-[13px] font-montserrat rounded-sm sm:col-span-2"
              />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={resDate}
                onChange={(e) => setResDate(e.target.value)}
                className="bg-black border border-border-gold/25 text-white p-3.5 outline-none focus:border-gold w-full text-[13px] font-montserrat rounded-sm"
              />
              <input
                type="time"
                value={resTime}
                onChange={(e) => setResTime(e.target.value)}
                className="bg-black border border-border-gold/25 text-white p-3.5 outline-none focus:border-gold w-full text-[13px] font-montserrat rounded-sm"
              />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="bg-black border border-border-gold/25 text-white-dim p-3.5 outline-none focus:border-gold w-full text-[13px] font-montserrat rounded-sm sm:col-span-2"
              >
                <option value="Main Dining Room">{t('Main Dining Room')}</option>
                <option value="Garden Terrace">{t('Garden Terrace')}</option>
                <option value="VIP Private Room">{t('VIP Private Room')}</option>
                <option value="Coffee Bar">{t('Coffee Bar')}</option>
              </select>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="bg-black border border-border-gold/25 text-white-dim p-3.5 outline-none focus:border-gold w-full text-[13px] font-montserrat rounded-sm"
              >
                <option value="1–2 Guests">{t('1–2 Guests')}</option>
                <option value="3–4 Guests">{t('3–4 Guests')}</option>
                <option value="5–6 Guests">{t('5–6 Guests')}</option>
                <option value="7–8 Guests">{t('7–8 Guests')}</option>
                <option value="Large Group (8+)">{t('Large Group (8+)')}</option>
              </select>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="bg-black border border-border-gold/25 text-white-dim p-3.5 outline-none focus:border-gold w-full text-[13px] font-montserrat rounded-sm"
              >
                <option value="Regular Dining">{t('Regular Dining')}</option>
                <option value="Birthday Celebration">{t('Birthday Celebration')}</option>
                <option value="Anniversary">{t('Anniversary')}</option>
                <option value="Business Dinner">{t('Business Dinner')}</option>
                <option value="Coffee Ceremony">{t('Coffee Ceremony')}</option>
              </select>
              <button
                type="submit"
                disabled={resLoading}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="sm:col-span-2 bg-gold text-black py-4 text-xs tracking-[3px] uppercase font-semibold border-none cursor-pointer transition-colors duration-300 hover:bg-gold-light mt-2 rounded-sm"
              >
                {resLoading ? t('Submitting...') : t('Confirm Table Reservation')}
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

export default Restaurant;
