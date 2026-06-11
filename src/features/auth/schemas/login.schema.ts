import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Mail inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
