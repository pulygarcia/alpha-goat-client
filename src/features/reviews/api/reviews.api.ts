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
};
