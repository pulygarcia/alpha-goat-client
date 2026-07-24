import { Skeleton } from '@/shared/components/ui/skeleton';

/** Placeholder del detalle mientras carga. */
export function AlfajorDetailSkeleton() {
  return (
    <div
      data-testid="alfajor-detail-skeleton"
      className="flex flex-col items-center gap-6 md:grid md:grid-cols-[minmax(0,420px)_1fr] md:items-start md:gap-8"
    >
      <Skeleton className="mx-auto aspect-square w-full max-w-[220px] rounded-[16px] md:mx-0 md:max-w-none" />
      <div className="flex w-full flex-col items-center gap-4 md:items-start md:pt-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-2/3 md:h-10" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
}
