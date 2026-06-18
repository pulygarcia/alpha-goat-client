'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews.api';
import { notifyError } from '@/shared/lib/toast';
import type { FeedList } from '@/features/feed/types/feed.types';
import type { PaginatedReviews } from '../types/reviews.types';

/** Prefijos de los caches donde puede aparecer una reseña likeable. */
const FEED_PREFIX = ['feed', 'reviews'] as const;
const REVIEWS_LIST_PREFIX = ['reviews', 'list'] as const;

interface ToggleLikeVars {
  reviewId: string;
  /** Estado actual: true = ya likeada (la acción será unlike). */
  isLiked: boolean;
}

type FeedInfinite = InfiniteData<FeedList>;
type ReviewsInfinite = InfiniteData<PaginatedReviews>;

const delta = (next: boolean) => (next ? 1 : -1);

/** Reescribe `isLiked` + `likes` en el cache del feed (`FeedItem`). */
function writeFeedLike(
  data: FeedInfinite | undefined,
  reviewId: string,
  next: boolean,
): FeedInfinite | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.id === reviewId
          ? { ...item, isLiked: next, likes: item.likes + delta(next) }
          : item,
      ),
    })),
  };
}

/** Reescribe `isLiked` + `likesCount` en el listado del detalle (`Review`). */
function writeReviewLike(
  data: ReviewsInfinite | undefined,
  reviewId: string,
  next: boolean,
): ReviewsInfinite | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.id === reviewId
          ? {
              ...item,
              isLiked: next,
              likesCount: (item.likesCount ?? 0) + delta(next),
            }
          : item,
      ),
    })),
  };
}

/**
 * Like/unlike de una reseña con update optimista. La reseña puede estar cacheada
 * en el feed (`['feed','reviews', ...]`) y/o en el listado del detalle
 * (`['reviews','list', ...]`): el flip recorre ambos por prefijo y reescribe
 * `isLiked` + el contador en cada uno. Rollback en error (+ toast); invalida al settle.
 */
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, isLiked }: ToggleLikeVars) =>
      isLiked ? reviewsApi.unlike(reviewId) : reviewsApi.like(reviewId),

    onMutate: async ({ reviewId, isLiked }: ToggleLikeVars) => {
      const next = !isLiked;
      await queryClient.cancelQueries({ queryKey: FEED_PREFIX });
      await queryClient.cancelQueries({ queryKey: REVIEWS_LIST_PREFIX });

      const feedSnapshots = queryClient.getQueriesData<FeedInfinite>({
        queryKey: FEED_PREFIX,
      });
      const reviewSnapshots = queryClient.getQueriesData<ReviewsInfinite>({
        queryKey: REVIEWS_LIST_PREFIX,
      });

      for (const [key, data] of feedSnapshots) {
        queryClient.setQueryData(key, writeFeedLike(data, reviewId, next));
      }
      for (const [key, data] of reviewSnapshots) {
        queryClient.setQueryData(key, writeReviewLike(data, reviewId, next));
      }

      return { feedSnapshots, reviewSnapshots };
    },

    onError: (_err, _vars, context) => {
      context?.feedSnapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      context?.reviewSnapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      notifyError('No pudimos actualizar el like');
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: FEED_PREFIX });
      void queryClient.invalidateQueries({ queryKey: REVIEWS_LIST_PREFIX });
    },
  });
}
