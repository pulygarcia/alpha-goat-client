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

export type UsernameSchema = z.infer<typeof usernameSchema>;
export type PasswordSchema = z.infer<typeof passwordSchema>;
