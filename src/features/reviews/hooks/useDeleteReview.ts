'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifyError, notifySuccess } from '@/shared/lib/toast';
import { reviewsApi } from '../api/reviews.api';

/**
 * Borra una reseña (autor o admin, lo valida el back). Invalida por prefijo
 * en vez de parchear cada cache a mano: borrar es poco frecuente, a
 * diferencia del like, y toca demasiadas superficies (feed, listado del
 * alfajor, `useMyAlfajorReview`, promedios, perfil, rankings) para justificar
 * la reescritura optimista.
 */
export function useDeleteReview() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.remove(reviewId),
    onSuccess: () => {
      notifySuccess('Reseña eliminada');
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['alfajores'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['ranking'] });
    },
    onError: () => {
      notifyError('No pudimos borrar la reseña');
    },
  });
}
