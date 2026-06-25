'use client';

import { ThumbsUp } from 'lucide-react';
import { useRequireAuth } from '@/shared/hooks/useRequireAuth';
import { useToggleCommentLike } from '../hooks/useToggleCommentLike';

interface CommentLikeButtonProps {
  commentId: string;
  likesCount: number;
  isLiked: boolean;
}

/**
 * Botón de like de un comentario. Toggle optimista vía `useToggleCommentLike`
 * (contador/estado vienen por props desde el cache que el hook reescribe).
 * Gateado: anónimo → login. No se deshabilita mientras el request está en vuelo
 * (el toggle es optimista; el guard `isPending` ya evita el doble disparo) para
 * no mostrar el cursor not-allowed ni atenuar el botón.
 */
export function CommentLikeButton({
  commentId,
  likesCount,
  isLiked,
}: CommentLikeButtonProps) {
  const toggle = useToggleCommentLike();
  const requireAuth = useRequireAuth();

  const handleClick = () => {
    if (toggle.isPending) return;
    requireAuth(() => toggle.mutate({ commentId, isLiked }));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isLiked}
      aria-label={isLiked ? 'Quitar like' : 'Dar like'}
      className={
        'inline-flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-[0.72rem] font-semibold transition-colors ' +
        (isLiked ? 'text-curry-deep' : 'text-cinnamon hover:text-curry-deep')
      }
    >
      <ThumbsUp
        size={13}
        strokeWidth={2}
        fill={isLiked ? 'currentColor' : 'none'}
      />
      {likesCount}
    </button>
  );
}
