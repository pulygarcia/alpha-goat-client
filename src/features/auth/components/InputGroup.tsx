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
          className="text-ink text-[0.85rem] font-medium"
        >
          {label}
        </label>
        <div className="relative">
          <input
            id={fieldId}
            ref={ref}
            className={`auth-input bg-gris-25 text-ink h-12 w-full rounded-xl border px-4 text-[14px] font-medium transition-all duration-150 ${error ? 'border-error' : 'border-gris-100'} ${className ?? ''}`}
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Toggle"
              onClick={onRightIcon}
              className="text-gris-400 hover:text-ink absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              {rightIcon}
            </button>
          )}
        </div>
        {error && (
          <p className="text-error text-[0.72rem] leading-[1.3]">{error}</p>
        )}
        {!error && helper && (
          <p className="text-gris-400 text-[0.72rem] leading-[1.3]">{helper}</p>
        )}
      </div>
    );
  },
);

InputGroup.displayName = 'InputGroup';

export default InputGroup;
