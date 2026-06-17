'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews.api';
import { alfajorReviewsKey } from './useAlfajorReviews';
import type {
  CreateReviewInput,
  UpdateReviewInput,
} from '../types/reviews.types';

/** Crear una reseña nueva, o editar la propia existente (por id). */
export type SubmitReviewPayload =
  | { mode: 'create'; input: CreateReviewInput }
  | { mode: 'edit'; reviewId: string; input: UpdateReviewInput };

/**
 * Mutation que crea o edita una reseña y, al terminar, invalida el listado de
 * reseñas del alfajor y su detalle (para reflejar el cambio en ambos).
 */
export function useSubmitReview(alfajorId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) =>
      payload.mode === 'create'
        ? reviewsApi.create(payload.input)
        : reviewsApi.update(payload.reviewId, payload.input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alfajorReviewsKey(alfajorId) });
      qc.invalidateQueries({ queryKey: ['alfajores', 'detail', alfajorId] });
    },
  });
}
