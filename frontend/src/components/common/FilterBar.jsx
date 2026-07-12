import React from 'react';
import { Search } from 'lucide-react';

const FilterBar = ({ filters, setFilters, typeOptions, statusOptions, hideSearch = false }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 glass-panel p-4 rounded-xl mb-6">
      
      {typeOptions && (
        <select
          value={filters.type || ''}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="bg-surface-container-high text-on-surface text-body-md rounded-lg border border-outline focus:ring-primary focus:border-primary block p-2.5 outline-none"
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
          className="bg-surface-container-high text-on-surface text-body-md rounded-lg border border-outline focus:ring-primary focus:border-primary block p-2.5 outline-none"
        >
          <option value="">Status: All</option>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {!hideSearch && (
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-on-surface-variant" />
          </div>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="bg-surface-container-high border border-outline text-on-surface text-body-md rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 outline-none placeholder:text-on-surface-variant/50"
            placeholder="Search by name, reg. no..."
          />
        </div>
      )}
      
    </div>
  );
};

export default FilterBar;
