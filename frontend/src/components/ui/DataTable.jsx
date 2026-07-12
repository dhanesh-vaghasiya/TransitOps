import React from 'react';

const DataTable = ({ columns, data = [], loading = false, error = null, emptyMessage = 'No records found' }) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 py-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-surface-container-high/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-error">
        <span className="material-symbols-outlined text-[32px] mb-1">error_outline</span>
        <p className="text-body-md">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-[32px] mb-1">inbox</span>
        <p className="text-body-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-outline-variant bg-surface-container-low/30">
      <table className="w-full text-left border-collapse text-body-md text-on-surface">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-high/40">
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3 font-outfit font-semibold text-label-caps text-on-surface-variant uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-surface-container-high/30 transition-colors">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-4 py-2.5">
                  {col.render ? col.render(row) : (row[col.accessor] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
