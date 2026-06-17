'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews.api';

const LIMIT = 10;

export const alfajorReviewsKey = (alfajorId: string) =>
  ['reviews', 'list', { alfajorId }] as const;

/** Reseñas de un alfajor, paginadas (infinite query). Disabled si no hay id. */
export function useAlfajorReviews(alfajorId: string) {
  return useInfiniteQuery({
    queryKey: alfajorReviewsKey(alfajorId),
    queryFn: ({ pageParam }) =>
      reviewsApi.list({ alfajorId, page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.limit < last.total ? last.page + 1 : null,
    enabled: !!alfajorId,
    staleTime: 30_000,
  });
}
