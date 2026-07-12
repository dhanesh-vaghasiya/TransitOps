import React from 'react';

const BentoStatCard = ({ title, value, colorClass = 'border-primary', icon: Icon, trend }) => {
  return (
    <div className={`relative glass-card p-5 border-l-4 ${colorClass} overflow-hidden transition-transform hover:-translate-y-1`}>
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <h3 className="text-on-surface-variant text-label-caps tracking-widest uppercase mb-1">{title}</h3>
          <div className="text-display-lg-mobile font-bold text-on-background">{value}</div>
        </div>
        {trend && (
          <div className={`text-xs px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {trend}
          </div>
        )}
      </div>
      {Icon && (
        <Icon className="absolute -bottom-4 -right-4 w-24 h-24 text-primary opacity-10 z-0" />
      )}
    </div>
  );
};

export default BentoStatCard;
