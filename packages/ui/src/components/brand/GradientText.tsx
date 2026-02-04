import { cn } from '../../lib/utils';
import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
}

export function GradientText({ 
  children, 
  className = '',
  as: Component = 'span' 
}: GradientTextProps) {
  return (
    <Component
      className={cn('font-bold', className)}
      style={{
        background: 'linear-gradient(135deg, #3B7689 0%, #68B59B 50%, #92D99E 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </Component>
  );
}
