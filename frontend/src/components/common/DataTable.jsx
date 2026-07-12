import React from 'react';
import { MoreVertical } from 'lucide-react';

const DataTable = ({ columns, data, onAction }) => {
  return (
    <div className="glass-card overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-high/50 border-b border-outline-variant">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-label-caps text-on-surface-variant font-semibold tracking-wider uppercase">
                  {col.header}
                </th>
              ))}
              {onAction && (
                <th className="px-6 py-4 text-right text-label-caps text-on-surface-variant uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onAction ? 1 : 0)} className="px-6 py-8 text-center text-on-surface-variant text-body-md">
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-surface-container-high/30 transition-colors group">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 text-on-surface text-body-md">
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                  {onAction && (
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onAction(row)}
                        className="text-on-surface-variant hover:text-primary p-1 rounded-md hover:bg-surface-container-high transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
