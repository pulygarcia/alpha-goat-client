'use client';

import { useQuery } from '@tanstack/react-query';
import { marcasApi } from '../api/marcas.api';
import type { Marca } from '../types/marcas.types';

export const marcasSearchKey = (q: string) => ['marcas', 'search', q] as const;

/**
 * Busca marcas por nombre para el selector de proponer alfajor. La query se
 * deshabilita con `q` vacío (devuelve `[]`) para no pegarle al back sin término;
 * el llamador ya viene debounced.
 */
export function useMarcasSearch(q: string) {
  const trimmed = q.trim();
  return useQuery<Marca[]>({
    queryKey: marcasSearchKey(trimmed),
    queryFn: async () => (await marcasApi.search(trimmed)).items,
    enabled: trimmed.length > 0,
    initialData: trimmed.length > 0 ? undefined : [],
    staleTime: 60_000,
  });
}
