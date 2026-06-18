import { z } from 'zod';

/** Validación del form de comentario: texto no vacío, hasta 500 caracteres. */
export const commentSchema = z.object({
  contenido: z
    .string()
    .trim()
    .min(1, 'Escribí un comentario')
    .max(500, 'Máximo 500 caracteres'),
});

export type CommentFormValues = z.infer<typeof commentSchema>;
