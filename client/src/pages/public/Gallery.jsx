import React, { useEffect, useState } from 'react';
import useUiStore from '../../store/ui/themeStore.js';
import api from '../../services/api/api.js';
import { unwrapData } from '../../utils/apiHelpers.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import { useTranslation } from 'react-i18next';
import { AnimatedSection, AnimatedText, AnimatedCard } from '../../components/ui/AnimatedSection.jsx';

const MOCK_GALLERY = [];

const formatGalleryTitle = (rawTitle, category = '', idx = 0) => {
  if (!rawTitle) return `Gallery Photo ${idx + 1}`;
  let clean = rawTitle.replace(/\.(jpg|jpeg|png|webp|svg|gif|avif|bmp|tiff)$/i, '').trim();
  clean = clean.replace(/[-_]+/g, ' ');
  if (/^\d+$/.test(clean)) {
    const catName = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Hotel';
    return `${catName} Showcase ${clean}`;
  }
  return clean.replace(/\b\w/g, (l) => l.toUpperCase());
};

const Gallery = () => {
  const { t, i18n } = useTranslation();
  usePageMeta(t('Photo Gallery'), t('Explore Tsedeke Grand Hotel through our gallery — luxury rooms, fine dining, grand events, and the beauty of Hossana, Ethiopia.'));
  const { setCursorHovered } = useUiStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [galleryItems, setGalleryItems] = useState(MOCK_GALLERY);
  const [loading, setLoading] = useState(true);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const res = await api.get('/gallery');
        const items = unwrapData(res);
        if (items && items.length > 0) {
          setGalleryItems(items.map((item, idx) => {
            const cat = item.category?.name?.toLowerCase() || (typeof item.category === 'string' ? item.category.toLowerCase() : 'rooms');
            return {
              _id: item._id,
              title: formatGalleryTitle(item.title || item.name, cat, idx),
              category: cat,
              imageUrl: item.imageUrl || item.image || item.url || null,
              isFeat: item.featured || idx % 4 === 0,
              bg: 'var(--hero-gradient)'
            };
          }));
        }
        // If no items returned, keep MOCK_GALLERY
      } catch (err) {
        // Silently stay with fallback images
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);


  const handleMouseEnter = () => setCursorHovered(true);
  const handleMouseLeave = () => setCursorHovered(false);

  // Filtered Items
  const filteredItems = galleryItems.filter(
    (item) => activeFilter === 'all' || item.category.toLowerCase() === activeFilter.toLowerCase()
  );

  const openLightbox = (index) => {
    setActiveIdx(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const navigateLightbox = (dir) => {
    let nextIdx = activeIdx + dir;
    if (nextIdx < 0) nextIdx = filteredItems.length - 1;
    if (nextIdx >= filteredItems.length) nextIdx = 0;
    setActiveIdx(nextIdx);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, activeIdx, filteredItems.length]);

  return (
    <div className="gallery-page select-none">
      {/* ─── HERO SECTION ─── */}
      <section className="page-hero relative h-[65vh] min-h-[480px] flex items-center px-6 md:px-15 overflow-hidden pt-[68px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/custom/Lobby bar.jpg')`
          }}
        />
        <div className="page-hero-content relative z-10 max-w-2xl text-left">
          <AnimatedSection animation="fade-right" delay={0} className="mb-3">
            <span className="hero-3d-badge">{t('✦ Visual Collection')}</span>
          </AnimatedSection>
          <AnimatedText tag="h1" animation="flip-up" delay={100}
            className="hero-3d-title text-3xl md:text-5xl leading-tight mb-4">
            {t('Our')} <em className="hero-3d-gold">{t('Gallery')}</em>
          </AnimatedText>
          <AnimatedText tag="p" animation="fade-up" delay={280}
            className="hero-3d-sub text-xs md:text-sm mt-4 max-w-[480px] leading-relaxed">
            {t('A curated visual journey through every corner of Tsedeke Grand Hotel, from luxurious rooms to vibrant events and breathtaking Hossana views.')}
          </AnimatedText>
        </div>
      </section>

      {/* ─── FILTER BAR ─── */}
      <section className="sticky top-[78px] z-40 bg-black/95 backdrop-blur-md border-b border-border-gold/25 px-6 md:px-15">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-5 h-[64px] overflow-x-auto no-scrollbar">
          <div className="flex gap-1 md:gap-2 flex-shrink-0 h-full items-center">
            {[
              { label: 'All', val: 'all' },
              { label: 'Rooms & Suites', val: 'rooms' },
              { label: 'Restaurant', val: 'restaurant' },
              { label: 'Events', val: 'events' },
              { label: 'Exterior', val: 'exterior' },
              { label: 'Interior', val: 'interior' },
              { label: 'City Views', val: 'city' }
            ].map((tab) => {
              const isActive = activeFilter === tab.val;
              return (
                <button
                  key={tab.val}
                  className={`group relative h-full flex items-center px-4 md:px-5 text-xs font-montserrat tracking-[1.5px] uppercase transition-all duration-300 cursor-pointer font-medium whitespace-nowrap ${
                    isActive
                      ? 'text-gold font-semibold'
                      : 'text-white-dim hover:text-white'
                  }`}
                  onClick={() => setActiveFilter(tab.val)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
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
          <div className="font-mono text-xs text-white-dim flex-shrink-0">
            {t('Showing')} <span className="text-gold font-semibold">{filteredItems.length}</span> {t('of')} {galleryItems.length} {t('photos')}
          </div>
        </div>
      </section>

      {/* ─── GALLERY GRID ─── */}
      <section className="py-12 px-6 md:px-15 bg-black">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 w-full">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="break-inside-avoid mb-4 bg-dark-3 rounded-sm animate-pulse border border-border-gold/10"
                  style={{ aspectRatio: i % 3 === 0 ? '4/3' : (i % 3 === 1 ? '3/4' : '1/1') }}
                />
              ))}
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 w-full">
              {filteredItems.map((item, index) => (
                <AnimatedCard
                  key={item._id}
                  index={index % 4}
                  animation="zoom-tilt"
                  baseDelay={0}
                  staggerMs={80}
                  tag="div"
                  className="break-inside-avoid mb-4 relative overflow-hidden bg-dark-3 cursor-pointer group rounded-sm shadow-md border border-border-gold/10"
                  onClick={() => openLightbox(index)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <span className="absolute top-0 left-0 bg-gold text-black font-mono text-[8px] font-bold tracking-[1px] uppercase py-1 px-2.5 z-10 rounded-br-sm">
                    {t(item.category)}
                  </span>

                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={t(item.title)}
                      className="w-full display block transition-transform duration-500 group-hover:scale-105 brightness-95 group-hover:brightness-90"
                      style={{ imageRendering: 'auto' }}
                    />
                  ) : (
                    <div
                      className="w-full block bg-cover bg-center transition-transform duration-500 group-hover:scale-105 group-hover:brightness-[0.6] flex flex-col items-center justify-center p-8"
                      style={{
                        aspectRatio: item.isFeat ? '16/9' : (index % 3 === 0 ? '4/3' : (index % 3 === 1 ? '3/4' : '1/1')),
                        backgroundImage: item.bg
                      }}
                    >
                      <i className={`fas ${item.icon} text-3xl text-gold/30 mb-2`}></i>
                      <span className="text-[10px] text-white-dim uppercase tracking-[1px] font-montserrat text-center">{t(item.title)}</span>
                    </div>
                  )}

                  <div className="on-dark-surface absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <div className="absolute top-4 right-4 w-9 h-9 bg-gold/15 border border-gold/45 flex items-center justify-center text-gold transition-all duration-300 group-hover:bg-gold group-hover:text-black">
                      <i className="fas fa-expand"></i>
                    </div>
                    <div className="font-cormorant text-lg text-white font-semibold leading-tight">{t(item.title)}</div>
                    <div className="font-mono text-[9px] text-gold tracking-[1px] uppercase mt-0.5">{t(item.category)}</div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── LIGHTBOX MODAL ─── */}
      {lightboxOpen && filteredItems[activeIdx] && (
        <div
          className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => e.target.classList.contains('lightbox-overlay-class') && closeLightbox()}
        >
          <div className="lightbox-overlay-class absolute inset-0 w-full h-full" onClick={closeLightbox} />

          <div className="relative w-full max-w-3xl text-center z-10">
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 w-10 h-10 bg-gold/15 border border-gold/30 text-gold text-lg flex items-center justify-center cursor-pointer hover:bg-gold hover:text-black transition-colors rounded-sm"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              ✕
            </button>

            <button
              onClick={() => navigateLightbox(-1)}
              className="absolute top-1/2 -translate-y-1/2 left-[-60px] w-11 h-11 bg-black/80 border border-gold/30 text-gold text-lg flex items-center justify-center cursor-pointer hover:bg-gold hover:text-black hover:border-gold transition-all rounded-sm z-10"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              ⟨
            </button>

            <button
              onClick={() => navigateLightbox(1)}
              className="absolute top-1/2 -translate-y-1/2 right-[-60px] w-11 h-11 bg-black/80 border border-gold/30 text-gold text-lg flex items-center justify-center cursor-pointer hover:bg-gold hover:text-black hover:border-gold transition-all rounded-sm z-10"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              ⟩
            </button>

            {filteredItems[activeIdx].imageUrl ? (
              <img
                src={filteredItems[activeIdx].imageUrl}
                alt={t(filteredItems[activeIdx].title)}
                className="w-full max-h-[70vh] object-contain block rounded-sm border border-border-gold/15"
              />
            ) : (
              <div
                className="w-full aspect-[16/9] flex items-center justify-center rounded-sm border border-border-gold/15 p-12"
                style={{ backgroundImage: filteredItems[activeIdx].bg }}
              >
                <i className={`fas ${filteredItems[activeIdx].icon} text-6xl text-gold/30`}></i>
              </div>
            )}

            <div className="mt-5 text-center">
              <h3 className="font-cormorant text-2xl font-semibold text-white">{t(filteredItems[activeIdx].title)}</h3>
              <p className="font-mono text-[10px] text-gold tracking-[1px] uppercase mt-1">
                {t(filteredItems[activeIdx].category)}
              </p>
            </div>

            <div className="absolute bottom-[-36px] left-1/2 -translate-x-1/2 font-mono text-[11px] text-white-dim">
              {activeIdx + 1} / {filteredItems.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
