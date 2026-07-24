'use client';

import { useState } from 'react';
import { useFeedReviews } from '../hooks/useFeedReviews';
import { useFeedFilters } from '../store/feedFilters.store';
import type { FeedScope, FeedSort } from '../types/feed.types';
import { FeedReviewsSkeleton } from './FeedReviewsSkeleton';
import { ReviewCard } from '@/features/reviews/components/ReviewCard';
import { feedItemToVM } from '@/features/reviews/lib/reviewCardVM';
import { StaggerItem } from '@/shared/components/motion/StaggerItem';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

const SORTS: Array<{ value: FeedSort; label: string }> = [
  { value: 'likes', label: 'Más likes' },
  { value: 'recent', label: 'Recientes' },
  { value: 'rating', label: 'Mejor puntuadas' },
];

const TITLES: Record<FeedScope, string> = {
  today: 'Reseñas de hoy',
  week: 'Reseñas de esta semana',
  following: 'Reseñas de gente que seguís',
  province: 'Reseñas destacadas',
};

function titleFor(scope: FeedScope | null): string {
  return scope === null ? 'Reseñas destacadas' : TITLES[scope];
}

export function FeedReviews() {
  const [sort, setSort] = useState<FeedSort>('recent');
  const scope = useFeedFilters((s) => s.scope);
  const clearScope = useFeedFilters((s) => s.clearScope);
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedReviews({ sort, scope: scope ?? undefined });

  const pages = data?.pages ?? [];
  const isEmpty =
    !isLoading && !isError && pages.every((p) => p.items.length === 0);

  return (
    <section className="px-5 py-8 md:px-8 md:py-9">
      <div className="mb-5 flex flex-col gap-[14px]">
        <h4 className="text-ink text-[24px] font-semibold tracking-[-0.02em]">
          {titleFor(scope)}
        </h4>
        <Tabs value={sort} onValueChange={(v) => setSort(v as FeedSort)}>
          <TabsList
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            {SORTS.map((s) => (
              <TabsTrigger key={s.value} value={s.value}>
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading && <FeedReviewsSkeleton />}

      {isError && (
        <p className="text-sienna">
          No pudimos contactar al servidor. Probá recargar.
        </p>
      )}

      {isEmpty && scope === 'following' && (
        <div className="py-8">
          <p className="text-ink text-[17px] font-semibold">
            Tu feed de seguidos está vacío
          </p>
          <p className="text-sienna mt-2 max-w-[420px] text-[14px] leading-relaxed">
            Todavía no seguís a nadie. Explorá el feed general y seguí a quienes
            reseñan los alfajores que te interesan.
          </p>
          <button
            type="button"
            onClick={clearScope}
            className="text-curry-deep mt-4"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Explorá el feed general
          </button>
        </div>
      )}

      {isEmpty && scope !== 'following' && (
        <p className="text-sienna">Todavía no hay reseñas para mostrar.</p>
      )}

      <div className="flex flex-col gap-4">
        {pages.map((page) =>
          page.items.map((item, i) => (
            <StaggerItem key={item.id} index={i}>
              <ReviewCard vm={feedItemToVM(item)} context="feed" />
            </StaggerItem>
          )),
        )}
      </div>

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
