'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';
import { useAlfajorReviews } from '../hooks/useAlfajorReviews';
import { ReviewCard } from './ReviewCard';

export function AlfajorReviews({ alfajorId }: { alfajorId: string }) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAlfajorReviews(alfajorId);

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const isEmpty = !isLoading && !isError && items.length === 0;

  return (
    <section className="mt-12 border-t border-[rgba(74,30,8,0.14)] pt-8">
      <h2 className="text-ink mb-5 text-[22px] font-semibold tracking-[-0.02em]">
        Reseñas
      </h2>

      {isLoading && (
        <div
          data-testid="alfajor-reviews-loading"
          aria-hidden
          className="flex flex-col gap-4"
        >
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-paper-raised rounded-lg border border-[rgba(74,30,8,0.14)] p-6"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
              <Skeleton className="mt-4 h-3 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sienna text-[14px]">
          No pudimos cargar las reseñas. Probá recargar.
        </p>
      )}

      {isEmpty && (
        <p className="text-sienna text-[14px]">
          Todavía no hay reseñas. ¡Sé el primero en reseñar este alfajor!
        </p>
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-4">
          {items.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="pt-6 text-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-curry-deep disabled:opacity-50"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </section>
  );
}
