'use client';

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { FollowButton } from '@/features/follows/components/FollowButton';
import { CountUp } from '@/shared/components/motion/CountUp';
import { ProfileAvatarModal } from './ProfileAvatarModal';
import type { Profile } from '../types/profile.types';
import type { UserRole } from '@/features/auth/types/auth.types';

function memberSince(iso: string) {
  return new Intl.DateTimeFormat('es', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

const ROLE_LABEL: Record<UserRole, string> = {
  USER: 'Usuario alphagoat',
  ADMIN: 'Curador',
};

function CoreRow({
  testid,
  value,
  label,
}: {
  testid: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span
        data-testid={testid}
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: 20,
          letterSpacing: '-0.03em',
        }}
      >
        <CountUp value={value} />
      </span>
      <span
        className="text-[rgba(255,253,246,0.6)]"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Sidebar pintado del perfil (estilo carnet): degradado chocolate con textura
 * de puntos, avatar, handle, botón Editar/Seguir, metadatos y los contadores
 * sociales con count-up. Pensado para la columna izquierda del layout ledger.
 */
export function ProfileSidebar({
  profile,
  onEditClick,
}: {
  profile: Profile;
  onEditClick?: () => void;
}) {
  const { data: currentUser } = useCurrentUser();
  const isOwn = currentUser?.id === profile.id;
  const roleLabel = ROLE_LABEL[profile.role];

  return (
    <aside
      className="text-paper-raised relative overflow-hidden rounded-2xl px-7 py-8"
      style={{
        background:
          'linear-gradient(165deg, #1c0a03 0%, #3a1808 58%, #7a3d10 100%)',
      }}
    >
      {/* textura de puntos tipo carnet */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '17px 17px',
        }}
      />

      <div className="relative">
        <span
          className="text-curry-bright block"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          {roleLabel}
        </span>

        <div className="mt-3 mb-4">
          <ProfileAvatarModal
            avatarUrl={profile.avatarUrl}
            username={profile.username}
            className="h-20 w-20 rounded-full border-[3px] border-[rgba(255,255,255,0.22)] object-cover"
          />
        </div>

        <h1 className="text-[24px] leading-none font-bold tracking-[-0.025em]">
          {profile.username}
        </h1>
        <p
          className="mt-[6px] text-[rgba(255,253,246,0.62)]"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.07em',
          }}
        >
          @{profile.username}
        </p>

        <div className="mt-4">
          {isOwn ? (
            <button
              type="button"
              onClick={onEditClick}
              className="text-paper-raised w-full rounded-[10px] border border-[rgba(255,255,255,0.32)] bg-[rgba(255,255,255,0.08)] py-[9px] text-[12.5px] font-semibold transition-colors hover:bg-[rgba(255,255,255,0.16)]"
            >
              Editar perfil
            </button>
          ) : (
            <FollowButton
              userId={profile.id}
              isFollowing={profile.isFollowing ?? false}
            />
          )}
        </div>

        <div className="my-5 flex flex-col gap-[9px]">
          <div className="flex gap-[10px] text-[12.5px] text-[rgba(255,253,246,0.85)]">
            <span
              className="w-[70px] text-[rgba(255,253,246,0.5)] uppercase"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9.5,
                letterSpacing: '0.12em',
              }}
            >
              Desde
            </span>
            {memberSince(profile.createdAt)}
          </div>
          <div className="flex gap-[10px] text-[12.5px] text-[rgba(255,253,246,0.85)]">
            <span
              className="w-[70px] text-[rgba(255,253,246,0.5)] uppercase"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9.5,
                letterSpacing: '0.12em',
              }}
            >
              Rol
            </span>
            {roleLabel}
          </div>
        </div>

        <div className="flex flex-col gap-[13px] border-t border-[rgba(255,255,255,0.16)] pt-4">
          <CoreRow
            testid="stat-reviews"
            value={profile.reviewsCount}
            label="Reseñas"
          />
          <CoreRow
            testid="stat-followers"
            value={profile.followersCount}
            label="Seguidores"
          />
          <CoreRow
            testid="stat-following"
            value={profile.followingCount}
            label="Siguiendo"
          />
        </div>
      </div>
    </aside>
  );
}
