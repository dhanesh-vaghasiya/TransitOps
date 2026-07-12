import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessLevel } from '../../utils/rbac';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const getInitials = (name) => {
    return name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 flex flex-col z-20 py-6 pl-6 pr-4 bg-surface border-r border-outline-variant">
      <div className="px-4 mb-8 flex items-center gap-3">
        <img src="/logo-dark.jpg" alt="Logo" className="h-8 w-auto rounded-lg shadow-sm" />
        <div className="font-outfit font-bold text-primary text-display-lg-mobile leading-none tracking-tight drop-shadow-md">TransitOps</div>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
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

      <div className="pointer-events-auto mt-auto border-t border-outline-variant/30 pt-4 flex items-center justify-between gap-2 pr-2">
        <div 
          className="flex-1 bg-surface-container/40 backdrop-blur-md border border-white/5 text-primary pl-2 pr-3 py-1.5 rounded-xl text-body-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-surface-container/60 transition-all duration-300 shadow-sm group relative overflow-hidden"
          onClick={handleLogout}
          title="Logout"
        >
          <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-[11px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] shrink-0 z-10">
            {getInitials(user?.fullName)}
          </div>
          <span className="truncate z-10 flex-1 text-xs">{user?.fullName || 'User'}</span>
          <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-all duration-300 absolute right-2 translate-x-4 group-hover:translate-x-0 text-error">logout</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-center text-on-surface-variant hover:text-on-surface bg-surface-container/20 hover:bg-surface-container/40 border border-transparent hover:border-white/5 transition-all p-1.5 rounded-xl shrink-0"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
