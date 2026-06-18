'use client';

import { useRequireAuth } from '@/shared/hooks/useRequireAuth';
import { useToggleLike } from '../hooks/useToggleLike';

interface LikeButtonProps {
  reviewId: string;
  likes: number;
  isLiked: boolean;
}

/**
 * Botón de like de una reseña, compartido por la card del feed y la del detalle.
 * Toggle optimista vía `useToggleLike` (el contador/estado vienen por props desde
 * el cache, que el hook ya reescribe). Gateado: anónimo → login. Deshabilitado
 * mientras hay request en vuelo.
 */
export function LikeButton({ reviewId, likes, isLiked }: LikeButtonProps) {
  const toggle = useToggleLike();
  const requireAuth = useRequireAuth();

  const handleClick = () => {
    if (toggle.isPending) return;
    requireAuth(() => toggle.mutate({ reviewId, isLiked }));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-pressed={isLiked}
      aria-label={isLiked ? 'Quitar like' : 'Dar like'}
      className={
        'inline-flex items-center gap-[5px] transition-colors disabled:opacity-60 ' +
        (isLiked ? 'text-curry-deep' : 'hover:text-curry-deep')
      }
    >
      {isLiked ? '★' : '☆'} {likes} likes
    </button>
  );
}
