import { z } from 'zod';

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

/** Tipos y tamaño máximo del avatar — espejan el `ImageFilePipe` del back. */
export const AVATAR_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

/** Valida el `File` del avatar antes de subirlo (mismas reglas que el back). */
export const avatarFileSchema = z
  .instanceof(File)
  .refine(
    (file) => (AVATAR_ACCEPTED_TYPES as readonly string[]).includes(file.type),
    'Formato no válido (jpeg, png o webp)',
  )
  .refine((file) => file.size <= AVATAR_MAX_BYTES, 'La imagen supera los 5 MB');

export type UsernameSchema = z.infer<typeof usernameSchema>;
export type PasswordSchema = z.infer<typeof passwordSchema>;
