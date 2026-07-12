import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-5 border-b border-outline-variant/80">
          <h3 className="text-headline-md text-on-background font-outfit">{title}</h3>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-background hover:bg-surface-container-high p-1.5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
