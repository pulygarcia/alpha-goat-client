import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
  type InfiniteData,
} from '@tanstack/react-query';
import React from 'react';
import { useCreateComment } from './useCreateComment';
import { reviewCommentsKey } from './useReviewComments';
import { commentsApi } from '../api/comments.api';
import { notifyError } from '@/shared/lib/toast';
import type { Comment } from '../types/comments.types';
import type { FeedItem, FeedList } from '@/features/feed/types/feed.types';
import type {
  PaginatedReviews,
  Review,
} from '@/features/reviews/types/reviews.types';

vi.mock('../api/comments.api', () => ({
  commentsApi: { list: vi.fn(), create: vi.fn() },
}));

vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

const CREATED: Comment = {
  id: 'c1',
  reviewId: 'r1',
  userId: 'u1',
  author: { id: 'u1', username: 'pepe', avatarUrl: null },
  contenido: 'rico',
  likesCount: 0,
  isLiked: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const FEED_KEY = ['feed', 'reviews', { sort: 'recent' }] as const;
const REVIEWS_LIST_KEY = ['reviews', 'list', { alfajorId: 'a1' }] as const;

function makeFeedItem(id: string, commentsCount: number): FeedItem {
  return {
    id,
    author: { id: 'u1', username: 'pepe', avatarUrl: null, isFollowing: false },
    alfajor: {
      id: 'a1',
      nombre: 'Jorgito',
      tipo: 'CHOCOLATE',
      imagenUrl: null,
    },
    marca: { id: 'm1', nombre: 'Havanna', provincia: 'CABA' },
    quote: null,
    photoUrl: null,
    overall: 8,
    axes: {
      dulzor: 8,
      cantidadDDL: 7,
      calidadBano: 9,
      ratioTapaRelleno: 6,
      textura: 8,
    },
    likes: 10,
    isLiked: false,
    commentsCount,
    createdAt: '2026-05-27T00:00:00.000Z',
  };
}

function makeReview(id: string, commentsCount: number): Review {
  return {
    id,
    userId: 'u1',
    author: { id: 'u1', username: 'pepe', avatarUrl: null },
    alfajorId: 'a1',
    ratingGeneral: 8,
    dulzor: 8,
    cantidadDDL: 7,
    calidadBano: 9,
    ratioTapaRelleno: 6,
    textura: 8,
    comentario: null,
    fotoUrl: null,
    commentsCount,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  };
}

function setup(options?: { feed?: FeedItem[]; reviewsList?: Review[] }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryDefaults(['feed', 'reviews'], { enabled: false });
  client.setQueryDefaults(['reviews', 'list'], { enabled: false });
  if (options?.feed) {
    const feedData: InfiniteData<FeedList> = {
      pages: [
        {
          items: options.feed,
          total: options.feed.length,
          page: 1,
          limit: 20,
        },
      ],
      pageParams: [1],
    };
    client.setQueryData(FEED_KEY, feedData);
  }
  if (options?.reviewsList) {
    const reviewsData: InfiniteData<PaginatedReviews> = {
      pages: [
        {
          items: options.reviewsList,
          total: options.reviewsList.length,
          page: 1,
          limit: 10,
        },
      ],
      pageParams: [1],
    };
    client.setQueryData(REVIEWS_LIST_KEY, reviewsData);
  }
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
  const { result } = renderHook(() => useCreateComment('r1'), { wrapper });
  const readFeedCount = () =>
    client.getQueryData<InfiniteData<FeedList>>(FEED_KEY)!.pages[0].items[0]
      .commentsCount;
  const readReviewsListCount = () =>
    client.getQueryData<InfiniteData<PaginatedReviews>>(REVIEWS_LIST_KEY)!
      .pages[0].items[0].commentsCount;
  return { result, client, invalidate, readFeedCount, readReviewsListCount };
}

describe('useCreateComment', () => {
  beforeEach(() => {
    vi.mocked(commentsApi.create).mockReset();
    vi.mocked(notifyError).mockReset();
  });

  it('creates the comment and invalidates the review comments list', async () => {
    vi.mocked(commentsApi.create).mockResolvedValue(CREATED);
    const { result, invalidate } = setup();

    act(() => result.current.mutate({ contenido: 'rico' }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(commentsApi.create).toHaveBeenCalledWith('r1', {
      contenido: 'rico',
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: reviewCommentsKey('r1'),
    });
  });

  it('bumps commentsCount on the cached feed item for the commented review', async () => {
    vi.mocked(commentsApi.create).mockResolvedValue(CREATED);
    const { result, readFeedCount } = setup({
      feed: [makeFeedItem('r1', 3)],
    });

    act(() => result.current.mutate({ contenido: 'rico' }));

    await waitFor(() => expect(readFeedCount()).toBe(4));
  });

  it('bumps commentsCount on the cached reviews-list item for the commented review', async () => {
    vi.mocked(commentsApi.create).mockResolvedValue(CREATED);
    const { result, readReviewsListCount } = setup({
      reviewsList: [makeReview('r1', 2)],
    });

    act(() => result.current.mutate({ contenido: 'rico' }));

    await waitFor(() => expect(readReviewsListCount()).toBe(3));
  });

  it('leaves other reviews untouched in the feed cache', async () => {
    vi.mocked(commentsApi.create).mockResolvedValue(CREATED);
    const { result, client } = setup({
      feed: [makeFeedItem('other-review', 5)],
    });

    act(() => result.current.mutate({ contenido: 'rico' }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      client.getQueryData<InfiniteData<FeedList>>(FEED_KEY)!.pages[0].items[0]
        .commentsCount,
    ).toBe(5);
  });

  it('leaves other reviews untouched in the reviews-list cache', async () => {
    vi.mocked(commentsApi.create).mockResolvedValue(CREATED);
    const { result, client } = setup({
      reviewsList: [makeReview('other-review', 5)],
    });

    act(() => result.current.mutate({ contenido: 'rico' }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      client.getQueryData<InfiniteData<PaginatedReviews>>(REVIEWS_LIST_KEY)!
        .pages[0].items[0].commentsCount,
    ).toBe(5);
  });

  it('does not crash when a matching cache entry has no data yet', async () => {
    vi.mocked(commentsApi.create).mockResolvedValue(CREATED);
    const { result, client } = setup();
    client.setQueryData(FEED_KEY, undefined);
    client.setQueryData(REVIEWS_LIST_KEY, undefined);

    act(() => result.current.mutate({ contenido: 'rico' }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('notifies an error when creation fails', async () => {
    vi.mocked(commentsApi.create).mockRejectedValue(new Error('boom'));
    const { result } = setup();

    act(() => result.current.mutate({ contenido: 'rico' }));

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        'No pudimos publicar el comentario',
      ),
    );
  });
});
