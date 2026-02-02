import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  className,
  label,
  ...props
}, ref) => {
  return <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input type="checkbox" className="sr-only peer" ref={ref} {...props} />
          <div className={cn("w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary", className)}></div>
        </div>
        {label && <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {label}
          </span>}
      </label>;
});
Switch.displayName = 'Switch';