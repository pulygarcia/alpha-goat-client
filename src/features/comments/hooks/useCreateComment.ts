'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { notifyError } from '@/shared/lib/toast';
import { commentsApi } from '../api/comments.api';
import { reviewCommentsKey } from './useReviewComments';
import type { CreateCommentInput } from '../types/comments.types';
import type { FeedList } from '@/features/feed/types/feed.types';
import type { PaginatedReviews } from '@/features/reviews/types/reviews.types';

/** Prefijos de los caches donde puede aparecer la reseña comentada. */
const FEED_PREFIX = ['feed', 'reviews'] as const;
const REVIEWS_LIST_PREFIX = ['reviews', 'list'] as const;

type FeedInfinite = InfiniteData<FeedList>;
type ReviewsInfinite = InfiniteData<PaginatedReviews>;

/** Suma 1 a `commentsCount` en cada página del cache que matchee `reviewId`. */
function bumpFeedCommentsCount(
  data: FeedInfinite | undefined,
  reviewId: string,
): FeedInfinite | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.id === reviewId
          ? { ...item, commentsCount: item.commentsCount + 1 }
          : item,
      ),
    })),
  };
}

/** Igual que `bumpFeedCommentsCount` pero para `['reviews','list']` (contador opcional). */
function bumpReviewsListCommentsCount(
  data: ReviewsInfinite | undefined,
  reviewId: string,
): ReviewsInfinite | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.id === reviewId
          ? { ...item, commentsCount: (item.commentsCount ?? 0) + 1 }
          : item,
      ),
    })),
  };
}

/**
 * Crea un comentario en una reseña y, al terminar, invalida su listado para
 * que el nuevo comentario aparezca. Sin toast de éxito (acción de bajo peso,
 * el comentario apareciendo en la lista ya es feedback); toast solo en error.
 *
 * Además suma 1 al `commentsCount` cacheado en el feed (`['feed','reviews']`)
 * y en los listados de reseñas (`['reviews','list']`, perfil/alfajor): de
 * donde el `ReviewDetailModal` (abierto desde el feed) lee su vm — sin esto
 * el contador de comentarios quedaba desactualizado hasta refrescar.
 */
export function useCreateComment(reviewId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      commentsApi.create(reviewId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewCommentsKey(reviewId) });

      const feedSnapshots = qc.getQueriesData<FeedInfinite>({
        queryKey: FEED_PREFIX,
      });
      for (const [key, data] of feedSnapshots) {
        qc.setQueryData(key, bumpFeedCommentsCount(data, reviewId));
      }

      const reviewsListSnapshots = qc.getQueriesData<ReviewsInfinite>({
        queryKey: REVIEWS_LIST_PREFIX,
      });
      for (const [key, data] of reviewsListSnapshots) {
        qc.setQueryData(key, bumpReviewsListCommentsCount(data, reviewId));
      }
    },
    onError: () => {
      notifyError('No pudimos publicar el comentario');
    },
  });
}
