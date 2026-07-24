'use client';

import { useAlfajoresGallery } from '@/features/stats/hooks/useAlfajoresGallery';
import DomeGallery, { type DomeImage } from './DomeGallery';

/**
 * Cúpula 3D con fotos de alfajores del catálogo; cada tile linkea a
 * `/alfajores/[id]`. Endpoint público, a diferencia de `UsersDomeGallery`.
 */
export function AlfajoresDomeGallery() {
  const { data, isLoading, isError } = useAlfajoresGallery();

  if (isLoading) {
    return (
      <div className="text-paper flex h-full w-full items-center justify-center text-sm">
        Cargando alfajores…
      </div>
    );
  }

  const alfajoresConImagen = data?.items.filter((a) => a.imagenUrl) ?? [];

  if (isError || alfajoresConImagen.length === 0) {
    return null;
  }

  const images: DomeImage[] = alfajoresConImagen.map((alfajor) => ({
    src: alfajor.imagenUrl as string,
    alt: alfajor.nombre,
    href: `/alfajores/${alfajor.id}`,
  }));

  return (
    <DomeGallery
      images={images}
      grayscale={false}
      fit={0.45}
      minRadius={420}
      maxRadius={620}
      imageBorderRadius="24px"
      overlayBlurColor="#fbf5e5"
      autoRotate
      autoRotateSpeed={3}
    />
  );
}
