'use client';

import { ThumbsUp } from 'lucide-react';
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
        'inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ' +
        (isLiked ? 'text-curry-deep' : 'hover:text-curry-deep')
      }
    >
      <ThumbsUp
        size={16}
        strokeWidth={2}
        fill={isLiked ? 'currentColor' : 'none'}
      />
      {likes}
    </button>
  );
}
