// components/ui/Select.tsx
import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  triggerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options = [], className = '', triggerClassName, children, ...props },
  ref
) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] ml-1 block">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'flex h-14 w-full appearance-none rounded-2xl border border-primary/10 bg-secondary/30 px-5 py-2 pr-11 text-sm font-semibold text-foreground shadow-inner transition-all hover:bg-secondary/50 focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
            className,
            triggerClassName
          )}
          {...props}
        >
          {options.length > 0 ? (
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
      </div>
    </div>
  );
});
