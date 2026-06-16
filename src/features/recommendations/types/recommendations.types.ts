// --- GET /recommendations ("Recomendado para vos" del rail, requiere sesión) ---

/**
 * Alfajor recomendado para el usuario. `matchPct` es la afinidad con su huella
 * de gusto (0..100) y llega en `null` en el cold start (usuario sin reseñas):
 * en ese caso el back recomienda por calidad pura. `score` es la fuerza de
 * recomendación (mezcla de afinidad y calidad), usada sólo para el orden — no
 * se muestra en la UI.
 */
export interface RecommendationItem {
  id: string;
  nombre: string;
  tipo: string;
  matchPct: number | null;
  score: number;
  marca: {
    id: string;
    nombre: string;
    logoUrl: string | null;
  };
}
