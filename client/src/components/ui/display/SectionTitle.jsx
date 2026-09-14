import React from 'react';

const SectionTitle = ({ label, title, subtitle, center = false, light = false }) => (
  <div className={`mb-12 ${center ? 'text-center' : ''}`}>
    {label && (
      <span className="text-[10px] tracking-[4px] uppercase text-gold mb-3 block font-semibold font-montserrat">
        {label}
      </span>
    )}
    <h2 className={`text-3xl md:text-5xl font-cormorant font-light leading-tight mb-3 ${light ? 'text-white' : ''}`}>
      {title}
    </h2>
    {subtitle && (
      <p className="text-[14px] text-white-dim font-montserrat leading-relaxed mt-3 max-w-xl">
        {subtitle}
      </p>
    )}
    <div className={`gold-line ${center ? 'center' : ''}`} />
  </div>
);

export default SectionTitle;
