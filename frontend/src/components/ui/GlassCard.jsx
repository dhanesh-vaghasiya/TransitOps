import React from 'react';

/**
 * GlassCard — premium glass-morphism card wrapper.
 * @param {React.ReactNode} children
 * @param {string} [className] - additional Tailwind classes
 * @param {object} [rest] - any extra props passed to the div
 */
const GlassCard = ({ children, className = '', ...rest }) => {
  return (
    <div
      className={`glass-card p-4 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default GlassCard;
