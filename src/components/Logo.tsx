import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo = ({ className, size = 'lg' }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  };

  return (
    <div className={cn(
      'font-bold text-primary',
      sizeClasses[size],
      className
    )}>
      Dr.lead
    </div>
  );
};