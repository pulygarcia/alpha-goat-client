import { apiClient } from '@/shared/lib/api-client';
import type { FeaturedMarca } from '../types/marcas.types';

export const marcasApi = {
  /**
   * GET /marcas/featured
   * Top 5 "marcas en foco" (público). Seleccionadas por controversia en el back.
   */
  featured: async (): Promise<FeaturedMarca[]> => {
    const res = await apiClient.get<FeaturedMarca[]>('/marcas/featured');
    return res.data;
  },
};
