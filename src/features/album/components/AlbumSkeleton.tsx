import { Skeleton } from '@/shared/components/ui/skeleton';

/** Placeholder mientras carga el álbum: header + una hoja de ejemplo. */
export function AlbumSkeleton() {
  return (
    <div data-testid="album-skeleton" aria-hidden className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-2 h-10 w-56" />
        <Skeleton className="mt-3.5 h-2.5 w-full rounded-full" />
      </div>
      <div className="flex gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-[420px] w-full rounded-3xl" />
    </div>
  );
}
