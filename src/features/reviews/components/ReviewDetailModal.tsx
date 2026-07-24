'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import Link from 'next/link';
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

function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function Avatar({ url, name }: { url: string | null; name: string | null }) {
  return (
    <UserAvatar
      avatarUrl={url}
      username={name ?? ''}
      className="h-7 w-7 shrink-0 rounded-full object-cover"
    />
  );
}

/**
 * Modal de reseña completa: misma estética de hilo que el modal de comentarios
 * (carril con avatar del autor → línea → avatar del usuario actual), pero el
 * encabezado muestra la reseña entera — puntaje general + los 5 ejes en lista
 * (sin radar) + el comentario — y debajo va el hilo de comentarios. Ver es
 * público; comentar se gatea dentro del form.
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="bg-paper-raised text-ink flex max-h-[85vh] max-w-lg flex-col border-[rgba(74,30,8,0.22)] md:max-w-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Reseña de {author.username}</DialogTitle>
          <DialogDescription>
            Reseña completa y su hilo de comentarios.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="paper-scrollbar flex min-h-0 flex-1 gap-3 overflow-y-auto pr-4"
        >
          {/* Carril del hilo: avatar reseña ─ línea ─ avatar usuario */}
          <div className="flex flex-col items-center">
            <Link
              href={`/u/${author.username}`}
              aria-label={`Perfil de ${author.username}`}
              className="transition-opacity hover:opacity-80"
            >
              <Avatar url={author.avatarUrl} name={author.username} />
            </Link>
            <div className="my-1.5 w-px flex-1 bg-[rgba(74,30,8,0.18)]" />
            <Avatar
              url={user?.avatarUrl ?? null}
              name={user?.username ?? null}
            />
          </div>

          {/* Columna de contenido */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div>
              <p className="text-[14px]">
                <Link
                  href={`/u/${author.username}`}
                  className="text-ink font-semibold underline-offset-2 transition-colors hover:underline"
                >
                  {capitalize(author.username)}
                </Link>{' '}
                <span className="text-cinnamon font-normal">
                  @{author.username} · {timeAgo(vm.createdAt)}
                </span>
              </p>

              {/* Alfajor reseñado: solo cuando viene anidado (perfil/feed); en el
                  detalle del alfajor no se anida (sería redundante). */}
              {alfajor && (
                <p className="mt-1 text-[14px]">
                  <span className="text-cinnamon">reseñó </span>
                  <Link
                    href={`/alfajores/${alfajor.id}`}
                    className="text-ink hover:text-curry-deep font-semibold underline-offset-2 transition-colors hover:underline"
                  >
                    {alfajor.nombre}
                  </Link>
                  {marca && (
                    <span className="text-cinnamon"> · {marca.nombre}</span>
                  )}
                </p>
              )}

              {/* Puntaje general */}
              <div className="mt-3 flex items-baseline gap-2">
                <span
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: 32,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    color: '#b3702a',
                  }}
                >
                  <CountUp value={overall} decimals={1} durationMs={900} />
                </span>
                <span
                  className="text-cinnamon"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  /10 · Puntaje general
                </span>
              </div>

              {/* Los 5 ejes en 2 columnas, mini-card con barra fina debajo,
                  el número cuenta y la barra crece al abrir el modal. */}
              <dl className="mt-4 grid grid-cols-2 gap-2.5">
                {AXIS_KEYS.map((key, i) => (
                  <div key={key} className="px-1 py-1">
                    <div className="flex items-baseline justify-between">
                      <dt className="text-sienna text-[11.5px]">
                        {AXIS_LABELS[key]}
                      </dt>
                      <dd
                        className="text-[13px] font-semibold tabular-nums"
                        style={{ color: '#b3702a' }}
                      >
                        <CountUp value={axes[key]} decimals={1} />
                      </dd>
                    </div>
                    <div className="bg-paper-emph/40 relative mt-1.5 h-[3px] overflow-hidden rounded-full">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ backgroundColor: '#b3702a' }}
                        initial={reduce ? false : { width: 0 }}
                        animate={{ width: `${(axes[key] / 10) * 100}%` }}
                        transition={{
                          duration: 0.7,
                          delay: reduce ? 0 : i * 0.06,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </dl>

              {quote && (
                <blockquote className="border-curry-deep/50 bg-paper-sunken/60 text-ink mt-4 rounded-r-[8px] border-l-[3px] py-2.5 pr-3 pl-3.5 text-[15px] leading-[1.6] font-medium">
                  “{quote}”
                </blockquote>
              )}

              {photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Foto de la reseña"
                  className="mt-4 max-h-72 w-full rounded-[10px] object-cover"
                />
              )}

              {/* Contadores de la reseña — el like es accionable (toggle) */}
              <div
                className="mt-4 flex items-center gap-4 text-[13px] font-semibold"
                style={{ color: '#6f5c42' }}
              >
                <LikeButton
                  reviewId={vm.id}
                  likes={likes}
                  isLiked={vm.isLiked}
                />
                <span
                  className="inline-flex items-center gap-1.5"
                  aria-label={`${commentsCount} comentarios`}
                >
                  <CommentIcon className="h-[15px] w-[15px]" />
                  {commentsCount}
                </span>
              </div>
            </div>

            <div className="border-t border-[rgba(74,30,8,0.14)] pt-4">
              <CommentList reviewId={vm.id} />
            </div>

            <CommentForm reviewId={vm.id} replyingTo={author.username} />
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
