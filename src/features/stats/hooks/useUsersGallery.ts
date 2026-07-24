import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/features/users/api/users.api';

/**
 * Trae un lote de usuarios (sin `q`) para la galería de avatares de /stats.
 * `usersApi.search` requiere sesión (el back exige JwtAuthGuard en GET /users),
 * así que la galería solo se muestra a usuarios logueados.
 */
export function useUsersGallery() {
  return useQuery({
    queryKey: ['stats', 'users-gallery'],
    queryFn: () => usersApi.search('', { limit: 100 }),
  });
}
