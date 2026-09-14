import React from 'react';

const DataTable = ({ columns = [], data = [], onRowClick, emptyMessage = 'No data found.' }) => (
  <div className="bg-dark-3 border border-border-gold-soft rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border-gold-soft bg-dark-2/40">
            {columns.map((col) => (
              <th key={col.key} className="p-4 text-[10px] text-text-muted uppercase tracking-[2px] font-semibold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-gold-soft/50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-10 text-center text-text-muted text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row._id || row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-dark-4 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="p-4 text-[12px] text-white-dim">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default DataTable;
