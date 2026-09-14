/** Booking store action creators — extend bookingStore if needed */
export const bookingActions = {
  bookAndPay: async (store, bookingData, paymentData) => {
    const booking = await store.createBooking(bookingData);
    if (!booking) return null;
    const payment = await store.processPayment({
      bookingId: booking._id,
      ...paymentData,
    });
    return payment;
  },
};

export default bookingActions;
