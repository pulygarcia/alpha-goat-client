import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Mail inválido'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Solo letras, números, guión bajo y punto'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
