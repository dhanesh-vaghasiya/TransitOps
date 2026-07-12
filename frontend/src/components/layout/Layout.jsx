import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
const Layout = () => {
  return (
    <div className="min-h-screen flex bg-surface text-on-background font-inter selection:bg-primary/30">
      <Sidebar />
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <main className="flex-1 p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
