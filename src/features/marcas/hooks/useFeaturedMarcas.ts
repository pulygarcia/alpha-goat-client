'use client';

import { useQuery } from '@tanstack/react-query';
import { marcasApi } from '../api/marcas.api';

export const FEATURED_MARCAS_KEY = ['marcas', 'featured'] as const;

export function useFeaturedMarcas() {
  return useQuery({
    queryKey: FEATURED_MARCAS_KEY,
    queryFn: marcasApi.featured,
    // Ranking de ventana de 30 días: cambia lento, revalidar cada 5 min alcanza.
    staleTime: 300_000,
  });
}
