import type { Paginated } from '@/shared/types/api.types';
import type { AlfajorTipo } from '@/shared/types/alfajor';

// --- GET /ranking (ranking global all-time, página completa, público) ---

/** Marca anidada en un item del ranking. */
export interface RankingMarca {
  id: string;
  nombre: string;
  logoUrl: string | null;
}

/**
 * Un alfajor del ranking global. `score` es el promedio histórico de
 * ratingGeneral (2 decimales); el back exige un piso de 5 reseñas. La posición
 * NO viene del back: la deriva el cliente del offset (`(page-1)*limit + i + 1`).
 */
export interface RankingItem {
  id: string;
  nombre: string;
  tipo: AlfajorTipo;
  score: number;
  reviewsCount: number;
  marca: RankingMarca;
}

export interface RankingQuery {
  page?: number;
  limit?: number;
}

export type PaginatedRanking = Paginated<RankingItem>;

// --- GET /ranking/weekly ("Ranking semanal" del rail, público) ---

/** Dirección vs la semana anterior; `new` si el alfajor no tenía reviews. */
export type WeeklyTrend = 'up' | 'down' | 'same' | 'new';

/**
 * Alfajor del top semanal. `score` es el promedio de rating de los últimos
 * 7 días (2 decimales); el back exige un piso de 3 reseñas en la semana.
 */
export interface WeeklyRankingItem {
  id: string;
  nombre: string;
  score: number;
  trend: WeeklyTrend;
  marca: {
    id: string;
    nombre: string;
    logoUrl: string | null;
  };
}
