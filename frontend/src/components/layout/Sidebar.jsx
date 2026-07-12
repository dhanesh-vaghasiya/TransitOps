import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  const roleLabels = {
    fleet_manager: 'Fleet Manager',
    dispatcher: 'Dispatcher',
    driver: 'Driver',
    safety_officer: 'Safety Officer',
    finance_manager: 'Finance Manager'
  };

  const primaryRole = user?.roles?.[0] ? roleLabels[user.roles[0]] || 'User' : 'User';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container border-r border-outline-variant flex flex-col z-20">
      <div className="pt-5 pb-2 px-5 flex items-center justify-between">
        <div>
          <div className="font-outfit font-bold text-primary text-display-lg-mobile leading-none">TransitOps</div>
          <div className="text-on-surface-variant text-label-caps tracking-widest mt-1">COMMAND CENTER</div>
        </div>
      </div>
      <nav className="flex-1 mt-4 overflow-y-auto">
        {navItems.map((item) => {
          const accessLevel = getAccessLevel(user?.roles, item.resourceKey);
          if (accessLevel === 'none') return null;

          return (
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
          );
        })}
      </nav>
      <div className="mt-auto p-4 mx-3 mb-4 rounded-xl glass-card flex items-center justify-between gap-3 group relative cursor-pointer" onClick={handleLogout}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-body-sm">
            {getInitials(user?.fullName)}
          </div>
          <div className="overflow-hidden">
            <div className="text-body-sm text-on-background font-medium truncate">{user?.fullName || 'Unknown'}</div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">{primaryRole}</div>
          </div>
        </div>
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" title="Logout">logout</span>
      </div>
    </aside>
  );
};

export default Sidebar;
