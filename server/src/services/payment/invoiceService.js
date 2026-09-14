/**
 * Invoice service for generating booking invoices.
 */

/**
 * Generate a simple invoice object for a booking.
 * @param {Object} booking - The booking document (populated with room).
 * @param {Object} payment - The payment document.
 * @returns {Object} Invoice data.
 */
export const generateInvoice = (booking, payment) => {
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  return {
    invoiceId: `INV-${booking._id.toString().slice(-8).toUpperCase()}`,
    date: new Date().toISOString(),
    hotel: {
      name: 'Tsedeke Grand Hotel',
      address: 'Hossana, Ethiopia',
      phone: '+251 90 951 7777',
      email: 'info@tsedekegrandhotel.com',
    },
    guest: {
      name: booking.fullName,
      email: booking.email,
      phone: booking.phone,
    },
    booking: {
      bookingId: booking._id,
      room: booking.room?.name || 'N/A',
      roomType: booking.room?.type || 'N/A',
      checkIn: checkIn.toLocaleDateString(),
      checkOut: checkOut.toLocaleDateString(),
      nights,
      guests: booking.guests,
      pricePerNight: booking.room?.price || 0,
    },
    payment: {
      method: payment?.paymentMethod || 'N/A',
      transactionId: payment?.transactionId || 'N/A',
      status: payment?.status || 'pending',
      amount: booking.totalPrice,
    },
    totals: {
      subtotal: booking.totalPrice,
      tax: Math.round(booking.totalPrice * 0.15), // 15% VAT
      total: Math.round(booking.totalPrice * 1.15),
      currency: 'ETB',
    },
  };
};

export default generateInvoice;
