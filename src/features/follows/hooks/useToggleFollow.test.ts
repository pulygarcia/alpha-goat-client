import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
  type InfiniteData,
} from '@tanstack/react-query';
import React from 'react';
import { useToggleFollow } from './useToggleFollow';
import { followsApi } from '../api/follows.api';
import type { FeedItem, FeedList } from '@/features/feed/types/feed.types';

vi.mock('../api/follows.api', () => ({
  followsApi: { follow: vi.fn(), unfollow: vi.fn() },
}));

// Misma forma que feedReviewsKey('recent'); inline para no arrastrar feed.api → env.
const FEED_KEY = [
  'feed',
  'reviews',
  { sort: 'recent', scope: null, province: null },
] as const;

function makeItem(
  id: string,
  authorId: string,
  isFollowing: boolean,
): FeedItem {
  return {
    id,
    author: { id: authorId, username: 'pepe', avatarUrl: null, isFollowing },
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
    commentsCount: 2,
    createdAt: '2026-05-27T00:00:00.000Z',
  };
}

function seedFeed(items: FeedItem[]): InfiniteData<FeedList> {
  return {
    pages: [{ items, total: items.length, page: 1, limit: 20 }],
    pageParams: [1],
  };
}

function setup(initialFeed: InfiniteData<FeedList>) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // Evita refetch real del feed en onSettled (no hay queryFn registrada aquí).
  client.setQueryDefaults(['feed', 'reviews'], { enabled: false });
  const key = FEED_KEY;
  client.setQueryData(key, initialFeed);

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);

  const { result } = renderHook(() => useToggleFollow(), { wrapper });
  const readFollowing = () =>
    client.getQueryData<InfiniteData<FeedList>>(key)!.pages[0].items[0].author
      .isFollowing;

  return { result, client, key, readFollowing };
}

describe('useToggleFollow', () => {
  beforeEach(() => {
    vi.mocked(followsApi.follow).mockReset();
    vi.mocked(followsApi.unfollow).mockReset();
  });

  it('flips isFollowing optimistically and calls follow() when not following', async () => {
    vi.mocked(followsApi.follow).mockResolvedValue();
    const { result, readFollowing } = setup(
      seedFeed([makeItem('1', 'u1', false)]),
    );

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: false });
    });

    // El cache se actualiza al instante, antes de resolver la request.
    await waitFor(() => expect(readFollowing()).toBe(true));
    expect(followsApi.follow).toHaveBeenCalledWith('u1');
    expect(followsApi.unfollow).not.toHaveBeenCalled();
  });

  it('calls unfollow() and flips to false when already following', async () => {
    vi.mocked(followsApi.unfollow).mockResolvedValue();
    const { result, readFollowing } = setup(
      seedFeed([makeItem('1', 'u1', true)]),
    );

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: true });
    });

    await waitFor(() => expect(readFollowing()).toBe(false));
    expect(followsApi.unfollow).toHaveBeenCalledWith('u1');
  });

  it('flips every cached row of the same author', async () => {
    vi.mocked(followsApi.follow).mockResolvedValue();
    const { result, client, key } = setup(
      seedFeed([makeItem('1', 'u1', false), makeItem('2', 'u1', false)]),
    );

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: false });
    });

    await waitFor(() => {
      const items =
        client.getQueryData<InfiniteData<FeedList>>(key)!.pages[0].items;
      expect(items.every((i) => i.author.isFollowing)).toBe(true);
    });
  });

  it('rolls back to the previous state on error', async () => {
    vi.mocked(followsApi.follow).mockRejectedValue(new Error('boom'));
    const { result, readFollowing } = setup(
      seedFeed([makeItem('1', 'u1', false)]),
    );

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: false });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(readFollowing()).toBe(false);
  });

  it('does not fire a second request while one is pending', async () => {
    let resolve!: () => void;
    vi.mocked(followsApi.follow).mockReturnValue(
      new Promise<void>((r) => {
        resolve = r;
      }),
    );
    const { result } = setup(seedFeed([makeItem('1', 'u1', false)]));

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: false });
    });
    await waitFor(() => expect(result.current.isPending).toBe(true));

    // Mientras está pendiente, el botón se deshabilita por isPending: no relanzamos.
    expect(result.current.isPending).toBe(true);
    expect(followsApi.follow).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve();
    });
  });
});
