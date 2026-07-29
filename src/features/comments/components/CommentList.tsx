'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { useReviewComments } from '../hooks/useReviewComments';
import { timeAgo } from '../lib/timeAgo';
import { CommentLikeButton } from './CommentLikeButton';

/**
 * Listado de comentarios de una reseña (público, paginado). Maneja los estados
 * loading / error / vacío y un "cargar más" para las páginas siguientes. Los
 * colores salen de las variables `--rd-*` que define el modal que lo monta.
 */
const STAGGER_STEP = 0.045; // s entre cada comentario
const STAGGER_MAX_DELAY = 0.32; // tope: tandas largas no esperan eternamente

function SkeletonRow({ width }: { width: string }) {
  return (
    <div className="flex gap-3 pb-4">
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[var(--color-gris-50)]" />
      <div className="flex flex-1 flex-col gap-[7px] pt-1">
        <div className="h-2.5 w-[90px] animate-pulse rounded-full bg-[var(--color-gris-50)]" />
        <div
          className="h-2.5 animate-pulse rounded-full bg-[var(--color-gris-25)]"
          style={{ width }}
        />
      </div>
    </div>
  );
}

export function CommentList({ reviewId }: { reviewId: string }) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviewComments(reviewId);
  const reduce = useReducedMotion();

  if (isLoading) {
    return (
      <div data-testid="comments-skeleton" className="py-4">
        <SkeletonRow width="100%" />
        <SkeletonRow width="80%" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-4 py-6 text-center">
        <p
          className="text-[15px] font-semibold"
          style={{ color: 'var(--rd-ink)' }}
        >
          No pudimos cargar los comentarios
        </p>
        <p
          className="mt-1.5 mb-3.5 text-[13px] leading-[1.5]"
          style={{ color: 'var(--rd-faint)' }}
        >
          Puede ser la conexión. Probá de nuevo.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="cursor-pointer rounded-full border px-[18px] py-2 text-[13px] transition-colors"
          style={{
            color: 'var(--rd-accent)',
            borderColor:
              'color-mix(in oklab, var(--color-cinnamon) 35%, transparent)',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (items.length === 0) {
    return (
      <div className="px-4 py-7 text-center">
        <p
          className="text-[15px] font-semibold"
          style={{ color: 'var(--rd-ink)' }}
        >
          Silencio total
        </p>
        <p
          className="mt-1.5 text-[13px] leading-[1.5]"
          style={{ color: 'var(--rd-faint)' }}
        >
          Todavía no hay comentarios. Sé el primero.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
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
            className="flex gap-3 border-b py-4"
            style={{ borderColor: 'var(--rd-hair-2)' }}
          >
            <UserAvatar
              avatarUrl={c.author?.avatarUrl ?? null}
              username={username}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                {c.author?.username ? (
                  <Link
                    href={`/u/${c.author.username}`}
                    className="text-[12.5px] font-semibold underline-offset-2 transition-colors hover:underline md:text-[13.5px]"
                    style={{ color: 'var(--rd-ink)' }}
                  >
                    {username}
                  </Link>
                ) : (
                  <span
                    className="text-[12.5px] font-semibold md:text-[13.5px]"
                    style={{ color: 'var(--rd-ink)' }}
                  >
                    {username}
                  </span>
                )}
                <span
                  className="text-[11px] md:text-[12px]"
                  style={{ color: 'var(--rd-faint)' }}
                >
                  {timeAgo(c.createdAt)}
                </span>
              </div>
              <p
                className="mt-1 text-[13.5px] leading-[1.55] md:text-[14.5px]"
                style={{ color: 'var(--rd-ink-2)' }}
              >
                {c.contenido}
              </p>
            </div>
            <div className="self-start pt-0.5">
              <CommentLikeButton
                commentId={c.id}
                likesCount={c.likesCount}
                isLiked={c.isLiked}
              />
            </div>
          </motion.li>
        );
      })}

      {hasNextPage && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="cursor-pointer rounded-full border px-5 py-2.5 text-[13px] transition-colors disabled:opacity-60"
            style={{
              color: 'var(--rd-muted)',
              borderColor: 'var(--color-gris-50)',
            }}
          >
            {isFetchingNextPage ? 'Cargando…' : 'Cargar más comentarios'}
          </button>
        </div>
      )}
    </ul>
  );
}
