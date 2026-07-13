import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useWorstRated } from './useWorstRated';
import { rankingApi } from '../api/ranking.api';
import type { WorstRatedItem } from '../types/ranking.types';

vi.mock('../api/ranking.api', () => ({
  rankingApi: { worst: vi.fn() },
}));

const ITEM: WorstRatedItem = {
  id: 'a1',
  nombre: 'Alfajor Triste',
  tipo: 'CHOCOLATE',
  score: 1.8,
  reviewsCount: 12,
  imagenUrl: null,
  marca: { id: 'm1', nombre: 'Marca X', logoUrl: null },
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useWorstRated', () => {
  beforeEach(() => {
    vi.mocked(rankingApi.worst).mockReset();
  });

  it('returns the worst rated alfajor from GET /ranking/worst', async () => {
    vi.mocked(rankingApi.worst).mockResolvedValue(ITEM);

    const { result } = renderHook(() => useWorstRated(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(ITEM);
    expect(rankingApi.worst).toHaveBeenCalledTimes(1);
  });

  it('resolves null when no alfajor qualifies yet (204)', async () => {
    vi.mocked(rankingApi.worst).mockResolvedValue(null);

    const { result } = renderHook(() => useWorstRated(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(rankingApi.worst).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useWorstRated(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
