import React from 'react';
import useUiStore from '../../../store/ui/themeStore.js';
import { Card } from '../shadcn/card.jsx';
import { Badge } from '../shadcn/badge.jsx';
import { Utensils } from 'lucide-react';

const MenuCard = ({ item }) => {
  const { setCursorHovered } = useUiStore();

  return (
    <Card
      className="p-4 bg-[#121722]/80 border-[#263142] hover:border-amber-500/50 transition-all duration-300 group flex justify-between items-start gap-4 shadow-sm"
      onMouseEnter={() => setCursorHovered(true)}
      onMouseLeave={() => setCursorHovered(false)}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-cormorant text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
            {item.name}
          </h4>
          {item.badge && (
            <Badge variant="luxury" className="text-[8px] px-1.5 py-0">
              {item.badge}
            </Badge>
          )}
        </div>

        {item.description && (
          <p className="text-[12px] text-neutral-300 font-montserrat leading-relaxed mt-1 line-clamp-2">
            {item.description}
          </p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {item.tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-[9px] text-neutral-400 border-neutral-700/80">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="text-right shrink-0">
        <span className="font-cormorant text-xl text-amber-300 font-bold tracking-wider">
          ETB {item.price?.toLocaleString?.() ?? item.price}
        </span>
      </div>
    </Card>
  );
};

export default MenuCard;
