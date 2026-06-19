import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

/**
 * Indicador de progreso para flujos por pasos (wizard). Presentacional: recibe
 * los labels y el índice actual (0-based); no maneja navegación.
 */
export function Stepper({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn('flex items-center gap-2', className)}>
      {steps.map((label, i) => {
        const status =
          i < current ? 'done' : i === current ? 'current' : 'upcoming';
        const isLast = i === steps.length - 1;

        return (
          <li
            key={label}
            aria-current={status === 'current' ? 'step' : undefined}
            className={cn('flex items-center gap-2', !isLast && 'flex-1')}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums transition-colors',
                status === 'current' &&
                  'text-paper bg-gradient-to-br from-[#a86432] to-[#3a1808]',
                status === 'done' && 'bg-cinnamon/20 text-cinnamon',
                status === 'upcoming' &&
                  'bg-paper-sunken text-cinnamon/60 ring-1 ring-[rgba(74,30,8,0.18)] ring-inset',
              )}
            >
              {status === 'done' ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                i + 1
              )}
            </span>

            <span
              className={cn(
                'text-[12px] font-medium tracking-[-0.01em] whitespace-nowrap',
                status === 'current' ? 'text-ink' : 'text-sienna/70',
              )}
            >
              {label}
            </span>

            {!isLast && (
              <span
                aria-hidden
                className="ml-1 h-px flex-1 bg-[rgba(74,30,8,0.18)]"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
