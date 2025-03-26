'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  /**
   * Optional callback to generate an accessible label based on the current value.
   * If not provided, a default implementation will be used.
   */
  getValueLabel?: (value: number, max: number) => string;
}

/**
 * A simple Progress component that doesn't rely on Radix UI.
 * This should avoid the transpilation issues on Vercel.
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, getValueLabel, ...props }, ref) => {
    // Ensure value is within bounds
    const validValue = Math.max(0, Math.min(value, max));
    const percentage = (validValue / max) * 100;
    
    // Default label generator
    const defaultGetValueLabel = (value: number, max: number) => 
      `${Math.round((value / max) * 100)}%`;
    
    const label = (getValueLabel || defaultGetValueLabel)(validValue, max);
    
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={validValue}
        aria-valuetext={label}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-primary transition-all"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
