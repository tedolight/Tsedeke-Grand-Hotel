import React, { useEffect } from 'react';

const FormModal = ({ isOpen, title, onClose, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`bg-dark-3 border border-border-gold rounded-lg w-full ${widths[size]} shadow-2xl max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-gold-soft">
          <h3 className="font-cinzel text-sm text-white font-semibold tracking-[1px]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted rounded flex items-center justify-center cursor-pointer text-xs transition-colors"
          >
            <i className="fas fa-times" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormModal;
