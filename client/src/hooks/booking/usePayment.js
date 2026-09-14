import { useCallback } from 'react';
import useBookingStore from '../../store/booking/bookingStore.js';

const usePayment = () => {
  const { processPayment, loading, error } = useBookingStore();

  const pay = useCallback(async (paymentData, onSuccess, onError) => {
    try {
      const result = await processPayment(paymentData);
      if (result) onSuccess?.(result);
      else onError?.('Payment failed');
      return result;
    } catch (err) {
      onError?.(err.message || 'Payment failed');
      return null;
    }
  }, [processPayment]);

  return { pay, loading, error };
};

export default usePayment;
