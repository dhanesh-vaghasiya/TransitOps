import React from 'react';

const DataTable = ({ columns, data, keyField = 'id', onRowClick }) => {
  return (
    <div className="overflow-x-auto w-full bg-surface/40 backdrop-blur-xl border border-white/10 rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-black/20">
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr 
                key={row[keyField]} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-white/5' : ''}`}
              >
                {columns.map((col, idx) => (
                  <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
