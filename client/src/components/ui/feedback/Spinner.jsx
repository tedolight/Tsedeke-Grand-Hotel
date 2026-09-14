import React from 'react';

const Spinner = ({ size = 'md', color = 'gold' }) => {
  const sizeMap = { sm: 'w-5 h-5 border-2', md: 'w-9 h-9 border-2', lg: 'w-14 h-14 border-[3px]' };
  const colorMap = { gold: 'border-gold/20 border-t-gold', white: 'border-white/20 border-t-white' };
  return (
    <div className={`${sizeMap[size]} ${colorMap[color]} rounded-full animate-spin`} />
  );
};

export default Spinner;
