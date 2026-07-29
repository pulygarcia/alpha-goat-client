import { Skeleton } from '@/shared/components/ui/skeleton';

// El fondo por defecto del Skeleton sale de los tokens crema; esta página vive
// en la paleta blanca del rediseño, así que se pisa acá.
const TONE = { background: 'var(--color-gris-25)' };

/** Placeholder del detalle mientras carga, con la forma de dos columnas. */
export function AlfajorDetailSkeleton() {
  return (
    <div
      data-testid="alfajor-detail-skeleton"
      className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[400px_1fr] lg:gap-14"
    >
      <div className="flex flex-col gap-[22px]">
        <Skeleton
          className="aspect-[433/500] w-full max-w-[340px] rounded-[6px]"
          style={TONE}
        />
        <Skeleton className="h-9 w-3/4" style={TONE} />
        <Skeleton className="h-[76px] w-40" style={TONE} />
        <div className="flex flex-col gap-[10px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[10px] rounded-[2px]" style={TONE} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[26px]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="h-9 w-9 rounded-full" style={TONE} />
            <Skeleton className="h-[13px] rounded-[2px]" style={TONE} />
            <Skeleton className="h-[13px] w-[70%] rounded-[2px]" style={TONE} />
          </div>
        ))}
      </div>
    </div>
  );
}
