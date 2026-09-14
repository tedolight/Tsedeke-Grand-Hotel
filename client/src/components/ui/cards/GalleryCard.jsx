import React from 'react';
import useUiStore from '../../../store/ui/themeStore.js';
import { Card } from '../shadcn/card.jsx';
import { Badge } from '../shadcn/badge.jsx';
import { Plus } from 'lucide-react';

const GalleryCard = ({ item, onClick }) => {
  const { setCursorHovered } = useUiStore();

  return (
    <Card
      className="relative overflow-hidden cursor-pointer group border-[#273244] hover:border-amber-400/60 transition-all duration-500 shadow-md p-0"
      onClick={onClick}
      onMouseEnter={() => setCursorHovered(true)}
      onMouseLeave={() => setCursorHovered(false)}
    >
      <img
        src={item.url || item}
        alt={item.caption || item.category || 'Gallery'}
        className="w-full h-64 object-cover filter brightness-85 group-hover:scale-108 group-hover:brightness-60 transition-all duration-700"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-xs">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 mb-2 shadow-lg">
          <Plus className="w-5 h-5" />
        </div>
        {item.caption && (
          <span className="text-[12px] tracking-[2px] uppercase text-white font-montserrat text-center px-4 font-semibold">
            {item.caption}
          </span>
        )}
      </div>
      {item.category && (
        <div className="absolute bottom-3 left-3 z-10">
          <Badge variant="gold" className="shadow-lg backdrop-blur-md">
            {item.category}
          </Badge>
        </div>
      )}
    </Card>
  );
};

export default GalleryCard;
