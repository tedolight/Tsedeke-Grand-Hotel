import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

const SearchBar = ({ placeholder = 'Search...', onSearch, className = '' }) => {
  const { t } = useTranslation();

  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-stretch ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="bg-dark-3 border border-border-gold/25 border-r-0 text-white font-montserrat text-[13px] px-4 py-3 outline-none focus:border-gold flex-1 placeholder:text-white-dim/30"
      />
      <button
        type="submit"
        className="bg-gold text-black px-5 hover:bg-gold-light transition-colors font-cinzel text-[10px] tracking-[2px] font-semibold border border-gold"
      >
        {t('Search')}
      </button>
    </form>
  );
};

export default SearchBar;
