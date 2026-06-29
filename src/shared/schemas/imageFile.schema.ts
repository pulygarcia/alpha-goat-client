import { z } from 'zod';

/**
 * Validación client-side de imágenes subidas (avatar, foto de alfajor, etc.).
 * Espeja el `ImageFilePipe` del back (jpeg/png/webp, ≤5 MB) para cortar el
 * archivo inválido antes del round-trip. Usado por 2+ features → vive en shared.
 */
export const IMAGE_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const imageFileSchema = z
  .instanceof(File)
  .refine(
    (file) => (IMAGE_ACCEPTED_TYPES as readonly string[]).includes(file.type),
    'Formato no válido (jpeg, png o webp)',
  )
  .refine((file) => file.size <= IMAGE_MAX_BYTES, 'La imagen supera los 5 MB');
