import React from 'react';

const BentoStatCard = ({ title, value, colorClass = 'border-orange-500', icon: Icon, trend }) => {
  return (
    <div className={`relative bg-zinc-900 rounded-xl p-5 border border-zinc-800 border-l-4 ${colorClass} overflow-hidden shadow-lg transition-transform hover:-translate-y-1`}>
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <h3 className="text-zinc-400 text-xs font-semibold tracking-wider uppercase mb-1">{title}</h3>
          <div className="text-2xl font-bold text-white">{value}</div>
        </div>
        {trend && (
          <div className={`text-xs px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {trend}
          </div>
        )}
      </div>
      {Icon && (
        <Icon className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-5 z-0" />
      )}
    </div>
  );
};

export default BentoStatCard;
