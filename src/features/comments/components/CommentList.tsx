'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { useReviewComments } from '../hooks/useReviewComments';
import { timeAgo } from '../lib/timeAgo';
import { CommentLikeButton } from './CommentLikeButton';

/**
 * Listado de comentarios de una reseña (público, paginado). Maneja los estados
 * loading / error / vacío y un "cargar más" para las páginas siguientes.
 */
const STAGGER_STEP = 0.045; // s entre cada comentario
const STAGGER_MAX_DELAY = 0.32; // tope: tandas largas no esperan eternamente

export function CommentList({ reviewId }: { reviewId: string }) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviewComments(reviewId);
  const reduce = useReducedMotion();

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
      <p className="text-ink/55 text-[14px]">
        Todavía no hay comentarios. Sé el primero.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((c, i) => {
        const username = c.author?.username ?? 'Usuario';
        return (
          <motion.li
            key={c.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.32,
              delay: Math.min(i * STAGGER_STEP, STAGGER_MAX_DELAY),
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-center gap-[10px]"
          >
            <UserAvatar
              avatarUrl={c.author?.avatarUrl ?? null}
              username={username}
              className="h-[26px] w-[26px] shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              {c.author?.username ? (
                <Link
                  href={`/u/${c.author.username}`}
                  className="text-ink hover:text-curry-deep text-[13px] font-semibold underline-offset-2 transition-colors hover:underline"
                >
                  {username}
                </Link>
              ) : (
                <span className="text-ink text-[13px] font-semibold">
                  {username}
                </span>
              )}
              <span className="text-cinnamon ml-1.5 text-[0.72rem]">
                · {timeAgo(c.createdAt)}
              </span>
              <p className="text-sienna text-[14px] leading-[1.5]">
                {c.contenido}
              </p>
            </div>
            <CommentLikeButton
              commentId={c.id}
              likesCount={c.likesCount}
              isLiked={c.isLiked}
            />
          </motion.li>
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
