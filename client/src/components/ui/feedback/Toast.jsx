import React, { useEffect, useState } from 'react';
import useUiStore from '../../../store/ui/themeStore.js';

const DURATION = 5000; // 5 seconds auto-dismiss

const TOAST_CONFIG = {
  success: {
    cardClass: 'toast-popup-success bg-[#0a1f13] border-emerald-500/40',
    bar: 'bg-emerald-400',
    icon: (
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M3 8.5L6.5 12L13 5" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    ),
    title: 'Success',
    titleClass: 'text-emerald-400 toast-popup-title',
  },
  error: {
    cardClass: 'toast-popup-error bg-[#1f0a0a] border-red-500/40',
    bar: 'bg-red-500',
    icon: (
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
    ),
    title: 'Error',
    titleClass: 'text-red-400 toast-popup-title',
  },
  info: {
    cardClass: 'toast-popup-info bg-[#1a1508] border-gold/40',
    bar: 'bg-gold',
    icon: (
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="#C9A84C" strokeWidth="1.6" />
          <path d="M7 6v4M7 4.5v.5" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
    ),
    title: 'Info',
    titleClass: 'text-gold toast-popup-title',
  },
  warning: {
    cardClass: 'toast-popup-warning bg-[#1a1200] border-amber-500/40',
    bar: 'bg-amber-400',
    icon: (
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L13 12H1L7 1Z" stroke="#f59e0b" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M7 5.5v3M7 10v.5" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
    ),
    title: 'Warning',
    titleClass: 'text-amber-400 toast-popup-title',
  },
};

const SingleToast = ({ toast, onRemove }) => {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 320);
  };

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 50);

    const timer = setTimeout(dismiss, DURATION);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  return (
    <div
      className={`toast-popup-card relative flex items-start gap-3 px-4 py-3.5 border rounded-md shadow-2xl overflow-hidden min-w-[300px] max-w-[380px] cursor-pointer
        ${cfg.cardClass} ${exiting ? 'toast-exit' : 'toast-enter'}`}
      onClick={dismiss}
      role="alert"
    >
      {/* Left color stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${cfg.bar}`} />

      {/* Icon */}
      <div className="mt-0.5 ml-1 flex-shrink-0">{cfg.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-cinzel text-[10px] tracking-[2px] uppercase font-bold mb-0.5 ${cfg.titleClass}`}>
          {cfg.title}
        </p>
        <p className="toast-popup-message font-montserrat text-[12px] text-white/90 leading-relaxed font-medium">
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        className="toast-close-btn flex-shrink-0 w-5 h-5 flex items-center justify-center text-white/40 hover:text-white transition-colors mt-0.5"
        aria-label="Dismiss"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/10">
        <div
          className={`h-full ${cfg.bar} opacity-80 transition-none`}
          style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
        />
      </div>
    </div>
  );
};

const Toast = () => {
  const { toasts, removeToast } = useUiStore();

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <SingleToast toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};

export default Toast;
