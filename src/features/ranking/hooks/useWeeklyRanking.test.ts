import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useWeeklyRanking } from './useWeeklyRanking';
import { rankingApi } from '../api/ranking.api';
import type { WeeklyRankingItem } from '../types/ranking.types';

vi.mock('../api/ranking.api', () => ({
  rankingApi: { weekly: vi.fn() },
}));

const ITEMS: WeeklyRankingItem[] = [
  {
    id: 'a1',
    nombre: 'Cachafaz Negro Triple',
    score: 8.7,
    trend: 'up',
    marca: { id: 'm1', nombre: 'Cachafaz', logoUrl: null },
  },
  {
    id: 'a2',
    nombre: 'Capitán del Espacio',
    score: 8.5,
    trend: 'new',
    marca: { id: 'm2', nombre: 'Capitán', logoUrl: null },
  },
];

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useWeeklyRanking', () => {
  beforeEach(() => {
    vi.mocked(rankingApi.weekly).mockReset();
  });

  it('returns the weekly ranking from GET /ranking/weekly', async () => {
    vi.mocked(rankingApi.weekly).mockResolvedValue(ITEMS);

    const { result } = renderHook(() => useWeeklyRanking(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(ITEMS);
    expect(rankingApi.weekly).toHaveBeenCalledTimes(1);
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(rankingApi.weekly).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useWeeklyRanking(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
