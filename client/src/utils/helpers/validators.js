/**
 * Form validation helpers.
 */

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone) => {
  const cleaned = phone?.replace(/\D/g, '') || '';
  return cleaned.length >= 9 && cleaned.length <= 13;
};

export const isValidPassword = (password) =>
  password && password.length >= 6;

export const isNotEmpty = (value) =>
  value !== null && value !== undefined && String(value).trim().length > 0;

export const isValidDate = (date) => {
  const d = new Date(date);
  return !isNaN(d.getTime());
};

export const isFutureDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
};

export const isCheckOutAfterCheckIn = (checkIn, checkOut) => {
  return new Date(checkOut) > new Date(checkIn);
};

/**
 * Validate a booking form.
 * @param {Object} data
 * @returns {{ isValid: boolean, errors: Object }}
 */
export const validateBookingForm = (data) => {
  const errors = {};

  if (!isNotEmpty(data.fullName)) errors.fullName = 'Name is required';
  if (!isValidEmail(data.email)) errors.email = 'Valid email is required';
  if (!isValidPhone(data.phone)) errors.phone = 'Valid phone number is required';
  if (!isValidDate(data.checkIn)) errors.checkIn = 'Check-in date is required';
  if (!isValidDate(data.checkOut)) errors.checkOut = 'Check-out date is required';
  if (data.checkIn && data.checkOut && !isCheckOutAfterCheckIn(data.checkIn, data.checkOut)) {
    errors.checkOut = 'Check-out must be after check-in';
  }
  if (!data.guests || data.guests < 1) errors.guests = 'At least 1 guest required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate a contact form.
 */
export const validateContactForm = (data) => {
  const errors = {};

  if (!isNotEmpty(data.name)) errors.name = 'Name is required';
  if (!isValidEmail(data.email)) errors.email = 'Valid email is required';
  if (!isNotEmpty(data.subject)) errors.subject = 'Subject is required';
  if (!isNotEmpty(data.message) || (data.message && data.message.length < 10))
    errors.message = 'Message must be at least 10 characters';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default { isValidEmail, isValidPhone, validateBookingForm, validateContactForm };
