import React from 'react';
import { cn } from '../../lib/utils';
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl'
  };
  return <div className={cn('relative flex shrink-0 overflow-hidden rounded-full bg-muted', sizeClasses[size], className)} {...props}>
    {src ? <img src={src} alt={alt || 'Avatar'} className="aspect-square h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-medium">
      {fallback}
    </div>}
  </div>;
}