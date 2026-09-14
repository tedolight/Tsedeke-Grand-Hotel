import * as React from 'react';
import { cn } from '../../../lib/utils.js';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl border border-[#273244] bg-[#141B28] px-3.5 py-2 text-xs text-white shadow-inner transition-colors placeholder:text-neutral-500 focus-visible:outline-none focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-400/50 disabled:cursor-not-allowed disabled:opacity-50 font-sans',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
