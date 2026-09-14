import React, { useEffect, useState } from 'react';
import api from '../../../services/api/api.js';
import { unwrapData } from '../../../utils/apiHelpers.js';
import { useTranslation } from 'react-i18next';
import { useSectionReveal } from '../../../hooks/useScrollReveal.js';
import { getImageUrl } from '../../../utils/helpers/imageHelpers.js';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const heading = useSectionReveal('sr-fade-up');

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const res = await api.get('/testimonials');
        const data = unwrapData(res);
        setTestimonials(data || []);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Prepare scroller list
  const displayList = React.useMemo(() => {
    if (testimonials.length === 0) return [];
    let list = testimonials;
    // Duplicate items to ensure wide screens are filled without gaps
    while (list.length < 8) {
      list = [...list, ...list];
    }
    // Double for infinite marquee effect
    return [...list, ...list];
  }, [testimonials]);

  if (loading) {
    return (
      <section className="py-24 px-6 bg-black text-center">
        <span className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('Reviews')}</span>
        <h2 className="text-4xl md:text-5xl font-cormorant font-light mb-2">{t('Guest Experiences')}</h2>
        <div className="gold-line center mb-10" />
        <div className="flex justify-center items-center py-12 text-gold">
          <i className="fas fa-spinner fa-spin text-2xl mr-2" />
          <span className="text-xs uppercase tracking-[2px] text-white-dim">{t('Loading Experiences...')}</span>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-black text-center overflow-hidden relative">
      <style>{`
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .marquee-track {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: marquee-scroll 35s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div ref={heading.ref} className={`px-6 md:px-15 mb-12 ${heading.className}`}>
        <span className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">{t('Reviews')}</span>
        <h2 className="text-4xl md:text-5xl font-cormorant font-light mb-2">{t('Guest Experiences')}</h2>
        <div className="gold-line center" />
      </div>

      {/* Infinite Scrolling Marquee Track Container */}
      <div className="relative w-full overflow-hidden py-4 mask-gradient">
        {/* Soft fading edges using absolute overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        <div className="marquee-track">
          {displayList.map((item, i) => (
            <div
              key={i}
              className="premium-card p-6 flex flex-col justify-between h-[290px] md:h-[300px] w-[330px] md:w-[370px] shrink-0 select-none group border border-border-gold-soft hover:border-gold transition-all duration-300 relative rounded-lg bg-dark-2/90"
            >
              {/* Header: Large Prominent Avatar + Author Meta */}
              <div className="flex items-center gap-4 md:gap-5 relative z-10">
                <div className="w-[92px] h-[92px] md:w-[98px] md:h-[98px] rounded-full overflow-hidden border-2 border-gold/70 shrink-0 shadow-2xl bg-dark-3 transition-transform duration-500 group-hover:scale-105 group-hover:border-gold">
                  <img 
                    src={item.image ? getImageUrl(item.image) : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.author || 'Guest')}&background=random&color=fff`} 
                    alt={item.author} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-cinzel text-[13px] md:text-sm text-gold font-bold tracking-[1.5px] truncate">{t(item.author)}</div>
                  {item.origin && <div className="text-[11px] text-white-dim/70 font-montserrat truncate mt-1">{t(item.origin)}</div>}
                  <div className="text-gold text-[13px] tracking-[2px] mt-1.5">
                    {'★'.repeat(item.rating || 5)}{'☆'.repeat(5 - (item.rating || 5))}
                  </div>
                </div>
              </div>

              {/* Quote Body */}
              <div className="relative z-10 pt-3 border-t border-border-gold-soft/30 mt-auto">
                <p className="text-[13px] md:text-[14px] font-cormorant italic text-white-dim leading-snug line-clamp-4 whitespace-normal font-medium">
                  “{t(item.quote)}”
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
