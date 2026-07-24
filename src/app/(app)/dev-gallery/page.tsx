import { ReviewsDomeGallery } from '@/shared/components/dome-gallery/ReviewsDomeGallery';

/**
 * Página de prueba (no linkeada desde la nav): prototipo de galería 3D de
 * fotos de reseñas usando el componente DomeGallery. Sacar si no se adopta.
 */
export default function DevGalleryPage() {
  return (
    <div className="h-screen w-screen bg-[#2c1209]">
      <ReviewsDomeGallery />
    </div>
  );
}
