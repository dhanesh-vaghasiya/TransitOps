import React from 'react';

const GlassPanel = ({ children, className = '', ...rest }) => {
  return (
    <div
      className={`glass-panel p-4 rounded-xl ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
