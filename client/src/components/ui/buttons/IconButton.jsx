import React from 'react';
import useUiStore from '../../../store/ui/themeStore.js';

const IconButton = ({ icon, onClick, title = '', className = '', variant = 'gold', size = 'md' }) => {
  const { setCursorHovered } = useUiStore();
  const sizeMap = { sm: 'w-7 h-7 text-sm', md: 'w-9 h-9 text-base', lg: 'w-12 h-12 text-lg' };
  const variantMap = {
    gold: 'bg-gold text-black hover:bg-gold-light',
    dark: 'bg-dark-3 text-white-dim hover:bg-dark-2 border border-border-gold/20',
    ghost: 'bg-transparent text-gold hover:bg-gold/10 border border-gold/30',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`${sizeMap[size]} ${variantMap[variant]} flex items-center justify-center transition-colors duration-300 cursor-pointer ${className}`}
      onMouseEnter={() => setCursorHovered(true)}
      onMouseLeave={() => setCursorHovered(false)}
    >
      {icon}
    </button>
  );
};

export default IconButton;
