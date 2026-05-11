import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-bold uppercase transition-colors disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        curry: 'bg-curry text-sienna hover:bg-curry-bright',
        ghost: 'bg-transparent text-curry hover:text-curry-bright',
      },
      size: {
        sm: 'px-[26px] py-3 text-[13px] tracking-[0.04em]',
        lg: 'px-9 py-4 text-sm tracking-[0.06em] shadow-[0_8px_24px_-8px_rgba(244,160,43,0.6)] hover:-translate-y-px',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'curry', size: 'sm' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
