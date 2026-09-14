import React from 'react';
import { Card } from '../shadcn/card.jsx';
import { Button } from '../shadcn/button.jsx';
import { ArrowRight } from 'lucide-react';

const ServiceCard = ({ icon, title, description, action }) => (
  <Card className="bg-[#121722]/90 border-[#273244] p-7 hover:border-amber-400/50 hover:-translate-y-1.5 transition-all duration-300 group shadow-md flex flex-col justify-between">
    <div>
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h4 className="font-cinzel text-xs tracking-[2px] uppercase text-amber-300 mb-3 font-bold group-hover:text-amber-200 transition-colors">
        {title}
      </h4>
      {description && (
        <p className="text-[12px] text-neutral-300 font-montserrat leading-relaxed mb-4">{description}</p>
      )}
    </div>
    {action && (
      <Button
        type="button"
        variant="link"
        onClick={action.onClick}
        className="p-0 text-amber-300 hover:text-amber-200 font-cinzel text-xs font-semibold gap-1.5 justify-start"
      >
        <span>{action.label}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    )}
  </Card>
);

export default ServiceCard;
