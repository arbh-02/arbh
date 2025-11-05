import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo = ({ className, size = 'lg', ...props }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16',
    xl: 'h-24',
  };

  return (
    <img
      src="/logo.png"
      alt="Dr.lead Logo"
      className={cn(
        'object-contain',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};