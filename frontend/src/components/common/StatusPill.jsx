import React from 'react';

const StatusPill = ({ status }) => {
  const normalizedStatus = (status || '').toLowerCase();
  
  let colorClass = 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30';
  let label = status;

  if (['available', 'active', 'completed'].includes(normalizedStatus)) {
    colorClass = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  } else if (['on_trip', 'in_progress', 'dispatched'].includes(normalizedStatus)) {
    colorClass = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    if (normalizedStatus === 'on_trip') label = 'On Trip';
  } else if (['in_shop', 'suspended'].includes(normalizedStatus)) {
    colorClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    label = 'In Shop';
  } else if (['scheduled'].includes(normalizedStatus)) {
    colorClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
  } else if (['retired', 'cancelled'].includes(normalizedStatus)) {
    colorClass = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
  }

  // Capitalize properly
  label = label.replace('_', ' ');
  label = label.replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} inline-flex items-center justify-center whitespace-nowrap shadow-sm`}>
      {label}
    </span>
  );
};

export default StatusPill;
