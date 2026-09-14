/**
 * Format a date string to a human-readable format.
 * @param {string|Date} date
 * @param {Object} [options]
 * @returns {string}
 */
export const formatDate = (dateInput, options = {}) => {
  if (!dateInput) return '';

  let str = typeof dateInput === 'string' ? dateInput : '';
  if (str.includes('T')) {
    str = str.split('T')[0];
  }

  if (typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str.trim())) {
    const [year, month, day] = str.trim().split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const defaults = { year: 'numeric', month: 'long', day: 'numeric', ...options };
    return d.toLocaleDateString('en-US', defaults);
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const defaults = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return d.toLocaleDateString('en-US', defaults);
};

/**
 * Format date as short format (e.g., "Jun 3, 2026")
 */
export const formatDateShort = (date) =>
  formatDate(date, { month: 'short' });

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
export const formatDateISO = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Get number of nights between two dates.
 */
export const getNights = (checkIn, checkOut) => {
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/**
 * Format a relative time string (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDateShort(date);
};

export default formatDate;
