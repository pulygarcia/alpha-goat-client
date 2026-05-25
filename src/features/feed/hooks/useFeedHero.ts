'use client';

import { useQuery } from '@tanstack/react-query';
import { feedApi } from '../api/feed.api';

export const FEED_HERO_KEY = ['feed', 'hero'] as const;

export function useFeedHero() {
  return useQuery({
    queryKey: FEED_HERO_KEY,
    queryFn: feedApi.hero,
    staleTime: 60_000,
  });
}
