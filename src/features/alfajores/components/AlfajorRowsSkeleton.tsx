import { Skeleton } from '@/shared/components/ui/skeleton';

/** Placeholder de la lista de barritas del catálogo mientras carga. */
export function AlfajorRowsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div data-testid="alfajores-rows-skeleton" className="flex flex-col gap-1">
      {Array.from({ length: count }).map((_, i) => (
        // -mx-2 px-2 espeja el padding de la row real: el skeleton ocupa el
        // mismo ancho y el contenido no salta al reemplazarse.
        <div key={i} className="-mx-2 flex items-center gap-3 px-2 py-2.5">
          <Skeleton className="h-11 w-11 flex-none rounded-[9px]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <div className="flex flex-none flex-col items-end gap-1.5">
            <Skeleton className="h-[17px] w-7" />
            <Skeleton className="h-[3px] w-11 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
