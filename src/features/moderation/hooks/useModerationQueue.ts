'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { moderationApi } from '../api/moderation.api';

const LIMIT = 12;

export const moderationQueueKey = (page: number) =>
  ['admin', 'pending', { page }] as const;

/** Prefijo para invalidar todas las páginas de la cola tras moderar. */
export const MODERATION_QUEUE_PREFIX = ['admin', 'pending'] as const;

/**
 * Cola de alfajores PENDING (paginación clásica). `keepPreviousData` evita
 * que la lista quede en blanco entre páginas o durante el refetch que sigue a
 * aprobar/rechazar.
 */
export function useModerationQueue(page: number) {
  return useQuery({
    queryKey: moderationQueueKey(page),
    queryFn: () => moderationApi.getPending({ page, limit: LIMIT }),
    placeholderData: keepPreviousData,
  });
}
