import React from 'react';

const Pagination = ({ page, totalPages, onPageChange, totalItems, perPage }) => {
  if (totalPages <= 1) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border-gold-soft bg-dark-2/20">
      <span className="text-[11px] text-text-muted">
        Showing {start}–{end} of {totalItems}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold disabled:opacity-30 rounded flex items-center justify-center cursor-pointer text-text-muted text-xs transition-colors disabled:cursor-not-allowed"
        >
          <i className="fas fa-chevron-left text-[9px]" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer text-xs transition-colors ${
              p === page
                ? 'bg-gold text-black border border-gold font-bold'
                : 'bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold text-text-muted'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 bg-dark-4 border border-border-gold-soft hover:border-gold hover:text-gold disabled:opacity-30 rounded flex items-center justify-center cursor-pointer text-text-muted text-xs transition-colors disabled:cursor-not-allowed"
        >
          <i className="fas fa-chevron-right text-[9px]" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
