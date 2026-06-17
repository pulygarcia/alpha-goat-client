import { apiClient } from '@/shared/lib/api-client';
import type {
  Alfajor,
  AlfajoresQuery,
  PaginatedAlfajores,
} from '../types/alfajores.types';

export const alfajoresApi = {
  /**
   * GET /alfajores (público)
   * Catálogo paginado. Filtros opcionales `q` (nombre), `tipo`, `marcaId`.
   * El back fuerza `status: APPROVED` para no-admins.
   */
  list: async (params: AlfajoresQuery = {}): Promise<PaginatedAlfajores> => {
    const res = await apiClient.get<PaginatedAlfajores>('/alfajores', {
      params,
    });
    return res.data;
  },

  /**
   * GET /alfajores/:id (público)
   * Detalle de un alfajor con su `marca` anidada.
   */
  byId: async (id: string): Promise<Alfajor> => {
    const res = await apiClient.get<Alfajor>(`/alfajores/${id}`);
    return res.data;
  },
};
