import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFeedHero } from './useFeedHero';
import { feedApi } from '../api/feed.api';

vi.mock('../api/feed.api', () => ({
  feedApi: { hero: vi.fn() },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useFeedHero', () => {
  beforeEach(() => {
    vi.mocked(feedApi.hero).mockReset();
  });

  it('returns the hero pick from the API', async () => {
    const hero = { alfajor: { id: '1' } };
    vi.mocked(feedApi.hero).mockResolvedValue(hero as never);

    const { result } = renderHook(() => useFeedHero(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(feedApi.hero).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(hero);
  });

  it('maps an empty feed (null) without error', async () => {
    vi.mocked(feedApi.hero).mockResolvedValue(null as never);

    const { result } = renderHook(() => useFeedHero(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});
