import React from 'react';
import Spinner from './Spinner.jsx';

const Loader = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-5">
    <Spinner size="lg" />
    <p className="font-cinzel text-sm tracking-[3px] uppercase text-gold">{message}</p>
  </div>
);

export default Loader;
