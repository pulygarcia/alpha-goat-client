import { Skeleton } from '@/shared/components/ui/skeleton';

/** Placeholder del "goat del momento" mientras carga el hero. */
export function FeedHeroSkeleton() {
  return (
    <section
      data-testid="feed-hero-skeleton"
      className="border-b border-[rgba(74,30,8,0.14)] px-5 py-8 md:px-8 md:py-9"
    >
      <Skeleton className="h-3 w-40" />
      <div className="mt-3 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_360px] lg:gap-10">
        <div>
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <div className="mt-6 grid max-w-[520px] grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-7 w-12" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="h-[280px] w-full rounded-xl" />
      </div>
    </section>
  );
}
