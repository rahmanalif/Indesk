import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  type,
  label,
  error,
  icon,
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] ml-1 block">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-14 w-full rounded-2xl border border-primary/10 bg-secondary/30 px-5 py-2 text-sm font-semibold shadow-inner transition-all placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-secondary/50 focus:bg-white',
            icon && 'pl-12',
            error && 'border-red-500 ring-red-500/20',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] font-semibold text-red-500 ml-1 mt-1 animate-in slide-in-from-top-1 fade-in-0">
          {error}
        </p>
      )}
    </div>
  );
});
Input.displayName = 'Input';
export { Input };