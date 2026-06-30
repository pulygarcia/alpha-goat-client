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
import { MessageCircle } from 'lucide-react';
import { LikeButton } from './LikeButton';
import { CommentList } from '@/features/comments/components/CommentList';
import { CommentForm } from '@/features/comments/components/CommentForm';
import { useAuth } from '@/shared/providers/AuthProvider';
import { UserAvatar } from '@/shared/components/UserAvatar';
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
      <DialogContent className="bg-paper-raised text-ink flex max-h-[85vh] max-w-lg flex-col border-[rgba(74,30,8,0.22)]">
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
          className="flex min-h-0 flex-1 gap-3 overflow-y-auto pr-1"
        >
          {/* Carril del hilo: avatar reseña ─ línea ─ avatar usuario */}
          <div className="flex flex-col items-center">
            <Avatar url={author.avatarUrl} name={author.username} />
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
                <span className="text-ink font-semibold">
                  {capitalize(author.username)}
                </span>{' '}
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
                  className="text-curry-deep"
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: 32,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}
                >
                  {overall.toFixed(1)}
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

              {/* Los 5 ejes en lista (sin radar) */}
              <dl className="mt-4 flex flex-col gap-2">
                {AXIS_KEYS.map((key) => (
                  <div key={key} className="flex items-center gap-3">
                    <dt className="text-sienna w-32 shrink-0 text-[13px]">
                      {AXIS_LABELS[key]}
                    </dt>
                    <div className="bg-paper-sunken relative h-1.5 flex-1 overflow-hidden rounded-full">
                      <div
                        className="bg-curry-deep absolute inset-y-0 left-0 rounded-full"
                        style={{ width: `${(axes[key] / 10) * 100}%` }}
                      />
                    </div>
                    <dd className="text-ink w-8 shrink-0 text-right text-[13px] font-semibold tabular-nums">
                      {axes[key].toFixed(1)}
                    </dd>
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
              <div className="text-cinnamon mt-4 flex items-center gap-4 text-[13px] font-semibold">
                <LikeButton
                  reviewId={vm.id}
                  likes={likes}
                  isLiked={vm.isLiked}
                />
                <span
                  className="inline-flex items-center gap-1.5"
                  aria-label={`${commentsCount} comentarios`}
                >
                  <MessageCircle size={15} strokeWidth={2} />
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
