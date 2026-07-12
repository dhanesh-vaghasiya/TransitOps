import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ value, onChange, name, children, className = "", id, required, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse children to extract options
  const options = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === 'option') {
      // Support array of children in option like {v.name} ({v.registrationNumber})
      let label = child.props.children;
      if (Array.isArray(label)) {
        label = label.join(''); // simplistic join for text
      }
      options.push({
        value: child.props.value !== undefined ? child.props.value : child.props.children,
        label: child.props.children
      });
    }
  });

  const selectedOption = options.find(opt => String(opt.value) === String(value)) || options[0];

  // Base style matches the polished macOS look we gave to other components
  return (
    <div className={`relative ${className.replace('p-2', '').replace('p-2.5', '').replace('py-2', '').replace('px-3', '')}`} ref={dropdownRef}>
      <div 
        className={`flex items-center justify-between w-full bg-surface-container-low/40 backdrop-blur-xl border border-outline-variant text-on-surface text-body-sm rounded-xl px-4 py-2.5 cursor-pointer transition-all shadow-sm group ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container/60 hover:border-outline'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        id={id}
      >
        <span className={!selectedOption || selectedOption.value === "" ? "text-on-surface-variant/90" : "font-medium text-on-background"}>
          {selectedOption ? selectedOption.label : "Select..."}
        </span>
        <ChevronDown size={16} className={`text-on-surface-variant transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-surface/90 backdrop-blur-3xl border border-outline-variant rounded-xl shadow-xl overflow-hidden animate-fade-in origin-top left-0">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((opt, i) => (
              <div
                key={String(opt.value) + i}
                className={`px-4 py-2.5 text-body-sm cursor-pointer transition-colors ${
                  String(value) === String(opt.value)
                    ? 'bg-primary/10 text-primary font-bold' 
                    : 'text-on-surface hover:bg-surface-hover hover:text-on-background'
                }`}
                onClick={() => {
                  if (onChange) onChange({ target: { name, value: opt.value } });
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
