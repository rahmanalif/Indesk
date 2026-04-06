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
  bodyClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  bodyClassName,
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
  return <div className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center sm:p-6">
    {/* Backdrop */}
    <div className={cn('fixed inset-0 bg-black/20 transition-opacity duration-300', isAnimating ? 'opacity-100' : 'opacity-0')} onClick={onClose} />

    {/* Modal Content */}
    <div className={cn('relative flex max-h-[calc(100dvh-1rem)] w-full flex-col rounded-[20px] border border-border/50 bg-background shadow-2xl transition-all duration-200 transform sm:max-h-[96vh] sm:rounded-xl', isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-100 opacity-0 translate-y-4', sizeClasses[size], className)}>
      {/* Header */}
      {(title || description) && <div className="flex items-start justify-between border-b border-border/50 p-4 sm:p-6">
        <div className="space-y-1">
          {title && <h2 className="pr-4 text-lg font-semibold text-foreground sm:text-xl">
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
      <div className={cn("flex-1 overflow-y-auto p-4 sm:p-6", bodyClassName)}>{children}</div>
    </div>
  </div>;
}
