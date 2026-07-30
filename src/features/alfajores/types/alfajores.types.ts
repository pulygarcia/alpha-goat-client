import type { Paginated } from '@/shared/types/api.types';
import type { AlfajorTipo } from '@/shared/types/alfajor';

/** Estados del catálogo (espejo del enum del back). El público solo ve APPROVED. */
export type AlfajorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Marca anidada en el alfajor (la trae el back desde `feat/alfajor-marca-in-dto`). */
export interface AlfajorMarca {
  id: string;
  nombre: string;
  provincia: string | null;
  logoUrl: string | null;
}

/**
 * Promedio por eje del alfajor. Campo aditivo pendiente en el back (ver spec
 * 2026-07-27): mientras no lo mande, llega `undefined` y el bloque de barras
 * renderiza su estado apagado, indistinguible de un alfajor sin reseñas.
 */
export interface AlfajorAvgEjes {
  dulzor: number;
  cantidadDDL: number;
  calidadBano: number;
  ratioTapaRelleno: number;
  textura: number;
}

/** Alfajor del catálogo público (`GET /alfajores`, `GET /alfajores/:id`). */
export interface Alfajor {
  id: string;
  nombre: string;
  /** null solo en propuestas PENDING con marca libre (la resuelve el admin). */
  marcaId: string | null;
  marca: AlfajorMarca | null;
  /**
   * Marca pedida en texto libre cuando no estaba en el catálogo. El back la
   * limpia al aprobar, así que solo llega con contenido en la cola PENDING.
   * Opcional: solo lo consume el panel admin.
   */
  marcaNombrePropuesto?: string | null;
  tipo: AlfajorTipo;
  descripcion: string | null;
  imagenUrl: string | null;
  /** Promedio general 0-10 (`GET /alfajores/:id`); null sin reseñas. */
  avgRating?: number | null;
  /** Promedio de los 5 ejes; ausente hasta que el back lo implemente. */
  avgEjes?: AlfajorAvgEjes | null;
  status: AlfajorStatus;
  /** Motivo del rechazo (moderación); null salvo status REJECTED. Opcional: solo lo consume el panel admin. */
  rejectionReason?: string | null;
  /** Usuario que lo propuso; null si lo cargó un admin/seed. Opcional: solo lo consume el panel admin. */
  createdById?: string | null;
  createdAt: string;
}

/**
 * Payload para proponer un alfajor (`POST /alfajores`). El back lo crea en
 * estado PENDING hasta aprobación admin. `descripcion`/`imagenUrl` existen en el
 * contrato pero el form público solo manda los 3 requeridos.
 */
export interface ProposeAlfajorInput {
  nombre: string;
  /** Marca del catálogo. Excluyente con `marcaNombre`: va exactamente una. */
  marcaId?: string;
  /** Marca en texto libre cuando no está en el catálogo. */
  marcaNombre?: string;
  tipo: AlfajorTipo;
}

/** Filtros del listado. `q` busca por nombre (ILIKE en el back). */
export interface AlfajoresQuery {
  q?: string;
  tipo?: AlfajorTipo;
  marcaId?: string;
  page?: number;
  limit?: number;
}

export type PaginatedAlfajores = Paginated<Alfajor>;
