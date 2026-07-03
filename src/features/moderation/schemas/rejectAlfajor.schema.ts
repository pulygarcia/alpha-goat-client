import { z } from 'zod';

/** Motivo del rechazo: requerido, 1–500 chars tras trim (espejo del DTO del back). */
export const rejectAlfajorSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(1, 'Contanos por qué lo rechazás')
    .max(500, 'Máximo 500 caracteres'),
});

export type RejectAlfajorValues = z.infer<typeof rejectAlfajorSchema>;
