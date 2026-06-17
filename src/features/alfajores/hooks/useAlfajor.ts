'use client';

import { useQuery } from '@tanstack/react-query';
import { alfajoresApi } from '../api/alfajores.api';

export const alfajorKey = (id: string) => ['alfajores', 'detail', id] as const;

/** Detalle de un alfajor por id. Deshabilitada si no hay id. */
export function useAlfajor(id: string) {
  return useQuery({
    queryKey: alfajorKey(id),
    queryFn: () => alfajoresApi.byId(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}
