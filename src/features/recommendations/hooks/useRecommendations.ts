'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { recommendationsApi } from '../api/recommendations.api';

export const RECOMMENDATIONS_KEY = (limit?: number) =>
  ['recommendations', { limit }] as const;

/**
 * `GET /recommendations` es auth-only: la query se habilita sólo cuando hay
 * sesión en el store (`enabled: !!user`), así un invitado nunca dispara el 401.
 * La huella de gusto cambia lento → revalidar cada 5 min alcanza.
 */
export function useRecommendations(limit?: number) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: RECOMMENDATIONS_KEY(limit),
    queryFn: () => recommendationsApi.list(limit),
    enabled: !!user,
    staleTime: 300_000,
  });
}
