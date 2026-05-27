export type AlfajorTipo =
  | 'CHOCOLATE'
  | 'BLANCO'
  | 'NEGRO'
  | 'FRUTAL'
  | 'MAICENA'
  | 'OTRO';

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

export interface FeedHero {
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
