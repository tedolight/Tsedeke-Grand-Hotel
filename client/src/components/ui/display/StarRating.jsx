import React from 'react';

const StarRating = ({ rating = 5, max = 5, size = 'sm' }) => {
  const sizeMap = { sm: 'text-xs', md: 'text-base', lg: 'text-xl' };
  return (
    <div className={`flex gap-0.5 ${sizeMap[size]} text-gold`} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i}>{i < Math.floor(rating) ? '★' : '☆'}</span>
      ))}
    </div>
  );
};

export default StarRating;
