import { useEffect } from 'react';
import useSettingsStore from '../store/settings/settingsStore.js';

/**
 * usePageMeta - sets document title and meta description for SEO.
 * @param {string} title - page title (without brand suffix)
 * @param {string} description - page meta description
 */
const usePageMeta = (title, description = '') => {
  const { hotelSettings } = useSettingsStore();

  useEffect(() => {
    const brand = `${hotelSettings.hotelName || 'Tsedeke Grand Hotel'} — Luxury & Ethiopian Hospitality`;
    document.title = title ? `${title} | ${brand}` : brand;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    if (description) {
      metaDesc.content = description;
    }

    // OG title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = title ? `${title} | ${brand}` : brand;

    return () => {
      document.title = brand;
    };
  }, [title, description]);
};

export default usePageMeta;
