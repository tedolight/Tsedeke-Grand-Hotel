import React from 'react';

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="page-header flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-gold-soft pb-5 mb-6">
      <div>
        <h1 className="page-heading font-cinzel text-xl text-white tracking-[0.5px] font-semibold mb-1 uppercase">{title}</h1>
        {subtitle && <p className="text-[11px] text-text-muted tracking-[0.5px]">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
    </div>
  );
};

export default PageHeader;
