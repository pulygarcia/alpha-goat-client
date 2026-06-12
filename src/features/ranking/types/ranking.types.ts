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
