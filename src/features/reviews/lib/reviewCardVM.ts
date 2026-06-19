import type { AlfajorTipo } from '@/shared/types/alfajor';
import type { FeedItem } from '@/features/feed/types/feed.types';
import type { Review } from '../types/reviews.types';

/** Los 5 ejes (sin el general, que va aparte en `overall`). */
export interface ReviewCardAxes {
  dulzor: number;
  cantidadDDL: number;
  calidadBano: number;
  ratioTapaRelleno: number;
  textura: number;
}

/**
 * View-model común del card de reseña: normaliza el `FeedItem` del feed y el
 * `Review` del detalle a una sola forma para que un único componente los pinte.
 * En el detalle `alfajor`/`marca` van en null (son redundantes: ya estamos en
 * la página del alfajor) y el card los oculta.
 */
export interface ReviewCardVM {
  id: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
    isFollowing: boolean;
  };
  alfajor: { id: string; nombre: string; tipo: AlfajorTipo } | null;
  marca: { nombre: string; provincia: string | null } | null;
  quote: string | null;
  photoUrl: string | null;
  overall: number;
  axes: ReviewCardAxes;
  likes: number;
  isLiked: boolean;
  commentsCount: number;
  createdAt: string;
}

export function feedItemToVM(item: FeedItem): ReviewCardVM {
  return {
    id: item.id,
    author: { ...item.author },
    alfajor: {
      id: item.alfajor.id,
      nombre: item.alfajor.nombre,
      tipo: item.alfajor.tipo,
    },
    marca: { nombre: item.marca.nombre, provincia: item.marca.provincia },
    quote: item.quote,
    photoUrl: item.photoUrl,
    overall: item.overall,
    axes: { ...item.axes },
    likes: item.likes,
    isLiked: item.isLiked,
    commentsCount: item.commentsCount,
    createdAt: item.createdAt,
  };
}

export function reviewToVM(review: Review): ReviewCardVM {
  return {
    id: review.id,
    author: {
      id: review.author?.id ?? '',
      username: review.author?.username ?? 'Anónimo',
      avatarUrl: review.author?.avatarUrl ?? null,
      isFollowing: review.author?.isFollowing ?? false,
    },
    alfajor: null,
    marca: null,
    quote: review.comentario,
    photoUrl: review.fotoUrl,
    overall: review.ratingGeneral,
    axes: {
      dulzor: review.dulzor,
      cantidadDDL: review.cantidadDDL,
      calidadBano: review.calidadBano,
      ratioTapaRelleno: review.ratioTapaRelleno,
      textura: review.textura,
    },
    likes: review.likesCount ?? 0,
    isLiked: review.isLiked ?? false,
    commentsCount: review.commentsCount ?? 0,
    createdAt: review.createdAt,
  };
}
