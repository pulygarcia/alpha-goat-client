import { apiClient } from '@/shared/lib/api-client';
import type { PaginatedUserSearchResults } from '../types/users.types';

export const usersApi = {
  /**
   * GET /users?q= — busca usuarios por username para el buscador global.
   * Requiere sesión (el shape incluye `isFollowing` por resultado).
   */
  search: async (
    q: string,
    params: { limit?: number; page?: number } = {},
  ): Promise<PaginatedUserSearchResults> => {
    const res = await apiClient.get<PaginatedUserSearchResults>('/users', {
      params: { q, ...params },
    });
    return res.data;
  },
};
