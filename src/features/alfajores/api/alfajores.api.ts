import { apiClient } from '@/shared/lib/api-client';
import type {
  Alfajor,
  AlfajoresQuery,
  PaginatedAlfajores,
  ProposeAlfajorInput,
} from '../types/alfajores.types';

export const alfajoresApi = {
  /**
   * GET /alfajores (público)
   * Catálogo paginado. Filtros opcionales `q` (nombre), `tipo`, `marcaId`.
   * El back fuerza `status: APPROVED` para no-admins.
   */
  list: async (params: AlfajoresQuery = {}): Promise<PaginatedAlfajores> => {
    const res = await apiClient.get<PaginatedAlfajores>('/alfajores', {
      params,
    });
    return res.data;
  },

  /**
   * GET /alfajores/:id (público)
   * Detalle de un alfajor con su `marca` anidada.
   */
  byId: async (id: string): Promise<Alfajor> => {
    const res = await apiClient.get<Alfajor>(`/alfajores/${id}`);
    return res.data;
  },

  /**
   * POST /alfajores (auth) — propone un alfajor nuevo. El back lo crea en estado
   * PENDING (hasta aprobación admin) con el usuario como `createdById`. Tira 409
   * si ya existe ese nombre para esa marca, 404 si la marca no existe.
   */
  create: async (input: ProposeAlfajorInput): Promise<Alfajor> => {
    const res = await apiClient.post<Alfajor>('/alfajores', input);
    return res.data;
  },

  /**
   * POST /alfajores/:id/imagen (auth, multipart) — sube la foto en el campo
   * `file`. El back reemplaza el asset (publicId determinístico) y devuelve el
   * `Alfajor` actualizado con `imagenUrl`. Override de `Content-Type` a multipart
   * porque el default global del client es JSON (mismo fix que el avatar).
   */
  uploadImage: async (id: string, file: File): Promise<Alfajor> => {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post<Alfajor>(`/alfajores/${id}/imagen`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
