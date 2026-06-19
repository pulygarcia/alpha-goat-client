import { z } from 'zod';

/** Tope de caracteres de un comentario (estilo tweet). */
export const COMMENT_MAX = 280;

/** Validación del form de comentario: texto no vacío, hasta 280 caracteres. */
export const commentSchema = z.object({
  contenido: z
    .string()
    .trim()
    .min(1, 'Escribí un comentario')
    .max(COMMENT_MAX, `Máximo ${COMMENT_MAX} caracteres`),
});

export type CommentFormValues = z.infer<typeof commentSchema>;
