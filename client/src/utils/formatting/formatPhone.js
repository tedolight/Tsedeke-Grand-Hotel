/**
 * Format Ethiopian phone number.
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');

  // Ethiopian format: +251 XX XXX XXXX
  if (cleaned.startsWith('251') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  // Local format: 09XX XXX XXX
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
};

/**
 * Normalize phone to international format.
 */
export const normalizePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return `+251${cleaned.slice(1)}`;
  if (cleaned.startsWith('251')) return `+${cleaned}`;
  return phone;
};

export default formatPhone;
