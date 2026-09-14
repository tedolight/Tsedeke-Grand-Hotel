import React from 'react';

const MenuCategory = ({ name, items = [] }) => (
  <div className="mb-12">
    <h3 className="font-cinzel text-[13px] tracking-[4px] uppercase text-gold mb-6 pb-3 border-b border-border-gold/25">{name}</h3>
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex justify-between items-start py-4 border-b border-border-gold/10 hover:border-gold/30 hover:pl-2 transition-all duration-300 group">
          <div>
            <div className="font-cormorant text-lg text-white group-hover:text-gold transition-colors">{item.name}</div>
            {item.description && <div className="text-[11px] text-white-dim font-montserrat leading-relaxed mt-1">{item.description}</div>}
          </div>
          <span className="font-cinzel text-[12px] text-gold tracking-wider ml-6 whitespace-nowrap">ETB {item.price}</span>
        </div>
      ))}
    </div>
  </div>
);

export default MenuCategory;
