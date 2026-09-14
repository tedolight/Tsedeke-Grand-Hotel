import React from 'react';
import useUiStore from '../../../store/ui/themeStore.js';
import { Button as ShadcnButton } from '../shadcn/button.jsx';
import { cn } from '../../../lib/utils.js';

const Button = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  fullWidth = false,
  size = 'md',
  variant = 'luxury',
  ...props
}) => {
  const { setCursorHovered } = useUiStore();
  const sizeMap = { sm: 'sm', md: 'default', lg: 'lg' };

  return (
    <ShadcnButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size={sizeMap[size] || 'default'}
      className={cn(fullWidth && 'w-full', className)}
      onMouseEnter={() => setCursorHovered(true)}
      onMouseLeave={() => setCursorHovered(false)}
      {...props}
    >
      {children}
    </ShadcnButton>
  );
};

export default Button;
