'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { feedApi } from '../api/feed.api';
import type { FeedScope, FeedSort } from '../types/feed.types';

const LIMIT = 20;

export const feedReviewsKey = (sort: FeedSort, scope?: FeedScope, province?: string) =>
  ['feed', 'reviews', { sort, scope: scope ?? null, province: province ?? null }] as const;

interface UseFeedReviewsArgs {
  sort: FeedSort;
  scope?: FeedScope;
  province?: string;
}

export function useFeedReviews({ sort, scope, province }: UseFeedReviewsArgs) {
  return useInfiniteQuery({
    queryKey: feedReviewsKey(sort, scope, province),
    queryFn: ({ pageParam }) =>
      feedApi.list({ sort, scope, province, page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    // Siguiente pagina solo si lo cargado hasta ahora es menor al total. null corta el scroll.
    getNextPageParam: (last) =>
      last.page * last.limit < last.total ? last.page + 1 : null,
    staleTime: 30_000,
  });
}
