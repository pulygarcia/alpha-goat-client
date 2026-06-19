'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FollowButton } from '@/features/follows/components/FollowButton';
import { LikeButton } from './LikeButton';
import { ReviewDetailModal } from './ReviewDetailModal';
import type { ReviewCardVM } from '../lib/reviewCardVM';

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

/** "hace X min/h/d" a partir de un ISO string. */
function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
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
        className="grid cursor-pointer grid-cols-[64px_1fr] items-start gap-4 border-b border-[rgba(74,30,8,0.14)] py-[22px] outline-none last:border-b-0 focus-visible:rounded-[10px] focus-visible:ring-2 focus-visible:ring-[rgba(74,30,8,0.35)] md:grid-cols-[96px_1fr_64px] md:gap-6"
      >
        {/* Foto: solo en el feed (en el detalle es el mismo alfajor de la página) */}
        {context === 'feed' ? (
          photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={alfajor?.nombre ?? ''}
              className="aspect-square w-full rounded-[10px] object-cover"
            />
          ) : (
            <div className="bg-paper-sunken text-cinnamon flex aspect-square w-full items-center justify-center rounded-[10px] text-[0.55rem] tracking-[0.18em] uppercase">
              {alfajor?.tipo}
            </div>
          )
        ) : (
          <div
            className="text-paper flex aspect-square w-full items-center justify-center rounded-[10px] text-[15px] font-bold"
            style={{
              background:
                'linear-gradient(135deg, var(--color-curry), var(--color-curry-bright))',
            }}
          >
            {initials(author.username)}
          </div>
        )}

        {/* Cuerpo */}
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-[10px]">
            {author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={author.avatarUrl}
                alt={author.username}
                className="h-[26px] w-[26px] rounded-full object-cover"
              />
            ) : (
              <div
                className="text-paper flex h-[26px] w-[26px] items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-curry), var(--color-curry-bright))',
                }}
              >
                {initials(author.username)}
              </div>
            )}
            <span className="text-ink text-[13px] font-semibold">
              {author.username}
            </span>
            <span
              className="text-cinnamon"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              {timeAgo(vm.createdAt)}
            </span>
            <StopClick>
              <FollowButton
                userId={author.id}
                isFollowing={author.isFollowing}
              />
            </StopClick>
          </div>

          {showAlfajor && (
            <div className="mb-2 flex items-start justify-between gap-3">
              <h5 className="text-ink text-[18px] font-medium tracking-[-0.018em]">
                <StopClick>
                  <Link
                    href={`/alfajores/${alfajor.id}`}
                    className="hover:text-curry-deep underline-offset-2 transition-colors hover:underline"
                  >
                    {alfajor.nombre}
                  </Link>
                </StopClick>{' '}
                · <em className="text-cinnamon not-italic">{marca.nombre}</em>
              </h5>
            </div>
          )}

          {quote && (
            <p className="text-sienna mb-[10px] text-[14px] leading-[1.5]">
              “{quote}”
            </p>
          )}

          <div
            className="text-cinnamon flex items-center gap-4"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 700,
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
              ↳ {commentsCount} comentarios
            </span>
          </div>
        </div>

        {/* Rating general */}
        <div className="col-start-2 text-left md:col-start-3 md:text-right">
          <span
            className="text-curry-deep"
            style={{
              fontFamily: 'var(--font-archivo)',
              fontSize: 40,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            {overall.toFixed(1)}
          </span>
          <span
            className="text-cinnamon block"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.22em',
              fontWeight: 700,
              marginTop: 2,
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
