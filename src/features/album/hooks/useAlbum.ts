'use client';

import { useQuery } from '@tanstack/react-query';
import { albumApi } from '../api/album.api';

export const albumKey = (username: string) => ['album', username] as const;

/**
 * Álbum público por username. Disabled sin username. `retry: false` para
 * que un 404 (username inexistente) caiga al estado de error enseguida
 * (mismo patrón que `useProfile`, mismo endpoint base).
 */
export function useAlbum(username: string) {
  return useQuery({
    queryKey: albumKey(username),
    queryFn: () => albumApi.byUsername(username),
    enabled: !!username,
    retry: false,
    staleTime: 60_000,
  });
}
