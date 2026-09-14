import React from 'react';
import useUiStore from '../../../store/ui/themeStore.js';
import { Card } from '../shadcn/card.jsx';
import { Badge } from '../shadcn/badge.jsx';

const DrinkCard = ({ item }) => {
  const { setCursorHovered } = useUiStore();

  return (
    <Card
      className="bg-[#121722]/85 border-[#273244] p-5 hover:border-amber-500/50 transition-all duration-300 group shadow-sm"
      onMouseEnter={() => setCursorHovered(true)}
      onMouseLeave={() => setCursorHovered(false)}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-cormorant text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
          {item.name}
        </h4>
        <span className="font-cinzel text-[13px] text-amber-300 font-bold tracking-wider whitespace-nowrap">
          ETB {item.price}
        </span>
      </div>
      {item.description && (
        <p className="text-[12px] text-neutral-300 font-montserrat leading-relaxed">{item.description}</p>
      )}
      {item.category && (
        <div className="mt-3">
          <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">
            {item.category}
          </Badge>
        </div>
      )}
    </Card>
  );
};

export default DrinkCard;
