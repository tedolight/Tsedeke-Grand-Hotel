import React from 'react';
import useUiStore from '../../../store/ui/themeStore.js';
import { Button as ShadcnButton } from '../shadcn/button.jsx';
import { cn } from '../../../lib/utils.js';

const ButtonOutline = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  fullWidth = false,
  size = 'md',
  ...props
}) => {
  const { setCursorHovered } = useUiStore();
  const sizeMap = { sm: 'sm', md: 'default', lg: 'lg' };

  return (
    <ShadcnButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      size={sizeMap[size] || 'default'}
      className={cn(
        'border-amber-500/30 text-amber-200 hover:bg-amber-500/10 hover:border-amber-400',
        fullWidth && 'w-full',
        className
      )}
      onMouseEnter={() => setCursorHovered(true)}
      onMouseLeave={() => setCursorHovered(false)}
      {...props}
    >
      {children}
    </ShadcnButton>
  );
};

export default ButtonOutline;
