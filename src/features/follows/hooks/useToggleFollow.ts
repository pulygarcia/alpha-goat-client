'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { followsApi } from '../api/follows.api';
import { notifyError } from '@/shared/lib/toast';
import type { FeedList } from '@/features/feed/types/feed.types';
import type { Profile } from '@/features/profile/types/profile.types';
import type { PaginatedReviews } from '@/features/reviews/types/reviews.types';

/** Prefijo de las queries del feed paginado: ['feed','reviews',{sort,scope,province}]. */
const FEED_REVIEWS_PREFIX = ['feed', 'reviews'] as const;
/** Prefijo de las queries de perfil: ['profile', username]. */
const PROFILE_PREFIX = ['profile'] as const;
/** Prefijo de las queries de reseñas por alfajor: ['reviews','list',{alfajorId}] (cards de `/alfajores/[id]`). */
const REVIEWS_LIST_PREFIX = ['reviews', 'list'] as const;

interface ToggleFollowVars {
  userId: string;
  /** Estado actual: true = ya lo sigo (la acción será unfollow). */
  isFollowing: boolean;
}

type FeedInfinite = InfiniteData<FeedList>;
type ReviewsListInfinite = InfiniteData<PaginatedReviews>;

/** Reescribe `isFollowing` para todo autor que matchee `userId` en cada página. */
function writeIsFollowing(
  data: FeedInfinite | undefined,
  userId: string,
  next: boolean,
): FeedInfinite | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.author.id === userId
          ? { ...item, author: { ...item.author, isFollowing: next } }
          : item,
      ),
    })),
  };
}

/** Igual que `writeIsFollowing` pero para `['reviews','list']` (autor nullable). */
function writeReviewsListFollowing(
  data: ReviewsListInfinite | undefined,
  userId: string,
  next: boolean,
): ReviewsListInfinite | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.author?.id === userId
          ? { ...item, author: { ...item.author, isFollowing: next } }
          : item,
      ),
    })),
  };
}

/** Reescribe `isFollowing` + ajusta `followersCount` del perfil que matchee `userId`. */
function writeProfileFollow(
  profile: Profile | undefined,
  userId: string,
  next: boolean,
): Profile | undefined {
  if (!profile || profile.id !== userId) return profile;
  return {
    ...profile,
    isFollowing: next,
    followersCount: profile.followersCount + (next ? 1 : -1),
  };
}

/**
 * Mutación de follow/unfollow con update optimista sobre tres caches:
 * - el feed paginado (`['feed','reviews', ...]`), donde el mismo autor puede
 *   aparecer en varias filas/páginas: el flip recorre todas las queries y
 *   reescribe cada autor que matchee;
 * - el perfil (`['profile', username]`), de donde el `FollowButton` de la página
 *   de perfil lee su estado — sin esto el botón no cambia hasta refrescar;
 * - las reseñas por alfajor (`['reviews','list', {alfajorId}]`), que alimentan
 *   las cards de `/alfajores/[id]` — mismo problema que el perfil.
 * Rollback de los tres en error; invalida los tres al settle.
 */
export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isFollowing }: ToggleFollowVars) =>
      isFollowing ? followsApi.unfollow(userId) : followsApi.follow(userId),

    onMutate: async ({ userId, isFollowing }: ToggleFollowVars) => {
      const feedFilter = { queryKey: FEED_REVIEWS_PREFIX } as const;
      const profileFilter = { queryKey: PROFILE_PREFIX } as const;
      const reviewsListFilter = { queryKey: REVIEWS_LIST_PREFIX } as const;
      await Promise.all([
        queryClient.cancelQueries(feedFilter),
        queryClient.cancelQueries(profileFilter),
        queryClient.cancelQueries(reviewsListFilter),
      ]);

      const next = !isFollowing;

      // Snapshot de los tres caches para poder revertir exactamente.
      const feedSnapshots =
        queryClient.getQueriesData<FeedInfinite>(feedFilter);
      for (const [key, data] of feedSnapshots) {
        queryClient.setQueryData<FeedInfinite>(
          key,
          writeIsFollowing(data, userId, next),
        );
      }

      const profileSnapshots =
        queryClient.getQueriesData<Profile>(profileFilter);
      for (const [key, data] of profileSnapshots) {
        queryClient.setQueryData<Profile>(
          key,
          writeProfileFollow(data, userId, next),
        );
      }

      const reviewsListSnapshots =
        queryClient.getQueriesData<ReviewsListInfinite>(reviewsListFilter);
      for (const [key, data] of reviewsListSnapshots) {
        queryClient.setQueryData<ReviewsListInfinite>(
          key,
          writeReviewsListFollowing(data, userId, next),
        );
      }

      return {
        snapshots: [
          ...feedSnapshots,
          ...profileSnapshots,
          ...reviewsListSnapshots,
        ],
      };
    },

    onError: (_err, _vars, context) => {
      // Restaura exactamente el cache previo (feed + perfil).
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      notifyError('No pudimos actualizar el seguimiento');
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: FEED_REVIEWS_PREFIX });
      void queryClient.invalidateQueries({ queryKey: PROFILE_PREFIX });
      void queryClient.invalidateQueries({ queryKey: REVIEWS_LIST_PREFIX });
    },
  });
}
