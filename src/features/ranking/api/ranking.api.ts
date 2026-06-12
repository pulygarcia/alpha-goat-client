import { apiClient } from '@/shared/lib/api-client';
import type { WeeklyRankingItem } from '../types/ranking.types';

export const rankingApi = {
  /**
   * GET /ranking/weekly
   * Top 5 alfajores de la semana (público), ordenados por score desc.
   */
  weekly: async (): Promise<WeeklyRankingItem[]> => {
    const res = await apiClient.get<WeeklyRankingItem[]>('/ranking/weekly');
    return res.data;
  },
};
