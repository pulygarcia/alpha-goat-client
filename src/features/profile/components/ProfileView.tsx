'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useProfile } from '../hooks/useProfile';
import { ProfileSidebar } from './ProfileSidebar';
import { ContributionStats } from './ContributionStats';
import { UserReviews } from './UserReviews';
import { EditProfileModal } from './EditProfileModal';

function statusOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

/** Página de perfil público por username: header + reseñas, con edición propia. */
export function ProfileView({ username }: { username: string }) {
  const { data: profile, isLoading, isError, error } = useProfile(username);
  const { data: currentUser } = useCurrentUser();
  const [editOpen, setEditOpen] = useState(false);

  const isOwn = !!profile && currentUser?.id === profile.id;

  return (
    <main className="mx-auto max-w-[980px] px-5 py-8 md:px-8 md:py-10">
      {isLoading && (
        <div
          data-testid="profile-loading"
          aria-hidden
          className="grid gap-8 md:grid-cols-[300px_1fr]"
        >
          <Skeleton className="h-[420px] w-full rounded-2xl" />
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Skeleton className="h-[110px] rounded-xl" />
              <Skeleton className="h-[110px] rounded-xl" />
              <Skeleton className="h-[110px] rounded-xl" />
              <Skeleton className="h-[110px] rounded-xl" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      )}

      {isError && statusOf(error) === 404 && (
        <p className="text-sienna text-[14px]">
          No encontramos a este usuario.
        </p>
      )}

      {isError && statusOf(error) !== 404 && (
        <p className="text-sienna text-[14px]">
          No pudimos cargar el perfil. Probá recargar.
        </p>
      )}

      {profile && (
        <div className="grid gap-8 md:grid-cols-[300px_1fr] md:items-start">
          <ProfileSidebar
            profile={profile}
            onEditClick={() => setEditOpen(true)}
          />

          <div className="flex flex-col gap-8">
            <ContributionStats profile={profile} />
            <div className="border-t border-[rgba(74,30,8,0.12)] pt-6">
              <UserReviews userId={profile.id} username={profile.username} />
            </div>
          </div>

          {isOwn && (
            <EditProfileModal
              open={editOpen}
              onOpenChange={setEditOpen}
              username={profile.username}
              avatarUrl={profile.avatarUrl}
            />
          )}
        </div>
      )}
    </main>
  );
}
