import { useTranslation } from 'react-i18next';
import React from 'react';
import Lightbox from '../../ui/display/Lightbox.jsx';

const GalleryLightbox = ({ images, currentIndex, isOpen, onClose, onNext, onPrev }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;
  const urls = images.map((img) => {t('img.url || img);
  return (')}
    <Lightbox
      images={urls}
      currentIndex={currentIndex}
      onClose={onClose}
      onNext={onNext}
      onPrev={onPrev}
    />
  );
};

export default GalleryLightbox;
