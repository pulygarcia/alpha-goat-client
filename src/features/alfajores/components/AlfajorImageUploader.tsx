'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { imageFileSchema } from '@/shared/schemas/imageFile.schema';
import { NoPhoto } from '@/shared/components/media/NoPhoto';
import { useUploadAlfajorImage } from '../hooks/useUploadAlfajorImage';

const SLOT_CLASS =
  'bg-gris-25 border-gris-50 relative aspect-square w-full overflow-hidden rounded-[16px] border';

/**
 * Slot de imagen del alfajor con control de subida superpuesto. El control solo
 * se renderiza para admins (único caso alcanzable hoy; el back además autoriza
 * al creador cuando el alfajor está PENDING). Flujo preview + confirmar: elegir
 * archivo previsualiza in situ y "Guardar foto" dispara la subida.
 */
export function AlfajorImageUploader({
  alfajorId,
  imagenUrl,
  nombre,
  className,
  slotClassName,
  imageFit = 'cover',
}: {
  alfajorId: string;
  imagenUrl: string | null;
  nombre: string;
  /** Reemplaza el ancho por defecto del wrapper. */
  className?: string;
  /** Reemplaza el slot cuadrado por defecto (la ficha del detalle usa 433/500). */
  slotClassName?: string;
  imageFit?: 'cover' | 'contain';
}) {
  const { data: user } = useCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  const upload = useUploadAlfajorImage(alfajorId);

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Liberar el objectURL del preview al reemplazarlo o desmontar.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const shownUrl = previewUrl ?? imagenUrl;

  function clearPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    const parsed = imageFileSchema.safeParse(picked);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setError(null);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  }

  function onSave() {
    if (!file) return;
    upload.mutate(file, { onSuccess: () => clearPreview() });
  }

  return (
    <div className={className ?? 'w-full max-w-[220px] md:max-w-none'}>
      <div className={slotClassName ?? SLOT_CLASS}>
        {shownUrl ? (
          <Image
            src={shownUrl}
            alt={nombre}
            fill
            sizes="(max-width: 768px) 220px, 420px"
            className={
              imageFit === 'contain' ? 'object-contain' : 'object-cover'
            }
            unoptimized={!!previewUrl}
          />
        ) : (
          <NoPhoto />
        )}

        {isAdmin && (
          <>
            <label
              htmlFor="alfajor-image-file"
              className="text-ink bg-blanco-tibio/90 border-gris-50 hover:border-gris-200 absolute right-2 bottom-2 inline-flex h-7 cursor-pointer items-center gap-1 rounded-[8px] border px-2 text-[11px] font-semibold backdrop-blur-sm transition-colors md:right-3 md:bottom-3 md:h-9 md:gap-1.5 md:rounded-[10px] md:px-3 md:text-[13px]"
            >
              <ImagePlus className="h-3 w-3 md:h-4 md:w-4" strokeWidth={2} />
              Cambiar foto
            </label>
            <input
              ref={inputRef}
              id="alfajor-image-file"
              type="file"
              aria-label="Foto del alfajor"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={onPick}
            />
          </>
        )}
      </div>

      {isAdmin && error && (
        <p className="text-error mt-2 text-[12px]">{error}</p>
      )}

      {isAdmin && file && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={upload.isPending}
            className="text-blanco-tibio inline-flex h-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#3a1808] to-[#1c0a03] px-5 text-[13px] font-semibold tracking-[0.03em] uppercase transition-[filter] hover:brightness-125 disabled:opacity-60"
          >
            {upload.isPending ? 'Subiendo...' : 'Guardar foto'}
          </button>
          <button
            type="button"
            onClick={clearPreview}
            disabled={upload.isPending}
            className="text-gris-400 hover:text-ink h-10 px-2 text-[13px] font-semibold transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
