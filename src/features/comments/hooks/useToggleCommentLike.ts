'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { notifyError } from '@/shared/lib/toast';
import { commentsApi } from '../api/comments.api';
import type { PaginatedComments } from '../types/comments.types';

/** Prefijo del cache donde viven los comentarios paginados. */
const COMMENTS_PREFIX = ['comments', 'list'] as const;

interface ToggleVars {
  commentId: string;
  /** Estado actual: true = ya likeado (la acción será unlike). */
  isLiked: boolean;
}

type CommentsInfinite = InfiniteData<PaginatedComments>;

const delta = (next: boolean) => (next ? 1 : -1);

/** Reescribe `isLiked` + `likesCount` del comentario en una página cacheada. */
function writeLike(
  data: CommentsInfinite | undefined,
  commentId: string,
  next: boolean,
): CommentsInfinite | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((c) =>
        c.id === commentId
          ? { ...c, isLiked: next, likesCount: c.likesCount + delta(next) }
          : c,
      ),
    })),
  };
}

/**
 * Like/unlike de un comentario con update optimista sobre el cache de los
 * comentarios de la reseña (`['comments','list', ...]`). Rollback + toast en
 * error; invalida al settle. El contador/estado vienen por props desde el cache.
 */
export function useToggleCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, isLiked }: ToggleVars) =>
      isLiked ? commentsApi.unlike(commentId) : commentsApi.like(commentId),

    onMutate: async ({ commentId, isLiked }: ToggleVars) => {
      const next = !isLiked;
      await queryClient.cancelQueries({ queryKey: COMMENTS_PREFIX });

      const snapshots = queryClient.getQueriesData<CommentsInfinite>({
        queryKey: COMMENTS_PREFIX,
      });
      for (const [key, data] of snapshots) {
        queryClient.setQueryData(key, writeLike(data, commentId, next));
      }
      return { snapshots };
    },

    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      notifyError('No pudimos actualizar el like');
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: COMMENTS_PREFIX });
    },
  });
}
