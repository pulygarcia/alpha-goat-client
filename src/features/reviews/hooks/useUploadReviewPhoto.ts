'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifyError } from '@/shared/lib/toast';
import { reviewsApi } from '../api/reviews.api';
import { alfajorReviewsKey } from './useAlfajorReviews';

/**
 * Sube la foto de una reseña (multipart). Se dispara tras crear/editar la
 * reseña, con el id recién devuelto. Invalida las mismas caches que
 * `useSubmitReview` (lista del alfajor, su detalle y el feed) para que la foto
 * aparezca. Sin toast de éxito: el de "Reseña publicada" ya lo cubre.
 */
export function useUploadReviewPhoto(alfajorId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, file }: { reviewId: string; file: File }) =>
      reviewsApi.uploadPhoto(reviewId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alfajorReviewsKey(alfajorId) });
      qc.invalidateQueries({ queryKey: ['alfajores', 'detail', alfajorId] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => {
      notifyError('No pudimos subir la foto');
    },
  });
}
