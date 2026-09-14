import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../store/ui/themeStore.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '../../store/settings/settingsStore.js';
import { AnimatedSection, AnimatedCard, AnimatedText } from '../../components/ui/AnimatedSection.jsx';

const About = () => {
  const { t, i18n } = useTranslation();
  const { hotelSettings } = useSettingsStore();
  const establishedYear = hotelSettings.establishedYear || 2024;
  const yearsOfExcellence = new Date().getFullYear() - establishedYear;
  usePageMeta(t('About Us'), t('Learn about Tsedeke Grand Hotel’s {{years}}-year history, our team, and our commitment to luxury Ethiopian hospitality in {{city}}.', { years: yearsOfExcellence, city: hotelSettings.city || 'Hossana' }));
  const { setCursorHovered } = useUiStore();

  const handleMouseEnter = () => setCursorHovered(true);
  const handleMouseLeave = () => setCursorHovered(false);

  return (
    <div className="about-page select-none">
      {/* ─── PAGE HERO ─── */}
      <div className="page-hero relative h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden pt-[68px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/about/about-hero.jpg')`
          }}
        />
        <div className="page-hero-content relative z-10 text-center px-4">
          <AnimatedText animation="fade-down" delay={100} tag="span" className="hero-3d-badge text-[10px] md:text-xs tracking-[4px] mb-4 block">{t('✦ Our Story')}</AnimatedText>
          <AnimatedText animation="fade-up" delay={300} tag="h1" className="hero-3d-title text-3xl md:text-5xl leading-tight mb-4 font-normal not-italic">{t('About')} <span className="hero-3d-gold font-normal not-italic">{t('Tsedeke Grand')}</span></AnimatedText>
          <AnimatedText animation="fade-up" delay={500} tag="p" className="hero-3d-sub mt-4 text-[11px] md:text-[12px] tracking-[2px] uppercase">
            <Link to="/" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="no-underline">{t('Home')}</Link> &nbsp;/&nbsp; {t('About Us')}
          </AnimatedText>
        </div>
      </div>

      {/* ─── STORY SECTION ─── */}
      <section className="py-24 px-6 md:px-15 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center bg-dark">
        <AnimatedSection animation="fade-right" className="relative max-w-lg mx-auto lg:mx-0 w-full">
          <div className="absolute -top-1 -left-1 sm:-top-[18px] sm:-left-[18px] right-1 sm:right-[18px] bottom-1 sm:bottom-[18px] border border-gold/30 pointer-events-none" />
          <img
            src="/images/custom/5.jpg"
            alt={hotelSettings.hotelName}
            className="w-full h-[520px] object-cover block shadow-2xl"
          />
          <div className="absolute -bottom-4 -right-4 sm:-bottom-[28px] sm:-right-[28px] w-24 sm:w-28 h-24 sm:h-28 bg-gold flex flex-col items-center justify-center shadow-lg rounded">
            <div className="text-3xl font-cormorant text-black font-light leading-none">{yearsOfExcellence}</div>
            <div className="text-[8px] tracking-[2px] uppercase text-black font-bold mt-1">{t('Years')}</div>
          </div>
        </AnimatedSection>

        <div className="space-y-4">
          <AnimatedText animation="fade-left" delay={100} tag="span" className="text-[10px] tracking-[4px] uppercase text-gold mb-4.5 block font-semibold font-montserrat">{t('✦ Who We Are')}</AnimatedText>
          <AnimatedText animation="fade-left" delay={200} tag="h2" className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-5">{t('A Legacy of')} <span className="italic text-gold-light">{t('Warmth')}</span> & {t('Excellence')}</AnimatedText>
          <AnimatedSection animation="fade-left" delay={300} className="gold-line"></AnimatedSection>
          <AnimatedText animation="fade-left" delay={400} tag="p" className="text-[14px] leading-relaxed text-white-dim mb-5 font-montserrat">
            {hotelSettings.description || t("Nestled in the heart of Hossana City, Ethiopia's naturally air-conditioned highland gem, Tsedeke Grand Hotel stands as a beacon of luxury, warmth, and Ethiopian hospitality. Since our founding, we have welcomed guests from across the world with open arms and unwavering dedication to comfort.")}
          </AnimatedText>
          <AnimatedText animation="fade-left" delay={500} tag="p" className="text-[14px] leading-relaxed text-white-dim mb-5 font-montserrat">
            {t('Our beautifully appointed rooms, VIP restaurant, conference halls, and coffee bar are crafted to offer an experience that goes far beyond accommodation. We believe every guest deserves to feel like royalty, from the moment they arrive to the moment they leave.')}
          </AnimatedText>
          <AnimatedText animation="fade-left" delay={600} tag="p" className="text-[14px] leading-relaxed text-white-dim mb-5 font-montserrat">
            {(hotelSettings.city || 'Hossana')}{t("'s climate is a gift, with temperatures ranging between 10°C and 20°C year-round, making ")}{(hotelSettings.tradingName || 'Tsedeke Grand Hotel')}{t(" the perfect escape from the heat, and the perfect host for every occasion.")}
          </AnimatedText>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-dark-2 border-y border-border-gold/15">
        {[
          { num: `${hotelSettings.totalRooms || 38}`, lbl: 'Luxury Rooms' },
          { num: `${hotelSettings.starRating || 4}★`, lbl: 'Star Rating' },
          { num: `${yearsOfExcellence}+`, lbl: 'Years of Excellence' },
          { num: '3K+', lbl: 'Happy Guests' }
        ].map((stat, idx) => (
          <AnimatedCard key={idx} index={idx} animation="scale" className="p-12 text-center border-r border-border-gold/10 last:border-0 hover:bg-gold/[0.03] transition-colors duration-300">
            <div className="text-5xl md:text-[58px] font-cormorant font-light text-gold leading-none mb-2">{stat.num}</div>
            <div className="text-[9px] tracking-[3px] uppercase text-white-dim font-montserrat">{t(stat.lbl)}</div>
          </AnimatedCard>
        ))}
      </div>

      {/* ─── VALUES SECTION ─── */}
      <section className="py-24 px-6 md:px-15 bg-black">
        <div className="text-center mb-20">
          <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('✦ What Drives Us')}</AnimatedText>
          <AnimatedText tag="h2" animation="fade-up" delay={200} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-4">{t('Our Core')} <em>{t('Values')}</em></AnimatedText>
          <AnimatedSection animation="scale" delay={300} className="gold-line center"></AnimatedSection>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { num: '01', icon: '🤝', title: 'Ethiopian Hospitality', text: 'We embrace the deep-rooted Ethiopian tradition of welcoming guests as family. Every interaction is guided by warmth, respect, and genuine care.' },
            { num: '02', icon: '✨', title: 'Uncompromising Quality', text: 'From the thread count of our linens to the precision of our cuisine, quality is never negotiated. Every detail is curated to meet the highest standards.' },
            { num: '03', icon: '🌿', title: 'Sustainable Luxury', text: "We are committed to responsible hospitality. Our operations support the local community, preserve Hossana's natural beauty, and minimize environmental impact." }
          ].map((value, idx) => (
            <AnimatedCard
              key={idx}
              index={idx}
              animation="fade-up"
              className="relative bg-gradient-to-b from-dark-2/90 via-dark-2/95 to-dark-3/95 p-8 md:p-9 rounded-xl border border-border-gold/20 hover:border-gold/60 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_35px_rgba(0,0,0,0.5),0_0_25px_rgba(201,168,76,0.12)] group overflow-hidden flex flex-col items-center text-center backdrop-blur-sm"
            >
              {/* Top Golden Light Bar */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-30 group-hover:opacity-100 transition-all duration-500" />

              {/* Watermark Number */}
              <div className="font-cinzel text-4xl md:text-5xl text-gold/[0.05] font-bold absolute top-3.5 right-5 group-hover:text-gold/20 transition-colors duration-500 select-none pointer-events-none">
                {value.num}
              </div>

              {/* Luxury Icon Badge */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold/15 via-gold/5 to-transparent border border-border-gold/35 flex items-center justify-center text-3xl mb-5 shadow-inner group-hover:scale-105 group-hover:border-gold group-hover:shadow-[0_0_18px_rgba(201,168,76,0.25)] transition-all duration-500">
                {value.icon}
              </div>

              {/* Title */}
              <div className="font-cinzel text-sm md:text-[15px] tracking-[2.5px] uppercase text-gold font-bold mb-2.5 transition-colors duration-300 group-hover:text-gold-light">
                {t(value.title)}
              </div>

              {/* Animated Accent Line */}
              <div className="w-7 h-[1.5px] bg-gradient-to-r from-transparent via-gold/60 to-transparent mb-4 group-hover:w-14 transition-all duration-500" />

              {/* Description */}
              <p className="text-[13px] leading-relaxed text-white-dim/90 font-montserrat group-hover:text-white transition-colors duration-300">
                {t(value.text)}
              </p>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* ─── TEAM SECTION ─── */}
      <section className="py-24 px-6 md:px-15 bg-dark">
        <div className="mb-16">
          <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('✦ The People Behind Tsedeke Grand')}</AnimatedText>
          <AnimatedText tag="h2" animation="fade-up" delay={150} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-4">{t('Meet Our')} <em>{t('Team')}</em></AnimatedText>
          <AnimatedSection animation="fade-right" delay={250} className="gold-line"></AnimatedSection>
          <AnimatedText tag="p" animation="fade-up" delay={300} className="text-[14px] leading-relaxed text-white-dim max-w-[480px] font-montserrat">{t('Our dedicated team of hospitality professionals brings passion, expertise, and heart to every guest interaction — every single day.')}</AnimatedText>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(hotelSettings.team && hotelSettings.team.length > 0 ? hotelSettings.team : []).map((member, idx) => (
            <AnimatedCard key={idx} index={idx} animation="flip-up" className="relative overflow-hidden rounded-sm group shadow-lg">
              <img src={member.img} alt={member.name} className="w-full h-[340px] object-cover block filter brightness-[0.85] transition-transform duration-500 group-hover:scale-105 group-hover:brightness-[0.55]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent p-6 flex flex-col justify-end transition-all duration-300">
                <h3 className="font-cormorant text-xl font-light text-white group-hover:text-gold transition-colors">{member.name}</h3>
                <span className="text-[9px] tracking-[3px] uppercase text-gold font-montserrat mt-1">{member.role}</span>
                <p className="text-[11px] text-white-dim font-montserrat mt-2 max-h-0 overflow-hidden transition-all duration-500 group-hover:max-h-16">{member.bio}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* ─── LOCATION SECTION ─── */}
      <section className="py-24 px-6 md:px-15 bg-dark-2 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-6">
          <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('✦ Find Us')}</AnimatedText>
          <AnimatedText tag="h2" animation="fade-left" delay={150} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-4">{t('Our')} <em>{t('Location')}</em></AnimatedText>
          <AnimatedSection animation="fade-left" delay={200} className="gold-line"></AnimatedSection>
          <AnimatedText tag="p" animation="fade-up" delay={250} className="text-[14px] leading-relaxed text-white-dim mb-10 font-montserrat">
            {t('Situated in the heart of ')}{(hotelSettings.city || 'Hossana')}{t(' City, the naturally air-conditioned highland of Ethiopia — only 230km from Bole International Airport.')}
          </AnimatedText>
          <div className="flex flex-col gap-8">
            <AnimatedSection animation="fade-up" delay={300} className="flex gap-5 items-start pb-8 border-b border-border-gold/10">
              <span className="text-2xl">📍</span>
              <div>
                <div className="font-cinzel text-[10px] tracking-[3px] text-gold uppercase font-semibold mb-1.5">{t('Address')}</div>
                <div className="text-[13px] text-white-dim font-montserrat">
                  {hotelSettings.streetAddress || t('Hossana City, Hadiya Zone')}, {(hotelSettings.subCity ? `${hotelSettings.subCity}, ` : '') + (hotelSettings.city || 'SNNPR')}, {hotelSettings.country || 'Ethiopia'}
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="fade-up" delay={400} className="flex gap-5 items-start pb-8 border-b border-border-gold/10">
              <span className="text-2xl">📞</span>
              <div>
                <div className="font-cinzel text-[10px] tracking-[3px] text-gold uppercase font-semibold mb-1.5">{t('Phone')}</div>
                <div className="text-[13px] text-white-dim font-montserrat">
                  <a href={`tel:${hotelSettings.mainPhone || '+251909517777'}`} className="hover:text-gold">{hotelSettings.mainPhone || '+251 90 951 7777'}</a>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="fade-up" delay={500} className="flex gap-5 items-start pb-8 border-b border-border-gold/10 last:border-b-0 last:pb-0">
              <span className="text-2xl">✉️</span>
              <div>
                <div className="font-cinzel text-[10px] tracking-[3px] text-gold uppercase font-semibold mb-1.5">{t('Email')}</div>
                <div className="text-[13px] text-white-dim font-montserrat">
                  <a href={`mailto:${hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com'}`} className="hover:text-gold">{hotelSettings.generalEmail || 'tsedekegrandhotel@gmail.com'}</a>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        <AnimatedSection animation="scale" className="w-full h-[420px] bg-dark-3 border border-border-gold/20 overflow-hidden rounded-sm shadow-xl">
          <iframe
            title="Tsedeke Grand Hotel Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.6201625091726!2d37.8573708!3d7.566884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17b249006a5a3c27%3A0xacbe2c03ded69975!2sTSEDEKE%20GRAND%20HOTEL!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full border-none filter grayscale-[40%] invert-[90%] hue-rotate-180"
          />
        </AnimatedSection>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-32 px-6 md:px-15 text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/images/custom/Lobby bar.jpg')` }}
        />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.15)' }} />
        <div className="cta-content relative z-10 max-w-2xl mx-auto">
          <AnimatedText tag="span" className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('✦ Experience Tsedeke Grand')}</AnimatedText>
          <AnimatedText tag="h2" animation="fade-up" delay={200} className="text-3xl md:text-5xl font-cormorant font-light leading-tight mb-4" style={{ color: '#FFFFFF', textShadow: '0 2px 16px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.8)' }}>{t('Ready to')} <em>{t('Stay')}</em> {t('With Us?')}</AnimatedText>
          <AnimatedSection animation="scale" delay={300} className="gold-line center"></AnimatedSection>
          <AnimatedText tag="p" animation="fade-up" delay={400} className="text-[14px] leading-relaxed mb-10 max-w-[500px] mx-auto font-montserrat" style={{ color: '#FFFFFF', textShadow: '0 1px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)' }}>{t('Book your stay at Tsedeke Grand Hotel and discover the warmth of Ethiopian hospitality wrapped in luxury and elegance.')}</AnimatedText>
          <AnimatedSection animation="scale" delay={500} className="flex flex-wrap gap-5 justify-center">
            <Link to="/booking" className="btn-primary" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}><span>{t('Book a Room')}</span></Link>
            <Link to="/contact" className="btn-outline" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>{t('Contact Us')}</Link>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default About;
