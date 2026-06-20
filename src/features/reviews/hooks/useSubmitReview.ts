'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews.api';
import { notifySuccess, notifyError } from '@/shared/lib/toast';
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
 * reseñas del alfajor, su detalle y el feed (para que la reseña nueva aparezca
 * en "recientes" sin tener que refrescar a mano).
 */
export function useSubmitReview(alfajorId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) =>
      payload.mode === 'create'
        ? reviewsApi.create(payload.input)
        : reviewsApi.update(payload.reviewId, payload.input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: alfajorReviewsKey(alfajorId) });
      qc.invalidateQueries({ queryKey: ['alfajores', 'detail', alfajorId] });
      qc.invalidateQueries({ queryKey: ['feed'] });
      notifySuccess(
        variables.mode === 'create' ? 'Reseña publicada' : 'Reseña actualizada',
      );
    },
    onError: () => {
      notifyError('No pudimos publicar la reseña');
    },
  });
}
