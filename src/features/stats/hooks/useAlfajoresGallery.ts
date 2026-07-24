import { useQuery } from '@tanstack/react-query';
import { alfajoresApi } from '@/features/alfajores/api/alfajores.api';

/**
 * Trae un lote de alfajores (con foto) para la galería de la cúpula de /stats.
 * Endpoint público, a diferencia de `useUsersGallery` que requiere sesión.
 */
export function useAlfajoresGallery() {
  return useQuery({
    queryKey: ['stats', 'alfajores-gallery'],
    queryFn: () => alfajoresApi.list({ limit: 100 }),
  });
}
