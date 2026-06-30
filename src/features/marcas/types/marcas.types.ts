import type { Paginated } from '@/shared/types/api.types';

// --- GET /marcas (catálogo de marcas, público) ---

/** Marca del catálogo (`GET /marcas`). Usada por el selector de proponer alfajor. */
export interface Marca {
  id: string;
  nombre: string;
  provincia: string | null;
  logoUrl: string | null;
}

export type PaginatedMarcas = Paginated<Marca>;

// --- GET /marcas/featured ("Marcas en foco" del rail, público) ---

/**
 * Marca destacada del rail. El back las selecciona por controversia
 * (dispersión del rating reciente) pero ese criterio es interno:
 * la shape sólo expone datos históricos de la marca.
 */
export interface FeaturedMarca {
  id: string;
  nombre: string;
  provincia: string | null;
  logoUrl: string | null;
  productCount: number;
  avgScore: number;
}
