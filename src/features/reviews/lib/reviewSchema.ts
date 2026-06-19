import { z } from 'zod';

const rating = z
  .number({ message: 'Elegí un valor' })
  .min(0, 'Mínimo 0')
  .max(10, 'Máximo 10');

/** Validación del form de reseña: 6 ratings 0-10 + comentario opcional. */
export const reviewSchema = z.object({
  ratingGeneral: rating,
  dulzor: rating,
  cantidadDDL: rating,
  calidadBano: rating,
  ratioTapaRelleno: rating,
  textura: rating,
  comentario: z.string().max(280, 'Máximo 280 caracteres'),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
