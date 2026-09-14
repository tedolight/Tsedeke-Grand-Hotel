/**
 * Image utility helpers.
 */

/** Default placeholder images by category. */
const PLACEHOLDERS = {
  room: '/images/custom/front-view-room-bed.jpg',
  restaurant: '/images/custom/restaurant.jpg',
  event: '/images/custom/5.jpg',
  gallery: '/images/custom/1.jpg',
  hotel: '/images/custom/hotel-enrtance.jpg',
  default: '/images/gallery/interior/interior-lobby.jpg',
};

/**
 * Get a placeholder image URL by category.
 * @param {string} category
 * @returns {string}
 */
export const getPlaceholder = (category = 'default') =>
  PLACEHOLDERS[category] || PLACEHOLDERS.default;

/**
 * Get the backend URL for an image path.
 * @param {string} url
 * @returns {string}
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (typeof url === 'object' && url !== null) {
    url = url.url || url.path || url.src || '';
  }
  if (typeof url !== 'string' || !url.trim() || url === '[object Object]') return '';
  // Absolute URLs (Cloudinary, http, https) — return as-is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  // Local frontend public assets (/images/, /logo, /favicon) — return as-is
  // These are served by the frontend server, not the backend
  if (url.startsWith('/images/') || url.startsWith('/logo') || url.startsWith('/favicon')) return url;
  // Backend-served files (/uploads/) — prepend backend URL
  const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:7000/api').replace('/api', '');
  return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

/**
 * Get the first image from an array or return placeholder.
 * @param {string[]} images
 * @param {string} [category]
 * @returns {string}
 */
export const getFirstImage = (images, category = 'default') => {
  let first = null;
  if (Array.isArray(images) && images.length > 0) {
    first = images[0];
    if (typeof first === 'object' && first !== null) {
      first = first.url || first.path || first.src || '';
    }
  } else if (typeof images === 'string' && images) {
    first = images;
  }
  if (!first || first === '[object Object]') {
    return getPlaceholder(category);
  }
  return getImageUrl(first);
};

/**
 * Add Unsplash quality/size params to a URL.
 * @param {string} url
 * @param {number} [width=800]
 * @param {number} [quality=80]
 * @returns {string}
 */
export const optimizeUnsplashUrl = (url, width = 800, quality = 80) => {
  if (!url || !url.includes('unsplash.com')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}w=${width}&q=${quality}`;
};

export default { getPlaceholder, getFirstImage, optimizeUnsplashUrl };
