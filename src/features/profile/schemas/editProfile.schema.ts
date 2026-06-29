import { z } from 'zod';
import {
  imageFileSchema,
  IMAGE_ACCEPTED_TYPES,
  IMAGE_MAX_BYTES,
} from '@/shared/schemas/imageFile.schema';

/** Edición de username. Mismas reglas que el registro (y que el back). */
export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Solo letras, números, guión bajo y punto'),
});

/** Cambio de contraseña. `newPassword` ≥ 8 (espeja `ChangePasswordDto`). */
export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Ingresá tu contraseña actual'),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
});

/**
 * Validación del avatar: reusa el schema genérico de imágenes de shared (mismas
 * reglas que el `ImageFilePipe` del back). Se re-exporta con el nombre del avatar
 * para no tocar los consumidores existentes.
 */
export const AVATAR_ACCEPTED_TYPES = IMAGE_ACCEPTED_TYPES;
export const AVATAR_MAX_BYTES = IMAGE_MAX_BYTES;
export const avatarFileSchema = imageFileSchema;

export type UsernameSchema = z.infer<typeof usernameSchema>;
export type PasswordSchema = z.infer<typeof passwordSchema>;
