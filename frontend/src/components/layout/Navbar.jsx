import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    return name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-4 mx-6 z-10 flex justify-between items-center px-6 py-3 bg-surface-container-low/40 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center gap-2">
        {/* Search removed as requested */}
      </div>
      <div className="flex items-center gap-5">
        <button className="relative text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-xl hover:bg-surface-container/30">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error border-2 border-[#150c07] rounded-full shimmer-glow"></span>
        </button>
        <div 
          className="bg-surface-container/40 backdrop-blur-md border border-white/5 text-primary pl-2 pr-4 py-1.5 rounded-xl text-body-sm font-medium flex items-center gap-3 cursor-pointer hover:bg-surface-container/60 hover:pr-8 transition-all duration-300 shadow-sm group relative w-auto overflow-hidden"
          onClick={handleLogout}
          title="Logout"
        >
          <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-[11px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] shrink-0 z-10">
            {getInitials(user?.fullName)}
          </div>
          <span className="truncate max-w-[150px] z-10">{user?.fullName || 'User'}</span>
          <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-all duration-300 absolute right-2 translate-x-4 group-hover:translate-x-0 text-error">logout</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
