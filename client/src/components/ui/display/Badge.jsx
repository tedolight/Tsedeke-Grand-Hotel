import React from 'react';
import { Badge as ShadcnBadge } from '../shadcn/badge.jsx';
import { cn } from '../../../lib/utils.js';

const Badge = ({ children, variant = 'gold', className = '', ...props }) => {
  const variantMap = {
    gold: 'gold',
    luxury: 'luxury',
    outline: 'outline',
    dark: 'default',
    success: 'success',
    destructive: 'destructive',
  };

  return (
    <ShadcnBadge
      variant={variantMap[variant] || 'default'}
      className={cn('font-cinzel text-[9px] tracking-[2px] uppercase font-bold py-1 px-3', className)}
      {...props}
    >
      {children}
    </ShadcnBadge>
  );
};

export default Badge;
