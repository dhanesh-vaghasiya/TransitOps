import React from 'react';

const BentoStatCard = ({ title, value, colorClass = 'border-primary', icon: Icon, trend }) => {
  return (
    <div className={`relative glass-card p-5 border-l-4 ${colorClass} overflow-hidden transition-transform hover:-translate-y-1 h-36 flex flex-col justify-between`}>
      <div className="z-10 relative">
        <h3 className="text-on-surface-variant text-label-caps tracking-widest uppercase mb-2">{title}</h3>
        <div className="text-display-lg-mobile font-bold text-primary drop-shadow-[0_0_15px_rgba(255,152,0,0.5)]">{value}</div>
      </div>
      
      {trend && (
        <div className={`z-10 relative text-body-sm font-medium ${trend.includes('+') ? 'text-emerald-400' : 'text-on-surface-variant'}`}>
          {trend.includes('+') ? '↗ ' : (trend.includes('-') ? '— ' : '')}{trend}
        </div>
      )}

      {Icon && (
        <Icon className="absolute bottom-2 right-2 w-16 h-16 text-on-surface-variant opacity-10 z-0" />
      )}
    </div>
  );
};

export default BentoStatCard;
