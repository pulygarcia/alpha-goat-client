'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { rankingApi } from '../api/ranking.api';

const LIMIT = 20;

export const GLOBAL_RANKING_KEY = ['ranking', 'global'] as const;

/**
 * Ranking global paginado (infinite query con "cargar más"). Arranca en la
 * página 1, así que el índice plano del item == su posición - 1.
 */
export function useGlobalRanking() {
  return useInfiniteQuery({
    queryKey: GLOBAL_RANKING_KEY,
    queryFn: ({ pageParam }) =>
      rankingApi.global({ page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    // Siguiente página solo si lo cargado es menor al total. null corta el scroll.
    getNextPageParam: (last) =>
      last.page * last.limit < last.total ? last.page + 1 : null,
    // El ranking all-time cambia lento; revalidar cada minuto alcanza.
    staleTime: 60_000,
  });
}
