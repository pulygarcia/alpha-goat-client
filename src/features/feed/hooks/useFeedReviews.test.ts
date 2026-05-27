import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFeedReviews } from './useFeedReviews';
import { feedApi } from '../api/feed.api';
import type { FeedList } from '../types/feed.types';

vi.mock('../api/feed.api', () => ({
  feedApi: { list: vi.fn() },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

function page(over: Partial<FeedList> = {}): FeedList {
  return { items: [], total: 0, page: 1, limit: 20, ...over };
}

describe('useFeedReviews', () => {
  beforeEach(() => {
    vi.mocked(feedApi.list).mockReset();
  });

  it('fetches the first page with the given sort', async () => {
    vi.mocked(feedApi.list).mockResolvedValue(page({ total: 1 }));

    const { result } = renderHook(() => useFeedReviews({ sort: 'likes' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(feedApi.list).toHaveBeenCalledWith({
      sort: 'likes',
      scope: undefined,
      province: undefined,
      page: 1,
      limit: 20,
    });
  });

  it('exposes hasNextPage when there are more items than loaded', async () => {
    vi.mocked(feedApi.list).mockResolvedValue(page({ total: 50, limit: 20 }));

    const { result } = renderHook(() => useFeedReviews({ sort: 'recent' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('stops paginating once the total is covered', async () => {
    vi.mocked(feedApi.list).mockResolvedValue(page({ total: 10, limit: 20 }));

    const { result } = renderHook(() => useFeedReviews({ sort: 'recent' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('requests the next page number on fetchNextPage', async () => {
    vi.mocked(feedApi.list).mockResolvedValue(page({ total: 50, limit: 20 }));

    const { result } = renderHook(() => useFeedReviews({ sort: 'recent' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(feedApi.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });
});
