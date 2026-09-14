/**
 * Image helper utility for Admin dashboard
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (typeof url === 'object') {
    url = url.url || url.path || url.src || '';
  }
  if (typeof url !== 'string' || !url.trim() || url === '[object Object]') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  const backendUrl = (import.meta.env.VITE_API_URL || '').replace('/api', '');
  return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default { getImageUrl };
