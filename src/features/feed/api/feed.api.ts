import { apiClient } from '@/shared/lib/api-client';
import type { FeedHero } from '../types/feed.types';

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
};
