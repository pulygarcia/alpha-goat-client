import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Requerido'),
  lastName: z.string().min(1, 'Requerido'),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
