import { useState, useMemo } from 'react';

const useRoomFilter = (rooms = []) => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSort, setSelectedSort] = useState('price-asc');

  const filtered = useMemo(() => {
    return rooms
      .filter((r) => selectedType === 'all' || r.type?.toLowerCase() === selectedType)
      .sort((a, b) => {
        if (selectedSort === 'price-asc') return a.price - b.price;
        if (selectedSort === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [rooms, selectedType, selectedSort]);

  const types = ['all', ...new Set(rooms.map((r) => r.type?.toLowerCase()).filter(Boolean))];

  return {
    filtered,
    selectedType,
    setSelectedType,
    selectedSort,
    setSelectedSort,
    types,
  };
};

export default useRoomFilter;
