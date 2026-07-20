'use client';

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import type { UserSearchResult } from '../types/users.types';

/** Prefijo de la query de búsqueda de usuarios: ['users','search',q]. */
export const USERS_SEARCH_PREFIX = ['users', 'search'] as const;

export const usersSearchKey = (q: string) =>
  [...USERS_SEARCH_PREFIX, q] as const;

/**
 * Busca usuarios por username para el buscador global (modal del ícono lupa). La
 * query se deshabilita con `q` vacío (devuelve `[]`) para no pegarle al back
 * sin término; el llamador ya viene debounced.
 */
export function useUsersSearch(q: string) {
  const trimmed = q.trim();
  return useQuery<UserSearchResult[]>({
    queryKey: usersSearchKey(trimmed),
    queryFn: async () => (await usersApi.search(trimmed)).items,
    enabled: trimmed.length > 0,
    initialData: trimmed.length > 0 ? undefined : [],
    staleTime: 30_000,
  });
}
