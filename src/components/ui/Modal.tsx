import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md'
}: ModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to allow render before animation starts
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  if (!isVisible) return null;
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[90vh]'
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    {/* Backdrop */}
    <div className={cn('fixed inset-0 bg-black/20 transition-opacity duration-300', isAnimating ? 'opacity-100' : 'opacity-0')} onClick={onClose} />

    {/* Modal Content */}
    <div className={cn('relative w-full bg-background rounded-xl shadow-2xl border border-border/50 flex flex-col max-h-[90vh] transition-all duration-200 transform', isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-100 opacity-0 translate-y-4', sizeClasses[size], className)}>
      {/* Header */}
      {(title || description) && <div className="flex items-start justify-between p-6 border-b border-border/50">
        <div className="space-y-1">
          {title && <h2 className="text-xl font-semibold text-foreground">
            {title}
          </h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mr-2 -mt-2" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>}

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  </div>;
}