import { apiClient } from '@/shared/lib/api-client';
import type {
  PaginatedRanking,
  RankingQuery,
  WeeklyRankingItem,
} from '../types/ranking.types';

export const rankingApi = {
  /**
   * GET /ranking (público)
   * Ranking global all-time, paginado. Alfajores ordenados por promedio
   * histórico de ratingGeneral (piso de 5 reseñas).
   */
  global: async (params: RankingQuery = {}): Promise<PaginatedRanking> => {
    const res = await apiClient.get<PaginatedRanking>('/ranking', { params });
    return res.data;
  },

  /**
   * GET /ranking/weekly
   * Top 5 alfajores de la semana (público), ordenados por score desc.
   */
  weekly: async (): Promise<WeeklyRankingItem[]> => {
    const res = await apiClient.get<WeeklyRankingItem[]>('/ranking/weekly');
    return res.data;
  },
};
