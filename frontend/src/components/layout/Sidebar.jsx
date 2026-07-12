import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessLevel } from '../../utils/rbac';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard', id: 'nav-dashboard', resourceKey: 'dashboard' },
  { path: '/fleet', label: 'Fleet', icon: 'directions_bus', id: 'nav-fleet', resourceKey: 'fleet' },
  { path: '/drivers', label: 'Drivers', icon: 'person', id: 'nav-drivers', resourceKey: 'drivers' },
  { path: '/trips', label: 'Trips', icon: 'route', id: 'nav-trips', resourceKey: 'trips' },
  { path: '/maintenance', label: 'Maintenance', icon: 'build', id: 'nav-maintenance', resourceKey: 'maintenance' },
  { path: '/fuel', label: 'Fuel & Expenses', icon: 'local_gas_station', id: 'nav-fuel', resourceKey: 'fuel' },
  { path: '/analytics', label: 'Analytics', icon: 'analytics', id: 'nav-analytics', resourceKey: 'analytics' },
  { path: '/settings', label: 'Settings', icon: 'settings', id: 'nav-settings', resourceKey: 'settings' },
];

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-20 py-6 pl-6 pr-2 bg-transparent pointer-events-none">
      <div className="px-4 mb-8 pointer-events-auto flex items-center gap-3">
        <img src="/logo-dark.jpg" alt="Logo" className="h-8 w-auto rounded-lg shadow-sm" />
        <div className="font-outfit font-bold text-primary text-display-lg-mobile leading-none tracking-tight drop-shadow-md">TransitOps</div>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 pointer-events-auto">
        {navItems.map((item) => {
          const accessLevel = getAccessLevel(user?.roles, item.resourceKey);
          if (accessLevel === 'none') return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              data-element-id={item.id}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-body-md rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'text-primary bg-surface-container/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                    : 'text-on-surface hover:bg-surface-container/30 hover:backdrop-blur-xl border border-transparent'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
