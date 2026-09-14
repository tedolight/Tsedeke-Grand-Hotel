import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';
import api from '../../services/api/api.js';
import { unwrapData } from '../../utils/apiHelpers.js';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '../../store/settings/settingsStore.js';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../components/ui/AnimatedSection.jsx';

import { getImageUrl } from '../../utils/helpers/imageHelpers.js';

const MOCK_EVENTS = [];

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCursorHovered } = useUiStore();
  const { t, i18n } = useTranslation();
  const { hotelSettings } = useSettingsStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        // First try to fetch venue details
        try {
          const res = await api.get(`/events/${id}`);
          const data = unwrapData(res);
          if (data) {
            setEvent({
              title: data.name,
              category: 'Venue Space',
              img: (data.images && data.images.length > 0) 
                ? getImageUrl(data.images[0])
                : '/images/custom/4.jpg',
              description: data.description || 'Host your corporate meetings or private celebrations in our venue.',
              capacity: data.capacity || 100,
              duration: 'Flexible',
              includes: [
                `AV Equipment: ${Array.isArray(data.avEquipment) ? data.avEquipment.join(', ') : (data.avEquipment || 'N/A')}`,
                `Setup Options: ${Array.isArray(data.setupOptions) ? data.setupOptions.join(', ') : (data.setupOptions || 'N/A')}`,
                `Availability: ${data.availability || 'Available'}`
              ],
              price: `Full Day: ETB ${data.fullDayPrice?.toLocaleString() || 'N/A'}`
            });
            return;
          }
        } catch (e) {
          // If venue fetch fails, try matching with packages
        }

        // Fetch all packages and find match
        const pkgRes = await api.get('/events/packages');
        const pkgs = unwrapData(pkgRes);
        if (pkgs && pkgs.length > 0) {
          const matched = pkgs.find(p => p._id === id);
          if (matched) {
            setEvent({
              title: matched.name,
              category: matched.category || 'Event Package',
              img: '/images/custom/5.jpg',
              description: `A customized event package for up to ${matched.maxGuests || matched.capacity || 100} guests.`,
              capacity: matched.maxGuests || matched.capacity || 100,
              duration: matched.duration || 'Full Day',
              includes: matched.features || matched.inclusions || [],
              price: `ETB ${matched.price?.toLocaleString() || 'N/A'}`
            });
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-gold font-cinzel text-xl tracking-[4px] animate-pulse">{t('Loading Event Details...')}</div>
          <div className="w-16 h-[2px] bg-gold mx-auto mt-4 animate-scaleWidth" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 text-center">
        <div>
          <span className="text-4xl mb-4 block">🔍</span>
          <h2 className="font-cormorant text-3xl text-white mb-4">{t('Event Not Found')}</h2>
          <p className="text-white-dim text-sm max-w-md mx-auto mb-8">
            {t('The wedding package or venue space you requested could not be found.')}
          </p>
          <Link
            to="/events"
            className="btn-primary"
            onMouseEnter={() => setCursorHovered(true)}
            onMouseLeave={() => setCursorHovered(false)}
          >
            <span>{t('Back to Events')}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-page select-none">
      {/* Hero */}
      <div className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 brightness-[0.65]" style={{ backgroundImage: `var(--hero-overlay-dark), url('${event.img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="page-hero relative z-10 text-center px-6">
          <AnimatedText tag="span" animation="fade-down" delay={100} className="text-[10px] tracking-[6px] uppercase text-gold mb-5 block font-montserrat">{t(event.category)}</AnimatedText>
          <AnimatedText tag="h1" animation="fade-up" delay={250} className="text-3xl md:text-5xl font-cormorant font-light text-white leading-tight">{t(event.title)}</AnimatedText>
          <AnimatedText tag="p" animation="fade-up" delay={400} className="mt-6 text-[11px] tracking-[2px] text-white-dim uppercase font-montserrat">
            <Link to="/" className="text-gold no-underline" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>{t('Home')}</Link>
            {t('&nbsp;/&nbsp;')}
            <Link to="/events" className="text-gold no-underline" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>{t('Events')}</Link>
            &nbsp;/&nbsp; {t(event.title)}
          </AnimatedText>
        </div>
      </div>

      {/* Content */}
      <section className="py-20 px-6 md:px-15 bg-dark">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          <AnimatedSection animation="fade-right" className="lg:col-span-2">
            <img src={event.img} alt={t(event.title)} className="w-full h-72 object-cover mb-8 brightness-80" />
            <span className="text-gold text-[9px] tracking-[4px] uppercase mb-3 block font-montserrat">{t(event.category)}</span>
            <h2 className="font-cormorant text-4xl font-light text-white mb-4">{t(event.title)}</h2>
            <div className="gold-line" />
            <p className="text-[14px] text-white-dim font-montserrat leading-relaxed mb-8">{t(event.description)}</p>

            <h3 className="font-cinzel text-[12px] tracking-[4px] uppercase text-gold mb-5 pb-3 border-b border-border-gold/25">{t("What's Included")}</h3>
            <ul className="space-y-2">
              {event.includes.map((item, i) => (
                <AnimatedCard key={i} index={i} tag="li" animation="fade-up" className="flex items-center gap-3 text-[13px] text-white-dim font-montserrat">
                  <span className="text-gold">✓</span> {t(item)}
                </AnimatedCard>
              ))}
            </ul>
          </AnimatedSection>

          <div className="space-y-6">
            <AnimatedSection animation="fade-left" delay={100} className="bg-dark-2 border border-border-gold/15 p-8">
              <h3 className="font-cinzel text-[11px] tracking-[3px] uppercase text-gold mb-4 pb-3 border-b border-border-gold/25">{t('Event Details')}</h3>
              <div className="space-y-3 text-[13px] font-montserrat">
                <div className="flex justify-between"><span className="text-white-dim">{t('Category')}</span><span className="text-white">{t(event.category)}</span></div>
                <div className="flex justify-between"><span className="text-white-dim">{t('Capacity')}</span><span className="text-white">{t('Up to')} {event.capacity} {t('guests')}</span></div>
                <div className="flex justify-between"><span className="text-white-dim">{t('Duration')}</span><span className="text-white">{t(event.duration)}</span></div>
                <div className="flex justify-between border-t border-border-gold/15 pt-3 mt-3"><span className="text-white-dim">{t('Starting Price')}</span><span className="text-gold font-cormorant text-xl">{t(event.price)}</span></div>
              </div>
              <Link to="/contact" className="btn-primary w-full mt-6" style={{ padding: '14px', fontSize: '10px', display: 'block', textAlign: 'center' }} onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>
                <span>{t('Send Enquiry')}</span>
              </Link>
            </AnimatedSection>

            <AnimatedSection animation="fade-left" delay={200} className="bg-dark-2 border border-border-gold/15 p-6">
              <h4 className="font-cinzel text-[10px] tracking-[3px] uppercase text-gold mb-3">{t('Need Help?')}</h4>
              <p className="text-[12px] text-white-dim font-montserrat leading-relaxed mb-3">{t('Our events team is available 24/7 to help you plan your perfect event.')}</p>
              <div className="text-[12px] text-white font-montserrat">
                <a href={`tel:${hotelSettings.reservationsPhone || hotelSettings.mainPhone || '+251909517777'}`} className="hover:text-gold">
                  📞 {hotelSettings.reservationsPhone || hotelSettings.mainPhone || '+251 90 951 7777'}
                </a>
              </div>
              <div className="text-[12px] text-white font-montserrat mt-1">
                <a href={`mailto:${hotelSettings.reservationsEmail || hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com'}`} className="hover:text-gold">
                  ✉️ {hotelSettings.reservationsEmail || hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com'}
                </a>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetail;
