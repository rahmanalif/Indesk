import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  className,
  label,
  onCheckedChange,
  onChange,
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onCheckedChange?.(e.target.checked);
  };

  return <label className="flex items-center gap-2 cursor-pointer group">
    <div className="relative flex items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        ref={ref}
        onChange={handleChange}
        {...props}
      />
      <div className={cn('h-4 w-4 rounded border border-primary text-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 peer-checked:bg-primary peer-checked:text-primary-foreground transition-all flex items-center justify-center', className)}>
        <Check className="h-3 w-3 opacity-0 peer-checked:opacity-100 transition-opacity" />
      </div>
    </div>
    {label && <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 group-hover:text-primary transition-colors">
      {label}
    </span>}
  </label>;
});
Checkbox.displayName = 'Checkbox';