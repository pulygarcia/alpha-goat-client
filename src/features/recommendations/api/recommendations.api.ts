import { apiClient } from '@/shared/lib/api-client';
import type { RecommendationItem } from '../types/recommendations.types';

export const recommendationsApi = {
  /**
   * GET /recommendations (auth)
   * Alfajores recomendados para el usuario autenticado, ordenados por score desc.
   * `limit` opcional (back: 1..20, default 6).
   */
  list: async (limit?: number): Promise<RecommendationItem[]> => {
    const res = await apiClient.get<RecommendationItem[]>('/recommendations', {
      params: limit ? { limit } : undefined,
    });
    return res.data;
  },
};
