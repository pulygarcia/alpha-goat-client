'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/features/reviews/api/reviews.api';

const LIMIT = 10;

export const userReviewsKey = (userId: string) =>
  ['reviews', 'list', { userId }] as const;

/** Reseñas de un usuario, paginadas (infinite query). Disabled si no hay id. */
export function useUserReviews(userId: string) {
  return useInfiniteQuery({
    queryKey: userReviewsKey(userId),
    queryFn: ({ pageParam }) =>
      reviewsApi.list({ userId, page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.limit < last.total ? last.page + 1 : null,
    enabled: !!userId,
    staleTime: 30_000,
  });
}
