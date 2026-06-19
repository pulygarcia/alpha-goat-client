'use client';

import { useReviewComments } from '../hooks/useReviewComments';
import { timeAgo } from '../lib/timeAgo';

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

/**
 * Listado de comentarios de una reseña (público, paginado). Maneja los estados
 * loading / error / vacío y un "cargar más" para las páginas siguientes.
 */
export function CommentList({ reviewId }: { reviewId: string }) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviewComments(reviewId);

  if (isLoading) {
    return (
      <div data-testid="comments-skeleton" className="flex flex-col gap-3">
        <div className="bg-paper-sunken h-12 w-full animate-pulse rounded-[10px]" />
        <div className="bg-paper-sunken h-12 w-full animate-pulse rounded-[10px]" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-cinnamon text-[14px]">
        No pudimos cargar los comentarios.
      </p>
    );
  }

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (items.length === 0) {
    return (
      <p className="text-cinnamon text-[14px]">
        Todavía no hay comentarios. Sé el primero.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((c) => {
        const username = c.author?.username ?? 'Usuario';
        return (
          <li key={c.id} className="flex items-center gap-[10px]">
            {c.author?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.author.avatarUrl}
                alt={username}
                className="h-[26px] w-[26px] shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                className="text-paper flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-curry), var(--color-curry-bright))',
                }}
              >
                {initials(username)}
              </div>
            )}
            <div>
              <span className="text-ink text-[13px] font-semibold">
                {username}
              </span>
              <span className="text-cinnamon ml-1.5 text-[0.72rem]">
                · {timeAgo(c.createdAt)}
              </span>
              <p className="text-sienna text-[14px] leading-[1.5]">
                {c.contenido}
              </p>
            </div>
          </li>
        );
      })}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-cinnamon hover:text-curry-deep self-start text-[0.7rem] font-bold tracking-[0.16em] uppercase transition-colors disabled:opacity-60"
        >
          {isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
        </button>
      )}
    </ul>
  );
}
