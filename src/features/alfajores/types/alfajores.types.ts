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

/** Alfajor del catálogo público (`GET /alfajores`, `GET /alfajores/:id`). */
export interface Alfajor {
  id: string;
  nombre: string;
  marcaId: string;
  marca: AlfajorMarca | null;
  tipo: AlfajorTipo;
  descripcion: string | null;
  imagenUrl: string | null;
  status: AlfajorStatus;
  createdAt: string;
}

/**
 * Payload para proponer un alfajor (`POST /alfajores`). El back lo crea en
 * estado PENDING hasta aprobación admin. `descripcion`/`imagenUrl` existen en el
 * contrato pero el form público solo manda los 3 requeridos.
 */
export interface ProposeAlfajorInput {
  nombre: string;
  marcaId: string;
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
