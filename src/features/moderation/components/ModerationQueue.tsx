'use client';

import { useState } from 'react';
import { useModerationQueue } from '../hooks/useModerationQueue';
import { PendingAlfajorCard } from './PendingAlfajorCard';

/** Cola de moderación: lista paginada de alfajores PENDING. */
export function ModerationQueue() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useModerationQueue(page);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p
        className="text-curry-deep text-[11px] font-bold tracking-[0.22em] uppercase"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Moderación
      </p>
      <h1 className="text-ink mt-1 text-[26px] leading-tight font-semibold tracking-[-0.02em]">
        Alfajores pendientes
      </h1>

      {isLoading && (
        <div className="mt-6 space-y-4" data-testid="moderation-skeleton">
          <div className="bg-gris-25 h-24 animate-pulse rounded-[14px]" />
          <div className="bg-gris-25 h-24 animate-pulse rounded-[14px]" />
          <div className="bg-gris-25 h-24 animate-pulse rounded-[14px]" />
        </div>
      )}

      {isError && (
        <div className="mt-6">
          <p className="text-gris-400 text-[14px]">
            No pudimos cargar la cola de moderación.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-curry-deep mt-2 text-[14px] font-semibold underline underline-offset-2"
          >
            Reintentar
          </button>
        </div>
      )}

      {data && data.items.length === 0 && (
        <p className="text-gris-400 mt-6 text-[14px]">
          No hay alfajores pendientes de moderación.
        </p>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="mt-6 space-y-4">
            {data.items.map((alfajor) => (
              <PendingAlfajorCard key={alfajor.id} alfajor={alfajor} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-gris-400 hover:text-ink text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Anterior
              </button>
              <span className="text-gris-400 text-[13px]">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-gris-400 hover:text-ink text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente →
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
