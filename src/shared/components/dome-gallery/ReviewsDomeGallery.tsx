'use client';

import { useQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/features/reviews/api/reviews.api';
import { DEFAULT_AVATAR_SRC } from '@/shared/components/UserAvatar';
import DomeGallery, { type DomeImage } from './DomeGallery';

/**
 * Prototipo: galería 3D con la foto de cada reseña (o el avatar del autor si
 * no subió foto). Trae un lote grande de reseñas públicas en una sola pasada
 * (no infinite scroll: es solo para ver el componente en acción).
 */
export function ReviewsDomeGallery() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dev', 'reviews-gallery'],
    queryFn: () => reviewsApi.list({ page: 1, limit: 100 }),
  });

  if (isLoading) {
    return (
      <div className="text-paper flex h-full w-full items-center justify-center text-sm">
        Cargando reseñas…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-paper flex h-full w-full items-center justify-center text-sm">
        No pudimos cargar las reseñas.
      </div>
    );
  }

  const images: DomeImage[] = data.items.map((review) => ({
    src: review.fotoUrl || review.author?.avatarUrl || DEFAULT_AVATAR_SRC,
    alt: review.author?.username
      ? `Reseña de ${review.author.username}`
      : 'Reseña',
  }));

  return (
    <DomeGallery
      images={images}
      grayscale={false}
      fit={0.6}
      minRadius={500}
      openedImageWidth="280px"
      openedImageHeight="280px"
      imageBorderRadius="18px"
      openedImageBorderRadius="18px"
      overlayBlurColor="#2c1209"
    />
  );
}
