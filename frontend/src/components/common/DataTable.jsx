import React from 'react';
import { MoreVertical } from 'lucide-react';

const DataTable = ({ columns, data, onAction }) => {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50 border-b border-zinc-800">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 font-semibold tracking-wider">
                  {col.header}
                </th>
              ))}
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-zinc-500">
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-zinc-800/30 transition-colors group">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 text-zinc-300">
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onAction && onAction(row)}
                      className="text-zinc-500 hover:text-white p-1 rounded-md hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
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
