import { Skeleton } from '@/shared/components/ui/skeleton';

/** Placeholder de la lista de reseñas mientras carga el feed. */
export function FeedReviewsSkeleton() {
  return (
    <div data-testid="feed-reviews-skeleton" className="flex flex-col gap-6">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex gap-4 border-b border-[rgba(74,30,8,0.14)] pb-6"
        >
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-3 h-5 w-2/3" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
          </div>
          <Skeleton className="hidden h-[120px] w-[120px] shrink-0 md:block" />
        </div>
      ))}
    </div>
  );
}
