'use client';

import { useState } from 'react';
import { useFeedReviews } from '../hooks/useFeedReviews';
import { useFeedFilters } from '../store/feedFilters.store';
import type { FeedSort } from '../types/feed.types';
import { ReviewRow } from './ReviewRow';

const SORTS: Array<{ value: FeedSort; label: string }> = [
  { value: 'likes', label: 'Más likes' },
  { value: 'recent', label: 'Recientes' },
  { value: 'rating', label: 'Mejor puntuadas' },
];

export function FeedReviews() {
  const [sort, setSort] = useState<FeedSort>('recent');
  const scope = useFeedFilters((s) => s.scope);
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedReviews({ sort, scope: scope ?? undefined });

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <section className="px-8 py-9">
      <div className="mb-5 flex flex-col gap-[14px] border-b border-[rgba(74,30,8,0.14)] pb-4">
        <h4 className="text-ink text-[24px] font-semibold tracking-[-0.02em]">
          Reseñas destacadas
        </h4>
        <div
          className="flex gap-[6px]"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSort(s.value)}
              className={
                sort === s.value
                  ? 'bg-paper-sunken text-ink rounded-[6px] px-3 py-[7px] font-bold'
                  : 'text-sienna hover:bg-paper-sunken hover:text-ink rounded-[6px] px-3 py-[7px] font-medium'
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-sienna">Cargando reseñas...</p>}

      {isError && (
        <p className="text-sienna">
          No pudimos contactar al servidor. Probá recargar.
        </p>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <p className="text-sienna">Todavía no hay reseñas para mostrar.</p>
      )}

      {items.map((item) => (
        <ReviewRow key={item.id} item={item} />
      ))}

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
