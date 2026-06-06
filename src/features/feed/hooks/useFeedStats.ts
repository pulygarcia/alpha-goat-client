'use client';

import { useQuery } from '@tanstack/react-query';
import { feedApi } from '../api/feed.api';

export const FEED_STATS_KEY = ['feed', 'stats'] as const;

export function useFeedStats() {
  return useQuery({
    queryKey: FEED_STATS_KEY,
    queryFn: feedApi.stats,
    staleTime: 60_000,
  });
}
