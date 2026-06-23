'use client';

import Link from 'next/link';
import { useGlobalRanking } from '../hooks/useGlobalRanking';
import type { RankingItem } from '../types/ranking.types';

function RankRow({ item, pos }: { item: RankingItem; pos: number }) {
  return (
    <Link
      href={`/alfajores/${item.id}`}
      className="grid grid-cols-[44px_1fr_auto] items-center gap-4 border-b border-dashed border-[rgba(74,30,8,0.22)] py-4 transition-colors hover:bg-[rgba(74,30,8,0.04)]"
    >
      <div
        className={pos <= 3 ? 'text-curry-deep' : 'text-sienna'}
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: 28,
          letterSpacing: '-0.04em',
        }}
      >
        {String(pos).padStart(2, '0')}
      </div>

      <div className="min-w-0">
        <div className="text-ink truncate text-[16px] font-medium">
          {item.nombre}
        </div>
        <div
          className="text-sienna mt-[3px]"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          {item.marca.nombre}
        </div>
      </div>

      <div className="text-right">
        <div
          className="text-curry-deep text-[18px] font-bold"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {item.score.toFixed(1)}
        </div>
        <div className="text-sienna mt-[2px] text-[11px]">
          {item.reviewsCount} reseñas
        </div>
      </div>
    </Link>
  );
}

function RankingSkeleton() {
  return (
    <div data-testid="ranking-skeleton" aria-hidden className="animate-pulse">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[44px_1fr_auto] items-center gap-4 py-4"
        >
          <div className="bg-paper-sunken h-7 w-9 rounded" />
          <div>
            <div className="bg-paper-sunken h-4 w-40 rounded" />
            <div className="bg-paper-sunken mt-2 h-2 w-20 rounded" />
          </div>
          <div className="bg-paper-sunken h-5 w-10 rounded" />
        </div>
      ))}
    </div>
  );
}

export function RankingList() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGlobalRanking();

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const isEmpty = !isLoading && !isError && items.length === 0;

  return (
    <main className="mx-auto max-w-[760px] px-5 py-10 md:px-8">
      <header className="mb-8">
        <p
          className="text-curry-deep"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          El índice nacional
        </p>
        <h1 className="text-ink mt-1 text-[40px] leading-none tracking-[-0.03em] md:text-[52px]">
          Ranking
        </h1>
        <p className="text-sienna mt-3 max-w-[44ch] text-[14px] leading-relaxed">
          Los alfajores mejor puntuados de todos los tiempos, por promedio de
          reseñas. Entran a partir de 5 reseñas.
        </p>
      </header>

      {isLoading && <RankingSkeleton />}

      {isError && (
        <p className="text-sienna text-[14px]">
          No pudimos cargar el ranking. Probá recargar.
        </p>
      )}

      {isEmpty && (
        <p className="text-sienna text-[14px]">
          Todavía no hay alfajores con suficientes reseñas para armar el
          ranking.
        </p>
      )}

      {items.length > 0 && (
        <div>
          {items.map((item, i) => (
            <RankRow key={item.id} item={item} pos={i + 1} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="pt-8 text-center">
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
    </main>
  );
}
