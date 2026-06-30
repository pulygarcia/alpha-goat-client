import { z } from 'zod';
import { ALFAJOR_TIPOS } from '@/shared/types/alfajor';

/**
 * Validación client-side de la propuesta de alfajor. Espeja el `CreateAlfajorDto`
 * del back (nombre 2-150, marca requerida, tipo del enum) para cortar lo inválido
 * antes del round-trip. El form público solo manda estos 3 campos.
 */
export const proposeAlfajorSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre es demasiado largo'),
  marcaId: z.string().min(1, 'Elegí una marca'),
  tipo: z.enum(ALFAJOR_TIPOS, { message: 'Elegí un tipo' }),
});

export type ProposeAlfajorForm = z.infer<typeof proposeAlfajorSchema>;
