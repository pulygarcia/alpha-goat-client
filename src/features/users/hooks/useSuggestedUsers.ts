'use client';

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import type { UserSearchResult } from '../types/users.types';

/**
 * Usuarios sugeridos para rellenar el buscador global (modal del ícono lupa)
 * antes de que el usuario escriba nada. Reusa `usersApi.search('')`, igual que
 * la galería de /stats.
 */
export function useSuggestedUsers(enabled: boolean) {
  return useQuery<UserSearchResult[]>({
    queryKey: ['users', 'suggested'],
    queryFn: async () => (await usersApi.search('', { limit: 6 })).items,
    enabled,
    staleTime: 60_000,
  });
}
