import { useEffect } from 'react';
import useRoomStore from '../../store/rooms/roomStore.js';

const useRooms = (filters = {}) => {
  const { rooms, loading, error, fetchRooms } = useRoomStore();

  useEffect(() => {
    fetchRooms(filters);
  }, [fetchRooms, filters.type, filters.sort]);

  return { rooms, loading, error, fetchRooms };
};

export default useRooms;
