import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  label,
  error,
  ...props
}, ref) => {
  return <div className="w-full space-y-1.5">
        {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/80">
            {label}
          </label>}
        <textarea className={cn('flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/50 resize-y', error && 'border-red-500 focus-visible:ring-red-500', className)} ref={ref} {...props} />
        {error && <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1 fade-in-0">
            {error}
          </p>}
      </div>;
});
Textarea.displayName = 'Textarea';
export { Textarea };