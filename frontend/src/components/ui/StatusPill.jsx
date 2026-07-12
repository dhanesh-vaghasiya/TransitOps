import React from 'react';

const STATUS_CONFIG = {
  // Trip statuses
  draft:       { label: 'Draft',      className: 'bg-surface-container-high text-on-surface-variant border border-outline-variant' },
  dispatched:  { label: 'In Transit', className: 'bg-blue-500/15 text-blue-300 border border-blue-500/30' },
  completed:   { label: 'Completed',  className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' },
  cancelled:   { label: 'Cancelled',  className: 'bg-red-500/15 text-red-400 border border-red-500/30' },
  // Vehicle / Driver statuses
  available:   { label: 'Available',  className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' },
  on_trip:     { label: 'On Trip',    className: 'bg-blue-500/15 text-blue-300 border border-blue-500/30' },
  in_shop:     { label: 'In Shop',    className: 'bg-amber-500/15 text-amber-300 border border-amber-500/30' },
  retired:     { label: 'Retired',    className: 'bg-surface-container text-on-surface-variant border border-outline-variant' },
  off_duty:    { label: 'Off Duty',   className: 'bg-amber-500/15 text-amber-300 border border-amber-500/30' },
  suspended:   { label: 'Suspended',  className: 'bg-red-500/15 text-red-400 border border-red-500/30' },
};

/**
 * StatusPill — displays a color-coded status badge.
 * @param {string} status - One of the keys in STATUS_CONFIG
 * @param {string} [size] - 'sm' | 'md' (default 'sm')
 */
const StatusPill = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status] ?? {
    label: status ?? 'Unknown',
    className: 'bg-surface-container text-on-surface-variant border border-outline-variant',
  };

  const sizeClass = size === 'md'
    ? 'px-3 py-1 text-body-sm'
    : 'px-2 py-0.5 text-[10px] font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full tracking-wide uppercase ${sizeClass} ${config.className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  );
};

export default StatusPill;
