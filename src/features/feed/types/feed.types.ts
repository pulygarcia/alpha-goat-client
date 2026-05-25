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
