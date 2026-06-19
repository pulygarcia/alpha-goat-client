import { apiClient } from '@/shared/lib/api-client';
import type {
  Comment,
  CommentsQuery,
  CreateCommentInput,
  PaginatedComments,
} from '../types/comments.types';

export const commentsApi = {
  /** GET /reviews/:reviewId/comments (público) — paginado, orden cronológico. */
  list: async (
    reviewId: string,
    params: CommentsQuery = {},
  ): Promise<PaginatedComments> => {
    const res = await apiClient.get<PaginatedComments>(
      `/reviews/${reviewId}/comments`,
      { params },
    );
    return res.data;
  },

  /** POST /reviews/:reviewId/comments (auth) — crea un comentario. */
  create: async (
    reviewId: string,
    input: CreateCommentInput,
  ): Promise<Comment> => {
    const res = await apiClient.post<Comment>(
      `/reviews/${reviewId}/comments`,
      input,
    );
    return res.data;
  },
};
