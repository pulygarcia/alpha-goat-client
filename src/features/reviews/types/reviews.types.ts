import type { Paginated } from '@/shared/types/api.types';
import type { AlfajorTipo } from '@/shared/types/alfajor';

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
/** Alfajor anidado en la reseña (lo trae `GET /reviews` cuando carga la relación). */
export interface ReviewAlfajor {
  id: string;
  nombre: string;
  tipo: AlfajorTipo;
  // Opcional: el back todavía no lo anida en `GET /reviews` (pendiente). Cuando
  // lo haga, el card del perfil mostrará la imagen del alfajor en vez del tipo.
  imagenUrl?: string | null;
}

/** Marca del alfajor reseñado (anidada junto al alfajor). */
export interface ReviewMarca {
  nombre: string;
  provincia: string | null;
}

export interface Review extends ReviewRatings {
  id: string;
  userId: string;
  author: ReviewAuthor | null;
  alfajorId: string;
  /** Alfajor/marca anidados cuando el back carga la relación (perfil/feed); `undefined` si no. */
  alfajor?: ReviewAlfajor;
  marca?: ReviewMarca;
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
