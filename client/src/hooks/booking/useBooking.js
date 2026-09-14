import { useCallback } from 'react';
import useBookingStore from '../../store/booking/bookingStore.js';

const useBooking = () => {
  const store = useBookingStore();

  const createAndNavigate = useCallback(async (bookingData, onSuccess) => {
    const result = await store.createBooking(bookingData);
    if (result) onSuccess?.(result);
    return result;
  }, [store]);

  return {
    ...store,
    createAndNavigate,
  };
};

export default useBooking;
