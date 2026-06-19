'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifyError } from '@/shared/lib/toast';
import { commentsApi } from '../api/comments.api';
import { reviewCommentsKey } from './useReviewComments';
import type { CreateCommentInput } from '../types/comments.types';

/**
 * Crea un comentario en una reseña y, al terminar, invalida su listado para
 * que el nuevo comentario aparezca. Sin toast de éxito (acción de bajo peso,
 * el comentario apareciendo en la lista ya es feedback); toast solo en error.
 */
export function useCreateComment(reviewId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      commentsApi.create(reviewId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewCommentsKey(reviewId) });
    },
    onError: () => {
      notifyError('No pudimos publicar el comentario');
    },
  });
}
