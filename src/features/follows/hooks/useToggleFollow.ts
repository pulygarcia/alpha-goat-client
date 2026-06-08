'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { followsApi } from '../api/follows.api';
import type { FeedList } from '@/features/feed/types/feed.types';

/** Prefijo de las queries del feed paginado: ['feed','reviews',{sort,scope,province}]. */
const FEED_REVIEWS_PREFIX = ['feed', 'reviews'] as const;

interface ToggleFollowVars {
  userId: string;
  /** Estado actual: true = ya lo sigo (la acción será unfollow). */
  isFollowing: boolean;
}

type FeedInfinite = InfiniteData<FeedList>;

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

/**
 * Mutación de follow/unfollow con update optimista sobre el cache del feed.
 * El mismo autor puede aparecer en varias filas/páginas: el flip recorre todas
 * las queries `['feed','reviews', ...]` (match por prefijo, todos los sort/scope)
 * y reescribe cada autor que matchee. Rollback en error; invalida al settle.
 */
export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isFollowing }: ToggleFollowVars) =>
      isFollowing ? followsApi.unfollow(userId) : followsApi.follow(userId),

    onMutate: async ({ userId, isFollowing }: ToggleFollowVars) => {
      const filter = { queryKey: FEED_REVIEWS_PREFIX } as const;
      await queryClient.cancelQueries(filter);

      // Snapshot de todas las queries del feed para poder revertir.
      const snapshots = queryClient.getQueriesData<FeedInfinite>(filter);
      const next = !isFollowing;
      for (const [key, data] of snapshots) {
        queryClient.setQueryData<FeedInfinite>(
          key,
          writeIsFollowing(data, userId, next),
        );
      }

      return { snapshots };
    },

    onError: (_err, _vars, context) => {
      // Restaura exactamente el cache previo.
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: FEED_REVIEWS_PREFIX });
    },
  });
}
