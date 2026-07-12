import React from 'react';
import { Search } from 'lucide-react';

const FilterBar = ({ filters, setFilters, typeOptions, statusOptions }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60 shadow-inner mb-6">
      
      {typeOptions && (
        <select
          value={filters.type || ''}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="bg-zinc-950 text-zinc-300 text-sm rounded-lg border border-zinc-700 focus:ring-brand-orange focus:border-brand-orange block p-2.5 outline-none"
        >
          <option value="">Type: All</option>
          {typeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {statusOptions && (
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-zinc-950 text-zinc-300 text-sm rounded-lg border border-zinc-700 focus:ring-brand-orange focus:border-brand-orange block p-2.5 outline-none"
        >
          <option value="">Status: All</option>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      <div className="relative flex-1 min-w-[200px]">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-zinc-500" />
        </div>
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="bg-zinc-950 border border-zinc-700 text-zinc-300 text-sm rounded-lg focus:ring-brand-orange focus:border-brand-orange block w-full pl-10 p-2.5 outline-none"
          placeholder="Search by name, reg. no..."
        />
      </div>
      
    </div>
  );
};

export default FilterBar;
