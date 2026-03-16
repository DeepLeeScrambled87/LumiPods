import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  closeOnEscape = true,
}) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') onClose();
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={closeOnOverlay ? onClose : undefined}
            aria-hidden="true"
          />

          <div className="relative flex min-h-full items-start justify-center p-4 sm:items-center">
            {/* Modal */}
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'relative my-6 flex max-h-[calc(100vh-3rem)] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl',
                sizeStyles[size]
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              aria-describedby={description ? 'modal-description' : undefined}
            >
              {/* Header */}
              {(title || showClose) && (
                <div className="flex items-start justify-between border-b border-slate-200 p-5">
                  <div>
                    {title && (
                      <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p id="modal-description" className="text-sm text-slate-500 mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                  {showClose && (
                    <button
                      onClick={onClose}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="min-h-0 overflow-y-auto p-5">{children}</div>
            </m.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-4', className)}>
    {children}
  </div>
);

export default Modal;
