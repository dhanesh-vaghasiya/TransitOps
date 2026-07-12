import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Map, Wrench, Fuel, BarChart3, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>TransitOps</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/fleet" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <Truck size={20} />
          <span>Fleet</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
