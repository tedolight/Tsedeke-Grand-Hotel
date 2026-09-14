import React from 'react';

const EmptyState = ({ icon = '🏨', title = 'Nothing here yet', message = '', action }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
    <div className="text-5xl">{icon}</div>
    <h3 className="font-cinzel text-base tracking-[2px] uppercase text-gold">{title}</h3>
    {message && <p className="text-[13px] text-white-dim font-montserrat max-w-xs">{message}</p>}
    {action && (
      <button
        onClick={action.onClick}
        className="btn-primary mt-2"
        style={{ padding: '10px 28px', fontSize: '10px' }}
      >
        <span>{action.label}</span>
      </button>
    )}
  </div>
);

export default EmptyState;
