'use client';

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useToggleFollow } from '../hooks/useToggleFollow';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
}

/**
 * Botón Seguir / Siguiendo para el autor de una reseña.
 * - No se renderiza para el propio usuario (no podés seguirte a vos mismo).
 * - Toggle optimista vía `useToggleFollow`; deshabilitado mientras hay request en vuelo.
 */
export function FollowButton({ userId, isFollowing }: FollowButtonProps) {
  const { data: currentUser } = useCurrentUser();
  const toggle = useToggleFollow();

  // Oculto para reseñas propias.
  if (currentUser?.id === userId) return null;

  const handleClick = () => {
    if (toggle.isPending) return;
    toggle.mutate({ userId, isFollowing });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-pressed={isFollowing}
      className={
        'rounded-full border px-3 py-[3px] text-[11px] font-semibold transition-colors disabled:opacity-60 ' +
        (isFollowing
          ? 'text-cinnamon hover:border-curry-deep hover:text-curry-deep border-[rgba(74,30,8,0.22)]'
          : 'border-curry-deep bg-curry-deep text-paper hover:bg-curry-bright')
      }
    >
      {isFollowing ? 'Siguiendo' : 'Seguir'}
    </button>
  );
}
