'use client';

import { useUsersGallery } from '@/features/stats/hooks/useUsersGallery';
import { DEFAULT_AVATAR_SRC } from '@/shared/components/UserAvatar';
import DomeGallery, { type DomeImage } from './DomeGallery';

/**
 * Cúpula 3D con los avatares de usuarios registrados; cada tile linkea a
 * `/u/[username]`. Requiere sesión (GET /users la exige), por eso el
 * consumidor (StatsPage) decide qué mostrar mientras isError/isLoading.
 */
export function UsersDomeGallery() {
  const { data, isLoading, isError } = useUsersGallery();

  if (isLoading) {
    return (
      <div className="text-paper flex h-full w-full items-center justify-center text-sm">
        Cargando usuarios…
      </div>
    );
  }

  if (isError || !data || data.items.length === 0) {
    return null;
  }

  const images: DomeImage[] = data.items.map((user) => ({
    src: user.avatarUrl || DEFAULT_AVATAR_SRC,
    alt: user.username,
    href: `/u/${user.username}`,
  }));

  return (
    <DomeGallery
      images={images}
      grayscale={false}
      fit={0.45}
      minRadius={420}
      maxRadius={620}
      imageBorderRadius="999px"
      overlayBlurColor="#fbf5e5"
      segments={44}
      autoRotate
      autoRotateSpeed={3}
    />
  );
}
