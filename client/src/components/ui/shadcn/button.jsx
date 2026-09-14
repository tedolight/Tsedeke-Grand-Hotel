import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 cursor-pointer select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-800 border border-neutral-700',
        luxury:
          'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-neutral-950 font-bold shadow-[0_4px_15px_rgba(201,168,76,0.3)] hover:brightness-110 border border-amber-300/40',
        gold:
          'bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 hover:border-amber-400',
        destructive:
          'bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30',
        outline:
          'border border-neutral-700/80 bg-transparent hover:bg-neutral-800 hover:text-neutral-100 text-neutral-300',
        secondary:
          'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700/60',
        ghost:
          'hover:bg-neutral-800/80 text-neutral-400 hover:text-neutral-100',
        link: 'text-amber-400 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-lg px-2.5 text-[11px]',
        lg: 'h-11 rounded-2xl px-6 text-sm',
        icon: 'h-8 w-8 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
