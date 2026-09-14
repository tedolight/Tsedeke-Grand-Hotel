import React, { useEffect } from 'react';

const ConfirmModal = ({ isOpen, title, message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }) => {
  useEffect(() => {
    if (isOpen) {
      const handleKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-dark-3 border border-border-gold rounded-lg p-7 max-w-sm w-full shadow-2xl">
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-red-500/10 border border-red-500/20' : 'bg-gold-glow border border-border-gold'}`}>
            <i className={`${danger ? 'fas fa-exclamation-triangle text-red-400' : 'fas fa-question-circle text-gold'}`} />
          </div>
          <div>
            <h3 className="font-cinzel text-sm text-white font-semibold tracking-[1px] mb-1">{title}</h3>
            <p className="text-[12px] text-text-muted leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="bg-transparent border border-border-gold text-text-muted hover:border-gold hover:text-gold text-[10px] tracking-[1px] uppercase font-semibold py-2 px-4 rounded transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`text-[10px] tracking-[1px] uppercase font-semibold py-2 px-5 rounded cursor-pointer transition-colors ${
              danger
                ? 'bg-red-500/80 hover:bg-red-500 text-white border border-red-500/30'
                : 'bg-gold hover:bg-gold-light text-black'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
