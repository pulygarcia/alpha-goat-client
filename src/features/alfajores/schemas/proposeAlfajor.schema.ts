import { z } from 'zod';
import { ALFAJOR_TIPOS } from '@/shared/types/alfajor';

/**
 * Validación client-side de la propuesta de alfajor. Espeja el `CreateAlfajorDto`
 * del back (nombre 2-150, tipo del enum, y **exactamente una** fuente de marca)
 * para cortar lo inválido antes del round-trip. El form público solo manda estos
 * campos.
 *
 * La marca viene por uno de dos caminos excluyentes: `marcaId` si está en el
 * catálogo, o `marcaNombre` en texto libre si no. El error del refine se ancla
 * en `marcaId` porque ese es el campo que el form pinta: el usuario ve un solo
 * control de marca, no dos.
 */
export const proposeAlfajorSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(150, 'El nombre es demasiado largo'),
    marcaId: z.string().optional(),
    marcaNombre: z
      .string()
      .trim()
      .min(2, 'El nombre de la marca debe tener al menos 2 caracteres')
      .max(120, 'El nombre de la marca es demasiado largo')
      .optional(),
    tipo: z.enum(ALFAJOR_TIPOS, { message: 'Elegí un tipo' }),
  })
  .refine(
    ({ marcaId, marcaNombre }) => Boolean(marcaId) !== Boolean(marcaNombre),
    { path: ['marcaId'], message: 'Elegí una marca' },
  );

export type ProposeAlfajorForm = z.infer<typeof proposeAlfajorSchema>;
