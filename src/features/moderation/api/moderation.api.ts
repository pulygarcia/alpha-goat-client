import { apiClient } from '@/shared/lib/api-client';
import type {
  Alfajor,
  PaginatedAlfajores,
} from '@/features/alfajores/types/alfajores.types';

export interface ModerationQueueQuery {
  page?: number;
  limit?: number;
}

export const moderationApi = {
  /**
   * GET /admin/alfajores/pending (ADMIN)
   * Cola paginada de alfajores en estado PENDING esperando moderación.
   */
  getPending: async (
    params: ModerationQueueQuery = {},
  ): Promise<PaginatedAlfajores> => {
    const res = await apiClient.get<PaginatedAlfajores>(
      '/admin/alfajores/pending',
      { params },
    );
    return res.data;
  },

  /**
   * PATCH /admin/alfajores/:id/approve (ADMIN)
   * PENDING → APPROVED. 400 si el alfajor ya no está PENDING.
   */
  approve: async (id: string): Promise<Alfajor> => {
    const res = await apiClient.patch<Alfajor>(
      `/admin/alfajores/${id}/approve`,
    );
    return res.data;
  },

  /**
   * PATCH /admin/alfajores/:id/reject (ADMIN)
   * PENDING → REJECTED guardando el motivo (1–500). 400 si ya no está PENDING.
   */
  reject: async (id: string, rejectionReason: string): Promise<Alfajor> => {
    const res = await apiClient.patch<Alfajor>(
      `/admin/alfajores/${id}/reject`,
      { rejectionReason },
    );
    return res.data;
  },
};
