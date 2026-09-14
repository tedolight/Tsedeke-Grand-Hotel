import { useEffect } from 'react';
import useRoomStore from '../../store/rooms/roomStore.js';

const useRoomDetail = (id) => {
  const { room, loading, error, fetchRoomById } = useRoomStore();

  useEffect(() => {
    if (id) fetchRoomById(id);
  }, [id]);

  return { room, loading, error };
};

export default useRoomDetail;
