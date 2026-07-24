import { Skeleton } from '@/shared/components/ui/skeleton';

/** Placeholder de la lista de barritas del catálogo mientras carga. */
export function AlfajorRowsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div data-testid="alfajores-rows-skeleton" className="flex flex-col gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          <Skeleton className="h-11 w-11 flex-none rounded-[9px]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
