'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import Link from 'next/link';
import { X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { CommentIcon } from './CommentIcon';
import { LikeButton } from './LikeButton';
import { CommentList } from '@/features/comments/components/CommentList';
import { CommentForm } from '@/features/comments/components/CommentForm';
import { useAuth } from '@/shared/providers/AuthProvider';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { CountUp } from '@/shared/components/motion/CountUp';
import { timeAgo } from '@/features/comments/lib/timeAgo';
import { AXIS_KEYS, AXIS_LABELS } from '../lib/axes';
import type { ReviewCardVM } from '../lib/reviewCardVM';

interface ReviewDetailModalProps {
  vm: ReviewCardVM;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Paleta propia del modal (mockup ReviewDetail). Va con scope en el panel, no
 * como tokens globales, para no arrastrar el resto de la app.
 */
const PALETTE = {
  '--rd-panel': 'var(--color-blanco)',
  '--rd-ink': 'var(--color-ink)',
  '--rd-ink-2': 'var(--color-gris-600)',
  '--rd-muted': 'var(--color-gris-500)',
  '--rd-faint': 'var(--color-gris-400)',
  '--rd-faint-2': 'var(--color-gris-300)',
  '--rd-hair': 'var(--color-gris-25)',
  '--rd-hair-2': 'var(--color-gris-25)',
  '--rd-chip': 'var(--color-blanco-tibio)',
  '--rd-accent': 'var(--color-cinnamon)',
  '--rd-deep': 'var(--color-deep)',
} as React.CSSProperties;

function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Modal de reseña completa, en formato hoja anclada al pie: barra de contexto
 * fija arriba, cuerpo con scroll y el composer siempre a la vista abajo. Los 5
 * ejes van siempre desplegados como barras. Ver es público; comentar se gatea
 * dentro del form.
 */
export function ReviewDetailModal({
  vm,
  open,
  onOpenChange,
}: ReviewDetailModalProps) {
  const { user } = useAuth();
  const {
    author,
    alfajor,
    marca,
    overall,
    axes,
    quote,
    photoUrl,
    likes,
    commentsCount,
  } = vm;
  const reduce = useReducedMotion();

  const displayName = capitalize(author.username);
  // El eje más flojo se pinta en curry: es el dato que explica el puntaje.
  const weakest = AXIS_KEYS.reduce((a, b) => (axes[b] < axes[a] ? b : a));
  const toneOf = (key: (typeof AXIS_KEYS)[number]) =>
    key === weakest ? 'var(--rd-accent)' : 'var(--rd-ink)';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        style={{ ...PALETTE, background: 'var(--rd-panel)' }}
        className="top-auto bottom-0 left-1/2 flex h-[min(620px,92vh)] max-h-[92vh] w-[min(620px,100vw)] max-w-none translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[20px] rounded-b-none border-0 p-0 shadow-[0_50px_90px_-35px_rgba(28,25,22,0.45)] sm:rounded-b-none"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Reseña de {author.username}</DialogTitle>
          <DialogDescription>
            Reseña completa y su hilo de comentarios.
          </DialogDescription>
        </DialogHeader>

        {/* Barra de contexto: queda fija cuando el cuerpo scrollea */}
        <div
          className="flex flex-none items-center gap-2.5 border-b px-4 py-3 md:px-[22px]"
          style={{ borderColor: 'var(--rd-hair)' }}
        >
          <UserAvatar
            avatarUrl={author.avatarUrl}
            username={author.username}
            className="h-6 w-6 shrink-0 rounded-full object-cover"
          />
          <span
            className="truncate text-[11.5px] md:text-[12.5px]"
            style={{ color: 'var(--rd-muted)' }}
          >
            {alfajor ? (
              <>
                {displayName} sobre{' '}
                <Link
                  href={`/alfajores/${alfajor.id}`}
                  className="font-semibold underline-offset-2 hover:underline"
                  style={{ color: 'var(--rd-ink)' }}
                >
                  {alfajor.nombre}
                </Link>
              </>
            ) : (
              <>Reseña de {displayName}</>
            )}
          </span>
          <span
            className="ml-auto text-[14px] tabular-nums"
            style={{
              fontFamily: 'var(--font-archivo)',
              letterSpacing: '-0.03em',
              color: 'var(--rd-faint)',
            }}
          >
            {overall.toFixed(1)}
          </span>
          <DialogClose
            aria-label="Cerrar"
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[var(--rd-chip)] hover:text-[var(--rd-ink)]"
            style={{ color: 'var(--rd-faint)' }}
          >
            <X className="h-[15px] w-[15px]" />
          </DialogClose>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="paper-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-8 md:px-14 md:pt-8"
        >
          {/* Autor + puntaje general */}
          <div className="flex items-center gap-3.5">
            <Link
              href={`/u/${author.username}`}
              aria-label={`Perfil de ${author.username}`}
              className="transition-opacity hover:opacity-80"
            >
              <UserAvatar
                avatarUrl={author.avatarUrl}
                username={author.username}
                className="h-11 w-11 shrink-0 rounded-full object-cover md:h-[52px] md:w-[52px]"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/u/${author.username}`}
                className="block text-[15px] font-semibold tracking-[-0.02em] underline-offset-2 hover:underline md:text-[19px]"
                style={{ color: 'var(--rd-ink)' }}
              >
                {displayName}
              </Link>
              <div
                className="mt-0.5 flex items-baseline gap-[7px] text-[11.5px] md:text-[12.5px]"
                style={{ color: 'var(--rd-faint)' }}
              >
                <Link
                  href={`/u/${author.username}`}
                  className="underline-offset-2 hover:underline"
                >
                  @{author.username}
                </Link>
                <span style={{ color: 'var(--rd-faint-2)' }}>·</span>
                <span>{timeAgo(vm.createdAt)}</span>
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-[26px] tabular-nums md:text-[38px]"
                style={{
                  fontFamily: 'var(--font-archivo)',
                  lineHeight: 1,
                  letterSpacing: '-0.05em',
                  color: 'var(--rd-ink)',
                }}
              >
                <CountUp value={overall} decimals={1} durationMs={900} />
              </div>
              <div
                className="text-[10px] tracking-[0.06em] md:text-[11px]"
                style={{ color: 'var(--rd-faint)' }}
              >
                sobre 10
              </div>
            </div>
          </div>

          {/* Alfajor reseñado: solo cuando viene anidado (perfil/feed); en el
              detalle del alfajor no se anida (sería redundante). */}
          {alfajor && (
            <Link
              href={`/alfajores/${alfajor.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full py-1.5 pr-3 pl-1.5 no-underline"
              style={{ background: 'var(--rd-chip)' }}
            >
              <span className="bg-gris-100 block h-6 w-6 shrink-0 overflow-hidden rounded-full">
                {alfajor.imagenUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={alfajor.imagenUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </span>
              <span
                className="text-[11.5px] md:text-[12.5px]"
                style={{ color: 'var(--rd-ink-2)' }}
              >
                {alfajor.nombre}
                {marca && (
                  <>
                    {' · '}
                    <b className="font-semibold">{marca.nombre}</b>
                  </>
                )}
              </span>
            </Link>
          )}

          {quote && (
            <p
              className="mt-5 text-[16px] leading-[1.5] font-light tracking-[-0.015em] md:text-[23px]"
              style={{ color: 'var(--rd-ink)', textWrap: 'pretty' }}
            >
              {quote}
            </p>
          )}

          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt="Foto de la reseña"
              className="mt-5 h-[170px] w-full rounded-[14px] object-cover md:h-[230px]"
            />
          )}

          {/* Los 5 ejes, siempre a la vista: son el diferencial del producto */}
          <dl
            data-testid="axes-breakdown"
            className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-6 gap-y-2.5 border-y py-4"
            style={{ borderColor: 'var(--rd-hair)' }}
          >
            {AXIS_KEYS.map((key, i) => (
              <div key={key} className="flex items-center gap-2.5">
                <dt
                  className="flex-1 text-[11.5px] md:text-[12.5px]"
                  style={{ color: 'var(--rd-muted)' }}
                >
                  {AXIS_LABELS[key]}
                </dt>
                <span
                  className="h-1 w-[110px] overflow-hidden rounded-full"
                  style={{ background: 'var(--rd-hair)' }}
                >
                  <motion.span
                    className="block h-full rounded-full"
                    style={{
                      backgroundColor:
                        key === weakest ? 'var(--rd-accent)' : 'var(--rd-deep)',
                    }}
                    initial={reduce ? false : { width: 0 }}
                    animate={{ width: `${(axes[key] / 10) * 100}%` }}
                    transition={{
                      duration: 0.7,
                      delay: reduce ? 0 : i * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </span>
                <dd
                  className="w-[26px] text-right text-[11.5px] font-semibold tabular-nums md:text-[12.5px]"
                  style={{ color: toneOf(key) }}
                  data-testid={`axis-value-${key}`}
                >
                  {axes[key].toFixed(1)}
                </dd>
              </div>
            ))}
          </dl>

          {/* Contadores de la reseña — el like es accionable (toggle) */}
          <div
            className="mt-4 flex items-center gap-5 text-[13px] md:text-[14px]"
            style={{ color: 'var(--rd-faint)' }}
          >
            <LikeButton reviewId={vm.id} likes={likes} isLiked={vm.isLiked} />
            <span
              className="inline-flex items-center gap-1.5"
              aria-label={`${commentsCount} comentarios`}
            >
              <CommentIcon className="h-[15px] w-[15px]" />
              {commentsCount}
            </span>
          </div>

          <div className="mt-9 flex items-center gap-3.5">
            <div
              className="h-px flex-1"
              style={{ background: 'var(--color-gris-50)' }}
              aria-hidden
            />
            <span
              className="text-[10px] tracking-[0.28em] uppercase"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--rd-faint-2)',
              }}
            >
              Comentarios
            </span>
            <div
              className="h-px flex-1"
              style={{ background: 'var(--color-gris-50)' }}
              aria-hidden
            />
          </div>

          <div className="mt-3">
            <CommentList reviewId={vm.id} />
          </div>
        </motion.div>

        {/* Composer: fijo al pie, siempre a la vista */}
        <div
          className="flex flex-none items-start gap-2.5 border-t px-3.5 py-3 md:px-[22px]"
          style={{ borderColor: 'var(--rd-hair)' }}
        >
          <UserAvatar
            avatarUrl={user?.avatarUrl ?? null}
            username={user?.username ?? ''}
            className="mt-1 h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <CommentForm reviewId={vm.id} replyingTo={author.username} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
