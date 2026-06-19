'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { commentsApi } from '../api/comments.api';

const LIMIT = 10;

export const reviewCommentsKey = (reviewId: string) =>
  ['comments', 'list', { reviewId }] as const;

/** Comentarios de una reseña, paginados (infinite query). Disabled sin id. */
export function useReviewComments(reviewId: string) {
  return useInfiniteQuery({
    queryKey: reviewCommentsKey(reviewId),
    queryFn: ({ pageParam }) =>
      commentsApi.list(reviewId, { page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.limit < last.total ? last.page + 1 : null,
    enabled: !!reviewId,
    staleTime: 30_000,
  });
}
