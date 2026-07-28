import { cn } from '@/shared/lib/utils';

/**
 * Placeholder de carga: bloque con pulso. Decorativo (`aria-hidden`),
 * composable vía `className`. Reemplaza los bloques `animate-pulse` inline
 * repartidos por el rail.
 *
 * `gris-50` y no `gris-25`: el skeleton tiene que leerse sobre el blanco tibio
 * de la app, y `gris-25` es el mismo escalón que usan los campos de fondo.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn('bg-gris-50 animate-pulse rounded', className)}
      {...props}
    />
  );
}
