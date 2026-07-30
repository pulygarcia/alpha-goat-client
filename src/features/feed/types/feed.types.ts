// Promovido a shared (lo usan feed + alfajores); se re-exporta para no romper
// los consumidores que lo importan desde feed.types.
import type { AlfajorTipo } from '@/shared/types/alfajor';

export type { AlfajorTipo };

export interface FeedHeroMarca {
  id: string;
  nombre: string;
  provincia: string | null;
}

export interface FeedHeroAlfajor {
  id: string;
  nombre: string;
  tipo: AlfajorTipo;
  imagenUrl: string | null;
  marca: FeedHeroMarca;
}

export interface FeedHeroRatings {
  general: number;
  dulzor: number;
  cantidadDDL: number;
  calidadBano: number;
  ratioTapaRelleno: number;
  textura: number;
}

export interface FeedHeroStats {
  reviewsThisWeek: number;
  reviewsLastWeek: number;
  /** null cuando reviewsLastWeek = 0 — no se puede calcular variación */
  deltaPct: number | null;
  totalReviews: number;
}

export interface FeedHeroPeriod {
  from: string;
  to: string;
}

/**
 * De dónde salió el pick del hero. `weekly` es el ganador de los últimos 7
 * días; `allTime` es el fallback histórico, cuando nadie llegó al piso de
 * reseñas en la ventana. Cambia el rótulo: llamar "del momento" a un pick sin
 * actividad reciente miente sobre el dato.
 *
 * Ojo con el nombre: `FeedScope` (más abajo) es otra cosa — el filtro del
 * subnav, que elige el usuario.
 */
export type FeedHeroScope = 'weekly' | 'allTime';

export interface FeedHero {
  /** Ausente en respuestas viejas del back; se trata como `weekly`. */
  scope?: FeedHeroScope;
  alfajor: FeedHeroAlfajor;
  ratings: FeedHeroRatings;
  stats: FeedHeroStats;
  period: FeedHeroPeriod;
}

// --- GET /feed (lista paginada de reseñas) ---

export type FeedSort = 'likes' | 'recent' | 'rating';
export type FeedScope = 'today' | 'week' | 'following' | 'province';

export interface FeedAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
  /**
   * Si el usuario autenticado sigue a este autor. Lo computa el backend contra
   * el usuario actual; `false` para reseñas propias y para pedidos anónimos.
   * Tratar un valor ausente como `false`.
   */
  isFollowing: boolean;
}

export interface FeedItemAlfajor {
  id: string;
  nombre: string;
  tipo: AlfajorTipo;
  imagenUrl: string | null;
}

export interface FeedItemMarca {
  id: string;
  nombre: string;
  provincia: string | null;
}

/** Los 5 ejes de la reseña (sin el general, que va en `overall`). */
export interface FeedAxes {
  dulzor: number;
  cantidadDDL: number;
  calidadBano: number;
  ratioTapaRelleno: number;
  textura: number;
}

export interface FeedItem {
  id: string;
  author: FeedAuthor;
  alfajor: FeedItemAlfajor;
  marca: FeedItemMarca;
  quote: string | null;
  photoUrl: string | null;
  overall: number;
  axes: FeedAxes;
  likes: number;
  /** Si el usuario actual ya likeó la reseña (`GET /feed`, false anónimo). */
  isLiked: boolean;
  commentsCount: number;
  createdAt: string;
}

export interface FeedList {
  items: FeedItem[];
  total: number;
  page: number;
  limit: number;
}

export interface FeedListParams {
  sort?: FeedSort;
  scope?: FeedScope;
  province?: string;
  page?: number;
  limit?: number;
}

// --- GET /feed/stats (contadores del subnav, público) ---

export interface FeedStats {
  /** Reseñas de alfajores aprobados creadas hoy (desde las 00:00 local). */
  todayCount: number;
  /** Reseñas de los últimos 7 días (ventana móvil). */
  weekCount: number;
}
