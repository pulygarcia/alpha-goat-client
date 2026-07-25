'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useRequireAuth } from '@/shared/hooks/useRequireAuth';
import { useToggleFollow } from '../hooks/useToggleFollow';
import { UnfollowConfirmDialog } from './UnfollowConfirmDialog';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  /** Sólo para el copy de la confirmación al dejar de seguir. */
  username?: string;
  avatarUrl?: string | null;
}

/**
 * Botón Seguir / Siguiendo para el autor de una reseña.
 * - No se renderiza para el propio usuario (no podés seguirte a vos mismo).
 * - Toggle optimista vía `useToggleFollow`; deshabilitado mientras hay request en vuelo.
 * - Seguir es directo; dejar de seguir pasa por una confirmación.
 */
export function FollowButton({
  userId,
  isFollowing,
  username,
  avatarUrl,
}: FollowButtonProps) {
  const { data: currentUser } = useCurrentUser();
  const toggle = useToggleFollow();
  const requireAuth = useRequireAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Oculto para reseñas propias.
  if (currentUser?.id === userId) return null;

  const handleClick = () => {
    if (toggle.isPending) return;
    // Anónimo → redirige a login; logueado → seguir directo, dejar de seguir
    // pide confirmación primero.
    requireAuth(() => {
      if (isFollowing) setConfirmOpen(true);
      else toggle.mutate({ userId, isFollowing });
    });
  };

  const confirmUnfollow = () => {
    toggle.mutate(
      { userId, isFollowing },
      { onSettled: () => setConfirmOpen(false) },
    );
  };

  return (
    <>
      <UnfollowConfirmDialog
        username={username}
        avatarUrl={avatarUrl}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={confirmUnfollow}
        isPending={toggle.isPending}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={toggle.isPending}
        aria-pressed={isFollowing}
        className={
          isFollowing
            ? 'text-cinnamon hover:border-curry-deep hover:text-curry-deep rounded-full border border-[rgba(74,30,8,0.22)] px-3 py-[3px] text-[11px] font-semibold transition-colors disabled:opacity-60'
            : 'rounded-[20px] px-3 py-1 text-[11px] font-bold transition-opacity hover:opacity-90 disabled:opacity-60'
        }
        style={
          isFollowing
            ? undefined
            : {
                background: 'linear-gradient(180deg, #b3702a, #92561d)',
                color: '#fff8ec',
              }
        }
      >
        {isFollowing ? 'Siguiendo' : 'Seguir'}
      </button>
    </>
  );
}
