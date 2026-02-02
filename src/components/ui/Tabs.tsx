import React, { Children, cloneElement, isValidElement } from 'react';
import { cn } from '../../lib/utils';
interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}
export function Tabs({
  value,
  onValueChange,
  children,
  className
}: TabsProps) {
  return <div className={cn('w-full', className)}>
      {Children.map(children, child => {
      if (isValidElement(child)) {
        return cloneElement(child as React.ReactElement<any>, {
          value,
          onValueChange
        });
      }
      return child;
    })}
    </div>;
}
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}
export function TabsList({
  children,
  className
}: TabsListProps) {
  return <div className={cn('inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)}>
      {children}
    </div>;
}
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  // Injected by Tabs
  onValueChange?: (value: string) => void;
  selectedValue?: string;
}
export function TabsTrigger({
  value,
  children,
  className,
  onValueChange,
  selectedValue
}: any) {
  const isSelected = selectedValue === value;
  return <button type="button" role="tab" aria-selected={isSelected} onClick={() => onValueChange && onValueChange(value)} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', isSelected ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50 hover:text-foreground', className)}>
      {children}
    </button>;
}
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  // Injected by Tabs
  selectedValue?: string;
}
export function TabsContent({
  value,
  children,
  className,
  selectedValue
}: any) {
  if (value !== selectedValue) return null;
  return <div role="tabpanel" className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in-50 zoom-in-95 duration-200', className)}>
      {children}
    </div>;
}