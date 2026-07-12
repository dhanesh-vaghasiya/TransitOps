import React from 'react';
import './Topbar.css';

const Topbar = () => {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <input type="text" placeholder="Search..." />
      </div>
      <div className="topbar-actions">
        <div className="user-profile">
          <img src="https://via.placeholder.com/40" alt="User" className="avatar" />
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
