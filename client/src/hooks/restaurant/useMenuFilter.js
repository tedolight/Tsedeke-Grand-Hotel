import { useState, useMemo } from 'react';

const useMenuFilter = (items = []) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return {
    filtered,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  };
};

export default useMenuFilter;
