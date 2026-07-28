'use client';

import { useAlfajoresGallery } from '@/features/stats/hooks/useAlfajoresGallery';
import { useUsersGallery } from '@/features/stats/hooks/useUsersGallery';
import { DEFAULT_AVATAR_SRC } from '@/shared/components/UserAvatar';
import DomeGallery, { type DomeImage } from './DomeGallery';

/** Intercala dos listas, alternando A/B, sin descartar el resto más largo. */
function interleave<T>(a: T[], b: T[]): T[] {
  const result: T[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (i < a.length) result.push(a[i]);
    if (i < b.length) result.push(b[i]);
  }
  return result;
}

/**
 * Cúpula 3D que mezcla avatares de usuarios (redondos, linkean a `/u/[username]`)
 * con fotos de alfajores del catálogo (esquinas suaves, linkean a
 * `/alfajores/[id]`), intercalados. Los usuarios requieren sesión (GET /users);
 * si no hay datos de usuarios (anónimo o sin resultados) se muestra solo
 * alfajores en vez de esconder toda la cúpula.
 */
export function CommunityDomeGallery() {
  const usersQuery = useUsersGallery();
  const alfajoresQuery = useAlfajoresGallery();

  if (usersQuery.isLoading || alfajoresQuery.isLoading) {
    return (
      <div className="text-gris-400 flex h-full w-full items-center justify-center text-sm">
        Cargando…
      </div>
    );
  }

  const userImages: DomeImage[] = (usersQuery.data?.items ?? []).map(
    (user) => ({
      src: user.avatarUrl || DEFAULT_AVATAR_SRC,
      alt: user.username,
      href: `/u/${user.username}`,
    }),
  );

  const alfajorImages: DomeImage[] = (alfajoresQuery.data?.items ?? [])
    .filter((a) => a.imagenUrl)
    .map((alfajor) => ({
      src: alfajor.imagenUrl as string,
      alt: alfajor.nombre,
      href: `/alfajores/${alfajor.id}`,
    }));

  const images = interleave(userImages, alfajorImages);

  if (images.length === 0) {
    return null;
  }

  return (
    <DomeGallery
      images={images}
      grayscale={false}
      fit={0.5}
      minRadius={420}
      maxRadius={780}
      imageBorderRadius="10px"
      // Tiene que ser el fondo exacto de la página: el overlay difumina los
      // bordes de la cúpula contra ella, y un tono distinto deja un halo.
      overlayBlurColor="#fbf8f3"
      segments={38}
      autoRotate
      autoRotateSpeed={3}
    />
  );
}
