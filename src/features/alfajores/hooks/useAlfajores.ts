'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { alfajoresApi } from '../api/alfajores.api';
import type { AlfajoresQuery } from '../types/alfajores.types';

const LIMIT = 24;

type AlfajoresFilters = Omit<AlfajoresQuery, 'page' | 'limit'>;

export const alfajoresKey = (filters: AlfajoresFilters) =>
  [
    'alfajores',
    'list',
    {
      q: filters.q ?? null,
      tipo: filters.tipo ?? null,
      marcaId: filters.marcaId ?? null,
    },
  ] as const;

/** Catálogo paginado (infinite query con "cargar más"), con filtros opcionales. */
export function useAlfajores(filters: AlfajoresFilters = {}) {
  return useInfiniteQuery({
    queryKey: alfajoresKey(filters),
    queryFn: ({ pageParam }) =>
      alfajoresApi.list({ ...filters, page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    // Siguiente página solo si lo cargado es menor al total. null corta el scroll.
    getNextPageParam: (last) =>
      last.page * last.limit < last.total ? last.page + 1 : null,
    staleTime: 30_000,
  });
}
