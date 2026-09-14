/**
 * General utility helpers.
 */

/** Debounce function calls. */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/** Throttle function calls. */
export const throttle = (fn, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
};

/** Capitalize first letter. */
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

/** Truncate text with ellipsis. */
export const truncate = (str, maxLen = 100) =>
  str && str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;

/** Smooth scroll to element by ID. */
export const scrollToElement = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/** Scroll to top of page. */
export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/** Generate a random ID string. */
export const generateId = () =>
  Math.random().toString(36).substring(2, 9);

/** Check if value is empty (null, undefined, empty string, empty array). */
export const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/** Deep clone an object. */
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/** Classname merger (simple cn utility). */
export const cn = (...classes) =>
  classes.filter(Boolean).join(' ');
