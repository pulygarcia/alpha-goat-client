import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFeedStats } from './useFeedStats';
import { feedApi } from '../api/feed.api';

vi.mock('../api/feed.api', () => ({
  feedApi: { stats: vi.fn() },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useFeedStats', () => {
  beforeEach(() => {
    vi.mocked(feedApi.stats).mockReset();
  });

  it('returns the counters from GET /feed/stats', async () => {
    vi.mocked(feedApi.stats).mockResolvedValue({
      todayCount: 7,
      weekCount: 42,
    });

    const { result } = renderHook(() => useFeedStats(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ todayCount: 7, weekCount: 42 });
    expect(feedApi.stats).toHaveBeenCalledTimes(1);
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(feedApi.stats).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useFeedStats(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
