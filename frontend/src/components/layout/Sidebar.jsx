import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard', id: 'nav-dashboard' },
  { path: '/fleet', label: 'Fleet', icon: 'directions_bus', id: 'nav-fleet' },
  { path: '/drivers', label: 'Drivers', icon: 'person', id: 'nav-drivers' },
  { path: '/trips', label: 'Trips', icon: 'route', id: 'nav-trips' },
  { path: '/maintenance', label: 'Maintenance', icon: 'build', id: 'nav-maintenance' },
  { path: '/fuel', label: 'Fuel & Expenses', icon: 'local_gas_station', id: 'nav-fuel' },
  { path: '/analytics', label: 'Analytics', icon: 'analytics', id: 'nav-analytics' },
  { path: '/settings', label: 'Settings', icon: 'settings', id: 'nav-settings' },
];

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container border-r border-outline-variant flex flex-col z-20">
      <div className="pt-5 pb-2 px-5">
        <div className="font-outfit font-bold text-primary text-display-lg-mobile leading-none">TransitOps</div>
        <div className="text-on-surface-variant text-label-caps tracking-widest mt-1">COMMAND CENTER</div>
      </div>
      <nav className="flex-1 mt-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            data-element-id={item.id}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-body-md transition-colors ${
                isActive
                  ? 'text-primary border-l-4 border-primary bg-surface-container-high active-glow'
                  : 'text-on-surface hover:bg-surface-container-high border-l-4 border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4 mx-3 mb-4 rounded-xl glass-card flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-body-sm">
          RK
        </div>
        <div>
          <div className="text-body-sm text-on-background font-medium">Dispatcher RK</div>
          <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">TIER 1 ADMIN</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
