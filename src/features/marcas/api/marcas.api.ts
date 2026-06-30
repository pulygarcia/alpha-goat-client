import { apiClient } from '@/shared/lib/api-client';
import type { FeaturedMarca, PaginatedMarcas } from '../types/marcas.types';

export const marcasApi = {
  /**
   * GET /marcas/featured
   * Top 5 "marcas en foco" (público). Seleccionadas por controversia en el back.
   */
  featured: async (): Promise<FeaturedMarca[]> => {
    const res = await apiClient.get<FeaturedMarca[]>('/marcas/featured');
    return res.data;
  },

  /**
   * GET /marcas?q= (público) — busca marcas por nombre para el selector de
   * proponer alfajor. Paginado en el back; el selector usa la primera página.
   */
  search: async (q: string): Promise<PaginatedMarcas> => {
    const res = await apiClient.get<PaginatedMarcas>('/marcas', {
      params: { q },
    });
    return res.data;
  },
};
