import React from 'react';
import { Card } from '../shadcn/card.jsx';
import { Star } from 'lucide-react';

const TestimonialCard = ({ quote, author, origin, rating = 5 }) => (
  <Card className="bg-[#121722]/90 border-[#263142] p-8 text-center transition-all duration-300 hover:border-amber-400/50 hover:shadow-xl group">
    <div className="flex justify-center gap-1 mb-4 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'}`}
        />
      ))}
    </div>
    <p className="text-base font-cormorant italic text-neutral-200 leading-relaxed mb-5">
      "{quote}"
    </p>
    <div className="font-cinzel text-xs text-amber-300 tracking-[2px] font-bold">{author}</div>
    {origin && <div className="text-[10px] text-neutral-400 mt-1 font-montserrat">{origin}</div>}
  </Card>
);

export default TestimonialCard;
