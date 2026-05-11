import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-md border border-curry/30 bg-bg-deep px-4 py-2 text-curry placeholder:text-curry-soft/60 focus:outline-none focus:ring-2 focus:ring-curry',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
