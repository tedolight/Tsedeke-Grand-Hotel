/**
 * Format a number as Ethiopian Birr (ETB).
 * @param {number} amount
 * @param {boolean} [showCurrency=true]
 * @returns {string}
 */
export const formatPrice = (amount, showCurrency = true) => {
  if (amount == null || isNaN(amount)) return '';
  const formatted = Number(amount).toLocaleString('en-US');
  return showCurrency ? `ETB ${formatted}` : formatted;
};

/**
 * Format price with decimals.
 */
export const formatPriceDecimal = (amount) => {
  if (amount == null || isNaN(amount)) return '';
  return `ETB ${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Calculate total price for a booking.
 */
export const calculateTotal = (pricePerNight, nights) => {
  return pricePerNight * Math.max(1, nights);
};

export default formatPrice;
