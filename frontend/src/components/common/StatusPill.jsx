import React from 'react';

const statusConfig = {
  available: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Available' },
  on_trip: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'On Trip' },
  off_duty: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Off Duty' },
  suspended: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Suspended' }
};

const StatusPill = ({ status, customConfig }) => {
  const config = customConfig || statusConfig[status?.toLowerCase()] || { color: 'bg-gray-500/20 text-gray-400', label: status };
  
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusPill;
