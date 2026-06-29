'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { imageFileSchema } from '@/shared/schemas/imageFile.schema';
import { useUploadAlfajorImage } from '../hooks/useUploadAlfajorImage';

const SLOT_CLASS =
  'bg-paper-sunken relative aspect-square w-full overflow-hidden rounded-[16px] border border-[rgba(74,30,8,0.14)]';

function Placeholder({ label }: { label: string }) {
  return (
    <div
      className="text-cinnamon flex h-full w-full items-center justify-center text-[0.7rem] tracking-[0.24em] uppercase"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {label}
    </div>
  );
}

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
  placeholder,
}: {
  alfajorId: string;
  imagenUrl: string | null;
  nombre: string;
  placeholder: string;
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
    <div>
      <div className={SLOT_CLASS}>
        {shownUrl ? (
          <Image
            src={shownUrl}
            alt={nombre}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            className="object-cover"
            unoptimized={!!previewUrl}
          />
        ) : (
          <Placeholder label={placeholder} />
        )}

        {isAdmin && (
          <>
            <label
              htmlFor="alfajor-image-file"
              className="text-ink bg-paper/90 absolute right-3 bottom-3 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[10px] border border-[rgba(74,30,8,0.18)] px-3 text-[13px] font-semibold backdrop-blur-sm transition-colors hover:border-[#3a1808]"
            >
              <ImagePlus className="h-4 w-4" strokeWidth={2} />
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
        <p className="text-sienna mt-2 text-[12px]">{error}</p>
      )}

      {isAdmin && file && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={upload.isPending}
            className="text-paper inline-flex h-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#3a1808] to-[#1c0a03] px-5 text-[13px] font-semibold tracking-[0.03em] uppercase transition-[filter] hover:brightness-125 disabled:opacity-60"
          >
            {upload.isPending ? 'Subiendo...' : 'Guardar foto'}
          </button>
          <button
            type="button"
            onClick={clearPreview}
            disabled={upload.isPending}
            className="text-cinnamon hover:text-ink h-10 px-2 text-[13px] font-semibold transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
