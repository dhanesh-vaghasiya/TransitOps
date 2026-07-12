import React, { useRef, useState, useEffect } from 'react';

const SegmentedControl = ({ options, value, onChange }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const activeRect = activeRef.current.getBoundingClientRect();
      
      setIndicatorStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width
      });
    }
  }, [value, options]);

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center p-1 bg-surface/50 border border-white/5 backdrop-blur-md rounded-lg overflow-hidden"
    >
      <div 
        className="absolute top-1 bottom-1 bg-primary/20 border border-primary/30 rounded-md transition-all duration-300 ease-spring"
        style={indicatorStyle}
      />
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            ref={isActive ? activeRef : null}
            onClick={() => onChange(option.value)}
            className={`relative z-10 px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
