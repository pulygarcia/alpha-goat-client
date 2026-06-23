import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useGlobalRanking } from './useGlobalRanking';
import { rankingApi } from '../api/ranking.api';
import type { PaginatedRanking } from '../types/ranking.types';

vi.mock('../api/ranking.api', () => ({
  rankingApi: { global: vi.fn(), weekly: vi.fn() },
}));

const PAGE: PaginatedRanking = {
  items: [
    {
      id: 'a1',
      nombre: 'Jorgito',
      tipo: 'CHOCOLATE',
      score: 9.12,
      reviewsCount: 40,
      marca: { id: 'm1', nombre: 'Jorgito', logoUrl: null },
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useGlobalRanking', () => {
  beforeEach(() => vi.mocked(rankingApi.global).mockReset());

  it('fetches the first page with page 1 and limit 20', async () => {
    vi.mocked(rankingApi.global).mockResolvedValue(PAGE);

    const { result } = renderHook(() => useGlobalRanking(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0]).toEqual(PAGE);
    expect(rankingApi.global).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('exposes hasNextPage when more items remain', async () => {
    vi.mocked(rankingApi.global).mockResolvedValue({ ...PAGE, total: 50 });

    const { result } = renderHook(() => useGlobalRanking(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('has no next page when everything is loaded', async () => {
    vi.mocked(rankingApi.global).mockResolvedValue(PAGE);

    const { result } = renderHook(() => useGlobalRanking(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(rankingApi.global).mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useGlobalRanking(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
