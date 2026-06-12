'use client';

import { useQuery } from '@tanstack/react-query';
import { rankingApi } from '../api/ranking.api';

export const WEEKLY_RANKING_KEY = ['ranking', 'weekly'] as const;

export function useWeeklyRanking() {
  return useQuery({
    queryKey: WEEKLY_RANKING_KEY,
    queryFn: rankingApi.weekly,
    // Ranking de ventana de 7 días: cambia lento, revalidar cada 5 min alcanza.
    staleTime: 300_000,
  });
}
