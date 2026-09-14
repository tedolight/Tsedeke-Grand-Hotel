import { useTranslation } from 'react-i18next';
import React, { useEffect, useCallback } from 'react';

const Lightbox = ({ images = [], currentIndex = 0, onClose, onPrev, onNext }) => {
  const { t } = useTranslation();

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev?.();
    if (e.key === 'ArrowRight') onNext?.();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  if (!images.length) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-5xl w-full px-16" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex]}
          alt={`Gallery ${currentIndex + 1}`}
          className="w-full max-h-[80vh] object-contain"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gold/80 text-black flex items-center justify-center hover:bg-gold transition-colors"
            >
              ‹
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gold/80 text-black flex items-center justify-center hover:bg-gold transition-colors"
            >
              ›
            </button>
          </>
        )}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white-dim hover:text-gold font-cinzel text-sm tracking-widest"
        >
          {t('CLOSE ✕')}
        </button>
        {images.length > 1 && (
          <div className="text-center mt-4 text-[11px] text-white-dim font-montserrat tracking-widest">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lightbox;
