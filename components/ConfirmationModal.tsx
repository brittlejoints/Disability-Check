import React, { useEffect, useRef } from 'react';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Deletion", 
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  isLoading = false
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus Management: Focus the Cancel button on mount for safety
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard Support: Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-charcoal/20 backdrop-blur-sm animate-fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
    >
      <div className="bg-white rounded-3xl shadow-luxury w-full max-w-md p-6 md:p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6" aria-hidden="true">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </div>
        
        <h3 id="modal-title" className="text-2xl font-serif text-burgundy mb-2">{title}</h3>
        <p id="modal-description" className="text-slate font-light mb-8 leading-relaxed">
            {message}
        </p>

        <div className="flex gap-4 w-full">
            <Button 
                ref={cancelButtonRef}
                variant="outline" 
                onClick={onClose} 
                className="flex-1 border-taupe text-slate hover:border-slate hover:text-charcoal" 
                disabled={isLoading}
            >
                Cancel
            </Button>
            <Button 
                variant="danger" 
                onClick={onConfirm} 
                className="flex-1 shadow-lg shadow-red-500/20" 
                disabled={isLoading}
            >
                {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;