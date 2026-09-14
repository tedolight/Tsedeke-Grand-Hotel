import React from 'react';
import { Card } from '../shadcn/card.jsx';

const AmenityCard = ({ icon, title, description }) => (
  <Card className="bg-[#121722]/90 border-[#263142] p-7 text-center hover:border-amber-400/60 hover:-translate-y-1.5 transition-all duration-300 group shadow-md">
    <div className="text-4xl mb-3.5 group-hover:scale-110 transition-transform duration-300">{icon}</div>
    <h4 className="font-cinzel text-xs tracking-[2px] uppercase text-amber-300 mb-2 font-bold group-hover:text-amber-200 transition-colors">
      {title}
    </h4>
    {description && (
      <p className="text-[12px] text-neutral-300 font-montserrat leading-relaxed">{description}</p>
    )}
  </Card>
);

export default AmenityCard;
