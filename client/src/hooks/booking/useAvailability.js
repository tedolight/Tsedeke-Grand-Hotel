import { useCallback } from 'react';
import useBookingStore from '../../store/booking/bookingStore.js';

const useAvailability = () => {
  const { availability, loading, error, checkAvailability } = useBookingStore();

  const check = useCallback(async (roomId, checkIn, checkOut) => {
    if (!roomId || !checkIn || !checkOut) return false;
    return await checkAvailability(roomId, checkIn, checkOut);
  }, [checkAvailability]);

  return { availability, loading, error, checkAvailability: check };
};

export default useAvailability;
