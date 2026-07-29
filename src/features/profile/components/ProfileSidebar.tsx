'use client';

import Link from 'next/link';
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
  ADMIN: 'Administrador',
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
        className="text-blanco-tibio/60"
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
 * Sidebar pintado del perfil (estilo carnet): fondo chocolate, avatar, handle,
 * botón Editar/Seguir, metadatos y los contadores sociales con count-up.
 * Pensado para la columna izquierda del layout ledger.
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
    <aside className="sidebar-bg-mesh text-blanco-tibio relative overflow-hidden rounded-2xl px-7 py-8">
      {/* Segunda mancha del mesh: necesita nodo propio porque un elemento sólo
          tiene dos pseudo-elementos y los dos ya están usados (grano y mancha
          A), y las dos manchas deben moverse por separado. */}
      <div aria-hidden className="sidebar-bg-mesh__b" />

      {/* `z-20` para quedar por encima del mesh, que vive en un `::after` y al
          ser el último hijo pintaría sobre el contenido. */}
      <div className="relative z-20">
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
            className="h-20 w-20 rounded-full border-[3px] border-white/22 object-cover"
          />
        </div>

        <h1 className="text-[24px] leading-none font-bold tracking-[-0.025em]">
          {profile.username}
        </h1>
        <p
          className="text-blanco-tibio/62 mt-[6px]"
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
              className="text-blanco-tibio w-full rounded-[10px] border border-white/32 bg-white/8 py-[9px] text-[12.5px] font-semibold transition-colors hover:bg-white/16"
            >
              Editar perfil
            </button>
          ) : (
            <FollowButton
              userId={profile.id}
              isFollowing={profile.isFollowing ?? false}
              username={profile.username}
              avatarUrl={profile.avatarUrl}
            />
          )}
          <Link
            href={`/u/${profile.username}/album`}
            className="text-curry-bright mt-2 block text-center text-[12px] font-semibold tracking-wide underline-offset-4 hover:underline"
          >
            Ver álbum
          </Link>
        </div>

        <div className="my-5 flex flex-col gap-[9px]">
          <div className="text-blanco-tibio/85 flex gap-[10px] text-[12.5px]">
            <span
              className="text-blanco-tibio/50 w-[70px] uppercase"
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
          <div className="text-blanco-tibio/85 flex gap-[10px] text-[12.5px]">
            <span
              className="text-blanco-tibio/50 w-[70px] uppercase"
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

        <div className="flex flex-col gap-[13px] border-t border-white/16 pt-4">
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
