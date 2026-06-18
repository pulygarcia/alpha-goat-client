import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
  type InfiniteData,
} from '@tanstack/react-query';
import React from 'react';
import { useToggleLike } from './useToggleLike';
import { reviewsApi } from '../api/reviews.api';
import { notifyError } from '@/shared/lib/toast';
import type { FeedItem, FeedList } from '@/features/feed/types/feed.types';
import type { PaginatedReviews, Review } from '../types/reviews.types';

vi.mock('../api/reviews.api', () => ({
  reviewsApi: { like: vi.fn(), unlike: vi.fn() },
}));
vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

const FEED_KEY = [
  'feed',
  'reviews',
  { sort: 'recent', scope: null, province: null },
] as const;
const REVIEWS_KEY = ['reviews', 'list', { alfajorId: 'a1' }] as const;

function feedItem(id: string, likes: number, isLiked: boolean): FeedItem {
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
    likes,
    isLiked,
    commentsCount: 2,
    createdAt: '2026-05-27T00:00:00.000Z',
  };
}

function review(id: string, likesCount: number, isLiked: boolean): Review {
  return {
    id,
    userId: 'u1',
    author: null,
    alfajorId: 'a1',
    comentario: null,
    fotoUrl: null,
    ratingGeneral: 8,
    dulzor: 8,
    cantidadDDL: 7,
    calidadBano: 9,
    ratioTapaRelleno: 6,
    textura: 8,
    likesCount,
    commentsCount: 0,
    isLiked,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  };
}

function seedFeed(items: FeedItem[]): InfiniteData<FeedList> {
  return {
    pages: [{ items, total: items.length, page: 1, limit: 20 }],
    pageParams: [1],
  };
}
function seedReviews(items: Review[]): InfiniteData<PaginatedReviews> {
  return {
    pages: [{ items, total: items.length, page: 1, limit: 10 }],
    pageParams: [1],
  };
}

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  client.setQueryDefaults(['feed', 'reviews'], { enabled: false });
  client.setQueryDefaults(['reviews', 'list'], { enabled: false });
  client.setQueryData(FEED_KEY, seedFeed([feedItem('r1', 3, false)]));
  client.setQueryData(REVIEWS_KEY, seedReviews([review('r1', 3, false)]));

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);

  const { result } = renderHook(() => useToggleLike(), { wrapper });
  const feedRow = () =>
    client.getQueryData<InfiniteData<FeedList>>(FEED_KEY)!.pages[0].items[0];
  const reviewRow = () =>
    client.getQueryData<InfiniteData<PaginatedReviews>>(REVIEWS_KEY)!.pages[0]
      .items[0];
  return { result, client, feedRow, reviewRow };
}

describe('useToggleLike', () => {
  beforeEach(() => {
    vi.mocked(reviewsApi.like).mockReset();
    vi.mocked(reviewsApi.unlike).mockReset();
    vi.mocked(notifyError).mockReset();
  });

  it('optimistically likes in both caches and calls like()', async () => {
    vi.mocked(reviewsApi.like).mockResolvedValue();
    const { result, feedRow, reviewRow } = setup();

    act(() => {
      result.current.mutate({ reviewId: 'r1', isLiked: false });
    });

    await waitFor(() => expect(feedRow().isLiked).toBe(true));
    expect(feedRow().likes).toBe(4);
    expect(reviewRow().isLiked).toBe(true);
    expect(reviewRow().likesCount).toBe(4);
    expect(reviewsApi.like).toHaveBeenCalledWith('r1');
    expect(reviewsApi.unlike).not.toHaveBeenCalled();
  });

  it('calls unlike() and decrements when already liked', async () => {
    vi.mocked(reviewsApi.unlike).mockResolvedValue();
    const { result, client, feedRow } = setup();
    client.setQueryData(FEED_KEY, seedFeed([feedItem('r1', 3, true)]));

    act(() => {
      result.current.mutate({ reviewId: 'r1', isLiked: true });
    });

    await waitFor(() => expect(feedRow().isLiked).toBe(false));
    expect(feedRow().likes).toBe(2);
    expect(reviewsApi.unlike).toHaveBeenCalledWith('r1');
  });

  it('rolls back both caches and toasts on error', async () => {
    vi.mocked(reviewsApi.like).mockRejectedValue(new Error('boom'));
    const { result, feedRow, reviewRow } = setup();

    act(() => {
      result.current.mutate({ reviewId: 'r1', isLiked: false });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(feedRow().isLiked).toBe(false);
    expect(feedRow().likes).toBe(3);
    expect(reviewRow().likesCount).toBe(3);
    expect(notifyError).toHaveBeenCalledWith('No pudimos actualizar el like');
  });
});
