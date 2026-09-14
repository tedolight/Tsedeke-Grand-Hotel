import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils.js';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400',
  {
    variants: {
      variant: {
        default:
          'border border-neutral-700 bg-neutral-800 text-neutral-200',
        luxury:
          'border border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-[0_0_10px_rgba(201,168,76,0.15)]',
        gold:
          'border border-amber-400/60 bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 font-extrabold',
        success:
          'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
        destructive:
          'border border-red-500/30 bg-red-500/15 text-red-400',
        outline: 'text-neutral-300 border border-neutral-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
