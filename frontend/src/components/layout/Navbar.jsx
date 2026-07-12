import React from 'react';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-10 flex justify-between items-center px-6 py-3 bg-surface-container/80 backdrop-blur-md border-b border-outline-variant">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
        <input 
          type="text" 
          placeholder="Search operations..." 
          data-element-id="global-search"
          className="bg-surface-container-low border border-outline-variant text-on-surface text-body-sm rounded-full pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all glow-orange"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full shimmer-glow"></span>
        </button>
        <div 
          className="bg-surface-container-high border border-outline-variant text-primary px-3 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-2 cursor-pointer hover:bg-surface-container transition-colors"
          data-element-id="user-role-badge"
        >
          <span className="w-2 h-2 rounded-full bg-primary shimmer-glow"></span>
          Dispatcher RK
        </div>
      </div>
    </header>
  );
};

export default Navbar;
