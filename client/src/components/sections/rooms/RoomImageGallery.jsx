import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import Lightbox from '../../ui/display/Lightbox.jsx';

const RoomImageGallery = ({ images = [], roomName = 'Room' }) => {
  const { t } = useTranslation();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const open = (i) => { setCurrentIndex(i); setLightboxOpen(true); };
  const close = () => setLightboxOpen(false);
  const next = () => setCurrentIndex((p) => (p + 1) % images.length);
  const prev = () => setCurrentIndex((p) => {t('(p - 1 + images.length) % images.length);

  if (!images.length) return null;

  return (')}
    <>
      <div className="grid grid-cols-3 gap-1.5">
        <div className="col-span-2 relative overflow-hidden h-64 cursor-pointer group" onClick={() => open(0)}>
          <img src={images[0]} alt={roomName} className="w-full h-full object-cover brightness-80 group-hover:scale-105 group-hover:brightness-60 transition-all duration-500" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-gold text-4xl">⊕</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {images.slice(1, 3).map((img, i) => (
            <div key={i} className="relative overflow-hidden flex-1 cursor-pointer group" onClick={() => open(i + 1)}>
              <img src={img} alt={`${roomName} ${i + 2}`} className="w-full h-full object-cover brightness-75 group-hover:scale-105 group-hover:brightness-75 transition-all duration-500" />
              {i === 1 && images.length > 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="font-cormorant text-xl text-gold">+{images.length - 3} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {lightboxOpen && (
        <Lightbox images={images} currentIndex={currentIndex} onClose={close} onNext={next} onPrev={prev} />
      )}
    </>
  );
};

export default RoomImageGallery;
