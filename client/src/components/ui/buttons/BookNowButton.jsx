import React from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../../store/ui/themeStore.js';

const BookNowButton = ({ to = '/booking', children = 'Book Now', className = '' }) => {
  const { setCursorHovered } = useUiStore();
  return (
    <Link
      to={to}
      className={`btn-primary ${className}`}
      onMouseEnter={() => setCursorHovered(true)}
      onMouseLeave={() => setCursorHovered(false)}
    >
      <span>{children}</span>
    </Link>
  );
};

export default BookNowButton;
