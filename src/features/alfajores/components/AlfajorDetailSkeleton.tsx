import { Skeleton } from '@/shared/components/ui/skeleton';

/** Placeholder del detalle mientras carga. */
export function AlfajorDetailSkeleton() {
  return (
    <div
      data-testid="alfajor-detail-skeleton"
      className="grid gap-8 md:grid-cols-[minmax(0,420px)_1fr]"
    >
      <Skeleton className="aspect-square w-full rounded-[16px]" />
      <div className="flex flex-col gap-4 pt-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
}
