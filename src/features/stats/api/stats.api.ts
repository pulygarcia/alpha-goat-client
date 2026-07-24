import { apiClient } from '@/shared/lib/api-client';
import type { GlobalStats } from '../types/stats.types';

export const statsApi = {
  /**
   * GET /stats/global (público) — contadores globales de la app.
   */
  global: async (): Promise<GlobalStats> => {
    const res = await apiClient.get<GlobalStats>('/stats/global');
    return res.data;
  },
};
