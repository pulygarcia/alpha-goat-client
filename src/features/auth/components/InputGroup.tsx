import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputGroupProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helper?: string;
  rightIcon?: ReactNode;
  onRightIcon?: () => void;
}

const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(
  (
    { label, error, helper, rightIcon, onRightIcon, id, className, ...props },
    ref,
  ) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={fieldId}
          className="text-[0.85rem] font-medium"
          style={{ color: '#fdf6e8' }}
        >
          {label}
        </label>
        <div className="relative">
          <input
            id={fieldId}
            ref={ref}
            className={`auth-input h-12 w-full rounded-xl border px-4 text-[14px] font-medium transition-all duration-150 ${className ?? ''}`}
            style={{
              background: '#3b1a0a',
              borderColor: error ? '#ff7a59' : 'rgba(244,160,43,0.18)',
              color: '#fdf6e8',
            }}
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Toggle"
              onClick={onRightIcon}
              className="text-curry-soft hover:text-curry absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              {rightIcon}
            </button>
          )}
        </div>
        {error && (
          <p
            className="text-[0.72rem] leading-[1.3]"
            style={{ color: '#ff7a59' }}
          >
            {error}
          </p>
        )}
        {!error && helper && (
          <p
            className="text-[0.72rem] leading-[1.3]"
            style={{ color: 'rgba(246,201,119,0.45)' }}
          >
            {helper}
          </p>
        )}
      </div>
    );
  },
);

InputGroup.displayName = 'InputGroup';

export default InputGroup;
