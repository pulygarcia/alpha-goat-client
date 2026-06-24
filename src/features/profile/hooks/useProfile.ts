'use client';

import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profile.api';

export const profileKey = (username: string) =>
  ['profile', username] as const;

/**
 * Perfil público por username. Disabled si no hay username. `retry: false`
 * para que un 404 (username inexistente) caiga al estado de error enseguida.
 */
export function useProfile(username: string) {
  return useQuery({
    queryKey: profileKey(username),
    queryFn: () => profileApi.getByUsername(username),
    enabled: !!username,
    retry: false,
    staleTime: 60_000,
  });
}
