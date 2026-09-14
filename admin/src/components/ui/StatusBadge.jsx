import React from 'react';

const STATUS_STYLES = {
  Confirmed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Pending:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
  Occupied:  'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  Available: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Cleaning:  'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
  Maintenance: 'bg-red-500/10 text-red-400 border border-red-500/20',
  Reserved:  'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  Active:    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Inactive:  'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
  Read:      'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  Unread:    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Replied:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
};

const StatusBadge = ({ status, className = '' }) => {
  const style = STATUS_STYLES[status] || 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
  return (
    <span className={`text-[9px] font-bold py-1 px-2.5 rounded-full tracking-wide ${style} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
