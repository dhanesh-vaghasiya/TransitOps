import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-primary-600 dark:text-primary-500">TransitOps</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
