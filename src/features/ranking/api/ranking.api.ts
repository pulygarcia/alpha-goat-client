import { apiClient } from '@/shared/lib/api-client';
import type {
  PaginatedRanking,
  RankingQuery,
  WeeklyRankingItem,
  WorstRatedItem,
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
   * GET /ranking/worst (público)
   * El peor votado all-time (piso 5 reseñas). Devuelve null cuando el back
   * responde 204 (ningún alfajor califica todavía).
   */
  worst: async (): Promise<WorstRatedItem | null> => {
    const res = await apiClient.get<WorstRatedItem | ''>('/ranking/worst');
    if (res.status === 204 || !res.data) return null;
    return res.data as WorstRatedItem;
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
