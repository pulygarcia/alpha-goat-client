import { cn } from '@/shared/lib/utils';

/**
 * Placeholder de carga: bloque con pulso sobre el papel hundido. Decorativo
 * (`aria-hidden`), composable vía `className`. Reemplaza los bloques
 * `bg-paper-sunken animate-pulse` inline repartidos por el rail.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn('bg-paper-sunken animate-pulse rounded', className)}
      {...props}
    />
  );
}
