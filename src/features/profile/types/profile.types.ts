import type { UserRole } from '@/features/auth/types/auth.types';

/**
 * Perfil público de un usuario (`GET /users/by-username/:username`, auth opcional).
 * - `isFollowing`: `false` para anónimos, `true`/`false` según la relación,
 *   `null` cuando es el propio perfil (no aplica seguirse a uno mismo).
 * - `email`: solo viene cuando el perfil es el del usuario autenticado; para
 *   terceros y anónimos llega omitido (`undefined`).
 */
export interface Profile {
  id: string;
  username: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  reviewsCount: number;
  isFollowing: boolean | null;
  email?: string;
  /**
   * Aportes a la comunidad. Aún no los expone el back (pendiente: ampliar
   * `ProfileResponseDto`); el front los trata como 0/null hasta entonces.
   */
  commentsCount?: number;
  /** Alfajores propuestos por el usuario y aprobados al catálogo. */
  alfajoresAddedCount?: number;
  /** Likes recibidos en sus reseñas. */
  likesReceivedCount?: number;
  /** Promedio de sus `ratingGeneral` (null si todavía no reseñó). */
  avgScore?: number | null;
}
