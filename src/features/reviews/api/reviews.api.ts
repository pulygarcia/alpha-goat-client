import { apiClient } from '@/shared/lib/api-client';
import type {
  CreateReviewInput,
  PaginatedReviews,
  Review,
  ReviewsQuery,
  UpdateReviewInput,
} from '../types/reviews.types';

export const reviewsApi = {
  /** GET /reviews (público) — paginado, filtros `alfajorId`/`userId`. */
  list: async (params: ReviewsQuery = {}): Promise<PaginatedReviews> => {
    const res = await apiClient.get<PaginatedReviews>('/reviews', { params });
    return res.data;
  },

  /** POST /reviews (auth) — crea una reseña. 409 si el usuario ya reseñó el alfajor. */
  create: async (input: CreateReviewInput): Promise<Review> => {
    const res = await apiClient.post<Review>('/reviews', input);
    return res.data;
  },

  /** PATCH /reviews/:id (auth) — edita la reseña propia (no el alfajor). */
  update: async (id: string, input: UpdateReviewInput): Promise<Review> => {
    const res = await apiClient.patch<Review>(`/reviews/${id}`, input);
    return res.data;
  },

  /** DELETE /reviews/:id (auth) — borra la reseña propia. Resuelve en 204. */
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },

  /** PUT /reviews/:id/like (auth) — likea la reseña. Idempotente, 204. */
  like: async (id: string): Promise<void> => {
    await apiClient.put(`/reviews/${id}/like`);
  },

  /** DELETE /reviews/:id/like (auth) — quita el like. 204. */
  unlike: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}/like`);
  },

  /**
   * POST /reviews/:id/foto (auth, solo autor) — sube la foto de la reseña
   * (multipart campo `file`). Override de `Content-Type` porque el default del
   * client es `application/json`. Devuelve la reseña con la `fotoUrl` nueva.
   */
  uploadPhoto: async (id: string, file: File): Promise<Review> => {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post<Review>(`/reviews/${id}/foto`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
