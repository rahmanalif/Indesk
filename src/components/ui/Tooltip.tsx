import React, { useState } from 'react';
import { cn } from '../../lib/utils';
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}
export function Tooltip({
  content,
  children,
  side = 'top',
  className
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2'
  };
  return <div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && <div className={cn('absolute z-50 px-2 py-1 text-xs font-medium text-white bg-foreground rounded shadow-sm whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200', positionClasses[side], className)}>
          {content}
          {/* Arrow */}
          <div className={cn('absolute w-2 h-2 bg-foreground rotate-45', side === 'top' && 'bottom-[-3px] left-1/2 -translate-x-1/2', side === 'right' && 'left-[-3px] top-1/2 -translate-y-1/2', side === 'bottom' && 'top-[-3px] left-1/2 -translate-x-1/2', side === 'left' && 'right-[-3px] top-1/2 -translate-y-1/2')} />
        </div>}
    </div>;
}