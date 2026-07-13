'use client';

import { useQuery } from '@tanstack/react-query';
import { rankingApi } from '../api/ranking.api';

export const WORST_RATED_KEY = ['ranking', 'worst'] as const;

export function useWorstRated() {
  return useQuery({
    queryKey: WORST_RATED_KEY,
    queryFn: rankingApi.worst,
    // Agregado all-time con piso de 5 reseñas: cambia muy lento.
    staleTime: 300_000,
  });
}
