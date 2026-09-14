import React from 'react';

const GoldDivider = ({ center = false, className = '' }) => (
  <div className={`gold-line ${center ? 'center' : ''} ${className}`} />
);

export default GoldDivider;
