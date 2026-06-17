import { Skeleton } from '@/shared/components/ui/skeleton';

/** Placeholder del grid del catálogo mientras carga. */
export function AlfajoresGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      data-testid="alfajores-grid-skeleton"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-paper-raised overflow-hidden rounded-[14px] border border-[rgba(74,30,8,0.14)]"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
