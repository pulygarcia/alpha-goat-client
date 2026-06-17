'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { reviewsApi } from '../api/reviews.api';

/**
 * La reseña del usuario actual para un alfajor (o `null` si no reseñó). Sirve
 * para que el form arranque en modo editar. Deshabilitada sin sesión.
 */
export function useMyAlfajorReview(alfajorId: string) {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ['reviews', 'mine', { alfajorId, userId }],
    queryFn: async () => {
      const res = await reviewsApi.list({ alfajorId, userId, limit: 1 });
      return res.items[0] ?? null;
    },
    enabled: !!alfajorId && !!userId,
    staleTime: 30_000,
  });
}
