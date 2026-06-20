import type { Paginated } from '@/shared/types/api.types';

/** Autor anidado del comentario (el back lo trae desde `feat/comments-author`). */
export interface CommentAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
}

/** Comentario plano sobre una reseña (`GET /reviews/:reviewId/comments`). */
export interface Comment {
  id: string;
  reviewId: string;
  userId: string;
  author: CommentAuthor | null;
  contenido: string;
  likesCount: number;
  /** Si el usuario actual ya likeó este comentario (false anónimo). */
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Input de creación (`POST /reviews/:reviewId/comments`). */
export interface CreateCommentInput {
  contenido: string;
}

/** Filtros del listado (`GET /reviews/:reviewId/comments`). */
export interface CommentsQuery {
  page?: number;
  limit?: number;
}

export type PaginatedComments = Paginated<Comment>;
