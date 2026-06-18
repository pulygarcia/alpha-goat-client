import type { Paginated } from '@/shared/types/api.types';

/** Autor anidado de la reseña (el back lo trae desde `feat/review-author-in-dto`). */
export interface ReviewAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
  /** Aún no lo expone `GET /reviews` (pendiente back); se trata como `false`. */
  isFollowing?: boolean;
}

/** Los 5 ejes + el rating general, todos 0..10 con 1 decimal. */
export interface ReviewRatings {
  ratingGeneral: number;
  dulzor: number;
  cantidadDDL: number;
  calidadBano: number;
  ratioTapaRelleno: number;
  textura: number;
}

/** Reseña de un alfajor (`GET /reviews`, `GET /reviews/:id`). */
export interface Review extends ReviewRatings {
  id: string;
  userId: string;
  author: ReviewAuthor | null;
  alfajorId: string;
  comentario: string | null;
  fotoUrl: string | null;
  /** Contadores aún no expuestos por `GET /reviews` (pendiente back); default 0. */
  likesCount?: number;
  commentsCount?: number;
  /** Si el usuario actual ya likeó la reseña (`GET /reviews`, false anónimo). */
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Input de creación (`POST /reviews`). `fotoUrl` diferido hasta `uploads`. */
export interface CreateReviewInput extends ReviewRatings {
  alfajorId: string;
  comentario?: string;
  fotoUrl?: string;
}

/** Input de edición (`PATCH /reviews/:id`): todo opcional menos el alfajor (no editable). */
export type UpdateReviewInput = Partial<Omit<CreateReviewInput, 'alfajorId'>>;

/** Filtros del listado (`GET /reviews`). */
export interface ReviewsQuery {
  alfajorId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export type PaginatedReviews = Paginated<Review>;
