'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useAuth } from '@/shared/providers/AuthProvider';
import { timeAgo } from '../lib/timeAgo';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';

/** Resumen mínimo de la reseña sobre la que se comenta (props primitivas para
 * no acoplar el slice de comments al tipo `Review` y evitar un ciclo). */
export interface ReviewSummary {
  author: string;
  avatarUrl: string | null;
  comentario: string | null;
  createdAt: string;
}

interface CommentsModalProps {
  reviewId: string;
  summary: ReviewSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function Avatar({ url, name }: { url: string | null; name: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name ?? ''}
        className="h-7 w-7 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="text-cinnamon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(74,30,8,0.14)] text-[10px] font-bold">
      {name ? initials(name) : '·'}
    </div>
  );
}

/**
 * Modal de comentarios como hilo: en el carril izquierdo, el avatar del autor
 * de la reseña arriba conecta por una línea continua con el avatar del usuario
 * que comenta abajo. Ver es público; el gate vive en el form.
 */
export function CommentsModal({
  reviewId,
  summary,
  open,
  onOpenChange,
}: CommentsModalProps) {
  const { user } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-paper-raised text-ink flex max-h-[85vh] max-w-lg flex-col border-[rgba(74,30,8,0.22)]">
        <DialogHeader className="sr-only">
          <DialogTitle>
            Comentarios de la reseña de {summary.author}
          </DialogTitle>
          <DialogDescription>
            Hilo de comentarios de la reseña.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 gap-3 overflow-y-auto pr-1">
          {/* Carril del hilo: avatar reseña ─ línea ─ avatar usuario */}
          <div className="flex flex-col items-center">
            <Avatar url={summary.avatarUrl} name={summary.author} />
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
                  {capitalize(summary.author)}
                </span>{' '}
                <span className="text-cinnamon font-normal">
                  @{summary.author} · {timeAgo(summary.createdAt)}
                </span>
              </p>
              {summary.comentario && (
                <p className="text-sienna mt-1 text-[14px] leading-[1.5]">
                  {summary.comentario}
                </p>
              )}
            </div>

            <CommentList reviewId={reviewId} />

            <CommentForm reviewId={reviewId} replyingTo={summary.author} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
