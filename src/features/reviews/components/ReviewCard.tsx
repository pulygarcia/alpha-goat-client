'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FollowButton } from '@/features/follows/components/FollowButton';
import { CommentIcon } from './CommentIcon';
import { LikeButton } from './LikeButton';
import { ReviewDetailModal } from './ReviewDetailModal';
import { UserAvatar } from '@/shared/components/UserAvatar';
import type { ReviewCardVM } from '../lib/reviewCardVM';

/** "hace X min/h/d" a partir de un ISO string, con una variante corta para mobile ("20d"). */
function timeAgo(iso: string): { full: string; compact: string } {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return { full: 'recién', compact: 'ahora' };
  if (min < 60) return { full: `hace ${min} min`, compact: `${min}m` };
  const h = Math.floor(min / 60);
  if (h < 24) return { full: `hace ${h} h`, compact: `${h}h` };
  const d = Math.floor(h / 24);
  return { full: `hace ${d} d`, compact: `${d}d` };
}

/** Frena la propagación: los controles propios (seguir, like, link al alfajor)
 * no deben disparar la apertura del modal de la card. */
function StopClick({ children }: { children: React.ReactNode }) {
  return (
    <span onClick={(e) => e.stopPropagation()} className="contents">
      {children}
    </span>
  );
}

/**
 * Card de reseña unificado (feed + detalle). El diseño es el del feed; con
 * `context='alfajor'` oculta el alfajor/marca (redundante: ya estamos en su
 * página). Clickear la card abre el modal con la reseña completa + comentarios.
 */
export function ReviewCard({
  vm,
  context,
}: {
  vm: ReviewCardVM;
  context: 'feed' | 'alfajor';
}) {
  const [open, setOpen] = useState(false);
  const { author, alfajor, marca, quote, photoUrl, overall, commentsCount } =
    vm;
  const showAlfajor = context === 'feed' && alfajor && marca;

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        aria-label={`Ver reseña de ${author.username}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="bg-blanco border-gris-50 hover:bg-gris-25 focus-visible:ring-gris-300 relative grid cursor-pointer grid-cols-[64px_1fr] items-start gap-4 rounded-2xl border p-4 transition-colors outline-none focus-visible:ring-2 md:grid-cols-[96px_1fr_64px] md:gap-6 md:p-5"
      >
        {/* Foto: solo en el feed (en el detalle es el mismo alfajor de la página).
            Prioridad: foto de la reseña → imagen del alfajor → placeholder de tipo. */}
        {context === 'feed' ? (
          photoUrl || alfajor?.imagenUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl ?? alfajor?.imagenUrl ?? ''}
              alt={alfajor?.nombre ?? ''}
              className="aspect-square w-full rounded-[10px] object-cover"
            />
          ) : (
            <div className="bg-gris-25 text-gris-300 flex aspect-square w-full items-center justify-center rounded-[10px] text-[0.55rem] tracking-[0.18em] uppercase">
              {alfajor?.tipo}
            </div>
          )
        ) : (
          <UserAvatar
            avatarUrl={author.avatarUrl}
            username={author.username}
            className="aspect-square w-full rounded-[10px] object-cover"
          />
        )}

        {/* Cuerpo */}
        <div className="min-w-0 pr-16 md:pr-0">
          <div className="mb-2 flex items-center gap-[10px]">
            <UserAvatar
              avatarUrl={author.avatarUrl}
              username={author.username}
              className="h-[26px] w-[26px] rounded-full object-cover"
            />
            <StopClick>
              <Link
                href={`/u/${author.username}`}
                className="text-ink hover:text-curry-deep text-[13px] font-semibold underline-offset-2 transition-colors hover:underline"
              >
                {author.username}
              </Link>
            </StopClick>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontWeight: 500,
                color: 'var(--color-gris-400)',
              }}
            >
              <span className="md:hidden">{timeAgo(vm.createdAt).compact}</span>
              <span className="hidden md:inline">
                {timeAgo(vm.createdAt).full}
              </span>
            </span>
            <StopClick>
              <FollowButton
                userId={author.id}
                isFollowing={author.isFollowing}
                username={author.username}
                avatarUrl={author.avatarUrl}
              />
            </StopClick>
          </div>

          {showAlfajor && (
            <div className="mb-2 flex items-start justify-between gap-3">
              <h5 className="text-ink text-[15px] font-medium tracking-[-0.018em] md:text-[15px]">
                {alfajor.nombre} ·{' '}
                <em
                  className="not-italic"
                  style={{ color: 'var(--color-cinnamon)' }}
                >
                  {marca.nombre}
                </em>
              </h5>
            </div>
          )}

          {quote && (
            <p
              className="mb-[10px] line-clamp-2 text-[13px] leading-[1.5] md:text-[13.5px]"
              style={{ color: 'var(--color-gris-400)' }}
            >
              “{quote}”
            </p>
          )}

          <div
            className="flex items-center gap-4"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: 'var(--color-gris-400)',
            }}
          >
            <StopClick>
              <LikeButton
                reviewId={vm.id}
                likes={vm.likes}
                isLiked={vm.isLiked}
              />
            </StopClick>
            <span className="inline-flex items-center gap-[5px]">
              <CommentIcon className="h-3 w-3" />
              {commentsCount} comentarios
            </span>
          </div>
        </div>

        {/* Rating general */}
        <div className="absolute top-4 right-4 hidden items-baseline gap-1 md:static md:top-auto md:right-auto md:col-start-3 md:flex md:justify-end md:text-right">
          <span
            className="text-[19px] md:text-[27px]"
            style={{
              fontFamily: 'var(--font-archivo)',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              color: 'var(--color-cinnamon)',
            }}
          >
            {overall.toFixed(1)}
          </span>
          <span
            className="text-gris-300"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.22em',
              fontWeight: 700,
            }}
          >
            /10
          </span>
        </div>
      </article>

      <ReviewDetailModal vm={vm} open={open} onOpenChange={setOpen} />
    </>
  );
}
