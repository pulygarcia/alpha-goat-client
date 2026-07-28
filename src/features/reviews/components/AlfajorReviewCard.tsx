'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { LikeButton } from './LikeButton';
import { ReviewDetailModal } from './ReviewDetailModal';
import type { ReviewCardAxes, ReviewCardVM } from '../lib/reviewCardVM';

const AXES: { key: keyof ReviewCardAxes; label: string; strong: boolean }[] = [
  { key: 'dulzor', label: 'Dulzor', strong: true },
  { key: 'cantidadDDL', label: 'DDL', strong: true },
  { key: 'calidadBano', label: 'Baño', strong: false },
  { key: 'ratioTapaRelleno', label: 'Tapa/rell.', strong: false },
  { key: 'textura', label: 'Textura', strong: false },
];

const FECHA = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function comentariosLabel(n: number) {
  if (n === 0) return 'Sin comentarios';
  return `${n} ${n === 1 ? 'comentario' : 'comentarios'}`;
}

/** Frena la propagación: like y link al perfil no abren el modal de la card. */
function StopClick({ children }: { children: React.ReactNode }) {
  return (
    <span onClick={(e) => e.stopPropagation()} className="contents">
      {children}
    </span>
  );
}

/**
 * Card de reseña de la página del alfajor. Es un componente aparte del
 * `ReviewCard` de feed/perfil: muestra los 5 ejes inline, mueve el puntaje y
 * vive en la paleta blanca de esta página. Clickearlo abre el modal completo.
 */
export function AlfajorReviewCard({ vm }: { vm: ReviewCardVM }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        aria-label={`Ver reseña de ${vm.author.username}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="flex cursor-pointer flex-col gap-4 py-[26px] outline-none"
        style={{ borderBottom: '1px solid var(--ap-hairline)' }}
      >
        <div className="flex items-center gap-3">
          <UserAvatar
            avatarUrl={vm.author.avatarUrl}
            username={vm.author.username}
            className="h-9 w-9 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <StopClick>
              <Link
                href={`/u/${vm.author.username}`}
                className="text-[14px] font-semibold hover:underline"
                style={{ color: 'var(--ap-ink)' }}
              >
                @{vm.author.username}
              </Link>
            </StopClick>
            <span
              className="text-[11px]"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--ap-faint-2)',
              }}
            >
              {FECHA.format(new Date(vm.createdAt))}
            </span>
          </div>
          <div
            data-testid="review-overall"
            className="ml-auto text-[28px]"
            style={{
              fontFamily: 'var(--font-archivo)',
              letterSpacing: '-0.04em',
              color: 'var(--ap-ink)',
            }}
          >
            {vm.overall.toFixed(1)}
          </div>
        </div>

        {vm.quote ? (
          <p
            className="text-[15px] leading-[1.6]"
            style={{ color: 'var(--ap-ink-2)', textWrap: 'pretty' }}
          >
            {vm.quote}
          </p>
        ) : (
          <div
            className="text-[11px] tracking-[0.1em] uppercase"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--ap-faint-2)',
            }}
          >
            Cató sin dejar comentario
          </div>
        )}

        <div className="grid grid-cols-5 gap-3">
          {AXES.map(({ key, label, strong }) => (
            <div key={key} className="flex flex-col gap-[6px]">
              <span
                className="text-[9px] tracking-[0.1em] uppercase"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ap-faint)',
                }}
              >
                {label}
              </span>
              <div
                className="h-[6px] rounded-[2px]"
                style={{ background: 'var(--ap-inert)' }}
              >
                <i
                  data-testid={`axis-fill-${key}`}
                  className="block h-full rounded-[2px]"
                  style={{
                    width: `${vm.axes[key] * 10}%`,
                    background: strong
                      ? 'var(--ap-accent)'
                      : 'var(--ap-accent-dark)',
                  }}
                />
              </div>
              <span
                className="text-[11px]"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ap-ink-2)',
                }}
              >
                {vm.axes[key].toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {vm.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vm.photoUrl}
            alt="Foto de la reseña"
            className="h-[200px] w-full rounded-[5px] object-cover"
          />
        )}

        <div
          className="flex items-center gap-[18px] text-[12px]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--ap-muted)' }}
        >
          <StopClick>
            <span
              className="inline-flex rounded-full px-[14px] py-[7px]"
              style={{ border: '1px solid var(--ap-border)' }}
            >
              <LikeButton
                reviewId={vm.id}
                likes={vm.likes}
                isLiked={vm.isLiked}
              />
            </span>
          </StopClick>
          <span style={{ color: 'var(--ap-faint-2)' }}>
            {comentariosLabel(vm.commentsCount)}
          </span>
        </div>
      </article>

      <ReviewDetailModal vm={vm} open={open} onOpenChange={setOpen} />
    </>
  );
}
