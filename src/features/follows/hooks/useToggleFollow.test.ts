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
import { notifyError } from '@/shared/lib/toast';
import type { FeedItem, FeedList } from '@/features/feed/types/feed.types';
import type { Profile } from '@/features/profile/types/profile.types';
import type {
  PaginatedReviews,
  Review,
} from '@/features/reviews/types/reviews.types';

vi.mock('../api/follows.api', () => ({
  followsApi: { follow: vi.fn(), unfollow: vi.fn() },
}));

vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
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
    isLiked: false,
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

function makeProfile(
  id: string,
  isFollowing: boolean,
  followersCount: number,
): Profile {
  return {
    id,
    username: 'pepe',
    avatarUrl: null,
    role: 'USER',
    createdAt: '2026-01-01T00:00:00.000Z',
    followersCount,
    followingCount: 3,
    reviewsCount: 4,
    isFollowing,
    commentsCount: 0,
    alfajoresAddedCount: 0,
    likesReceivedCount: 0,
    avgScore: null,
  };
}

const PROFILE_KEY = ['profile', 'pepe'] as const;
const REVIEWS_LIST_KEY = ['reviews', 'list', { alfajorId: 'a1' }] as const;

function makeReview(
  id: string,
  authorId: string,
  isFollowing: boolean,
): Review {
  return {
    id,
    userId: authorId,
    author: { id: authorId, username: 'pepe', avatarUrl: null, isFollowing },
    alfajorId: 'a1',
    ratingGeneral: 8,
    dulzor: 8,
    cantidadDDL: 7,
    calidadBano: 9,
    ratioTapaRelleno: 6,
    textura: 8,
    comentario: null,
    fotoUrl: null,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  };
}

function seedReviewsList(items: Review[]): InfiniteData<PaginatedReviews> {
  return {
    pages: [{ items, total: items.length, page: 1, limit: 10 }],
    pageParams: [1],
  };
}

function setup(
  initialFeed: InfiniteData<FeedList>,
  initialProfile?: Profile,
  initialReviewsList?: InfiniteData<PaginatedReviews>,
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // Evita refetch real en onSettled (no hay queryFn registrada aquí).
  client.setQueryDefaults(['feed', 'reviews'], { enabled: false });
  client.setQueryDefaults(['profile'], { enabled: false });
  client.setQueryDefaults(['reviews', 'list'], { enabled: false });
  const key = FEED_KEY;
  client.setQueryData(key, initialFeed);
  if (initialProfile) client.setQueryData(PROFILE_KEY, initialProfile);
  if (initialReviewsList)
    client.setQueryData(REVIEWS_LIST_KEY, initialReviewsList);

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);

  const { result } = renderHook(() => useToggleFollow(), { wrapper });
  const readFollowing = () =>
    client.getQueryData<InfiniteData<FeedList>>(key)!.pages[0].items[0].author
      .isFollowing;
  const readProfile = () => client.getQueryData<Profile>(PROFILE_KEY)!;
  const readReviewsListFollowing = () =>
    client.getQueryData<InfiniteData<PaginatedReviews>>(REVIEWS_LIST_KEY)!
      .pages[0].items[0].author?.isFollowing;

  return {
    result,
    client,
    key,
    readFollowing,
    readProfile,
    readReviewsListFollowing,
  };
}

describe('useToggleFollow', () => {
  beforeEach(() => {
    vi.mocked(followsApi.follow).mockReset();
    vi.mocked(followsApi.unfollow).mockReset();
    vi.mocked(notifyError).mockReset();
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

  it('flips isFollowing and bumps the followers count on the cached profile', async () => {
    vi.mocked(followsApi.follow).mockResolvedValue();
    const { result, readProfile } = setup(
      seedFeed([makeItem('1', 'u1', false)]),
      makeProfile('u1', false, 5),
    );

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: false });
    });

    await waitFor(() => expect(readProfile().isFollowing).toBe(true));
    expect(readProfile().followersCount).toBe(6);
  });

  it('decrements the followers count when unfollowing from the profile', async () => {
    vi.mocked(followsApi.unfollow).mockResolvedValue();
    const { result, readProfile } = setup(
      seedFeed([makeItem('1', 'u1', true)]),
      makeProfile('u1', true, 5),
    );

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: true });
    });

    await waitFor(() => expect(readProfile().isFollowing).toBe(false));
    expect(readProfile().followersCount).toBe(4);
  });

  it('flips isFollowing on the reviews-list cache used by the alfajor detail cards', async () => {
    vi.mocked(followsApi.follow).mockResolvedValue();
    const { result, readReviewsListFollowing } = setup(
      seedFeed([makeItem('1', 'u1', false)]),
      undefined,
      seedReviewsList([makeReview('r1', 'u1', false)]),
    );

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: false });
    });

    await waitFor(() => expect(readReviewsListFollowing()).toBe(true));
  });

  it('rolls back the reviews-list cache on error', async () => {
    vi.mocked(followsApi.follow).mockRejectedValue(new Error('boom'));
    const { result, readReviewsListFollowing } = setup(
      seedFeed([makeItem('1', 'u1', false)]),
      undefined,
      seedReviewsList([makeReview('r1', 'u1', false)]),
    );

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: false });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(readReviewsListFollowing()).toBe(false);
  });

  it('leaves reviews from other authors untouched on the reviews-list cache', async () => {
    vi.mocked(followsApi.follow).mockResolvedValue();
    const { result, client } = setup(
      seedFeed([makeItem('1', 'u1', false)]),
      undefined,
      seedReviewsList([makeReview('r1', 'other-user', false)]),
    );

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      client.getQueryData<InfiniteData<PaginatedReviews>>(REVIEWS_LIST_KEY)!
        .pages[0].items[0].author?.isFollowing,
    ).toBe(false);
  });

  it('does not crash when the reviews-list cache entry has no data yet', async () => {
    vi.mocked(followsApi.follow).mockResolvedValue();
    const { result, client } = setup(seedFeed([makeItem('1', 'u1', false)]));
    client.setQueryData(REVIEWS_LIST_KEY, undefined);

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('rolls back the profile cache on error', async () => {
    vi.mocked(followsApi.follow).mockRejectedValue(new Error('boom'));
    const { result, readProfile } = setup(
      seedFeed([makeItem('1', 'u1', false)]),
      makeProfile('u1', false, 5),
    );

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: false });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(readProfile().isFollowing).toBe(false);
    expect(readProfile().followersCount).toBe(5);
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

  it('notifica error cuando falla el toggle', async () => {
    vi.mocked(followsApi.follow).mockRejectedValue(new Error('boom'));
    const { result } = setup(seedFeed([makeItem('1', 'u1', false)]));

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: false });
    });

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        'No pudimos actualizar el seguimiento',
      ),
    );
  });

  it('no notifica nada en éxito (acción silenciosa)', async () => {
    vi.mocked(followsApi.follow).mockResolvedValue();
    const { result, readFollowing } = setup(
      seedFeed([makeItem('1', 'u1', false)]),
    );

    act(() => {
      result.current.mutate({ userId: 'u1', isFollowing: false });
    });

    await waitFor(() => expect(readFollowing()).toBe(true));
    expect(notifyError).not.toHaveBeenCalled();
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
