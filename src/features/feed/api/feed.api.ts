import { apiClient } from '@/shared/lib/api-client';
import type {
  FeedHero,
  FeedList,
  FeedListParams,
  FeedStats,
} from '../types/feed.types';

export const feedApi = {
  /**
   * GET /feed/hero
   * Devuelve null cuando el back responde 204 (todavía no hay reseñas).
   */
  hero: async (): Promise<FeedHero | null> => {
    const res = await apiClient.get<FeedHero | ''>('/feed/hero');
    if (res.status === 204 || !res.data) return null;
    return res.data as FeedHero;
  },

  /**
   * GET /feed
   * Lista paginada de reseñas (auth). El back arma la query desde los params.
   */
  list: async (params: FeedListParams): Promise<FeedList> => {
    const res = await apiClient.get<FeedList>('/feed', { params });
    return res.data;
  },

  /**
   * GET /feed/stats
   * Contadores del subnav (público): reseñas de hoy y de los últimos 7 días.
   */
  stats: async (): Promise<FeedStats> => {
    const res = await apiClient.get<FeedStats>('/feed/stats');
    return res.data;
  },
};
