import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useGlobalStats } from './useGlobalStats';
import { statsApi } from '../api/stats.api';
import type { GlobalStats } from '../types/stats.types';

vi.mock('../api/stats.api', () => ({
  statsApi: { global: vi.fn() },
}));

const STATS: GlobalStats = {
  reviewsTotal: 10,
  alfajoresTotal: 5,
  usersTotal: 3,
  alfajoresContributedByUsers: 2,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useGlobalStats', () => {
  beforeEach(() => {
    vi.mocked(statsApi.global).mockReset();
    vi.mocked(statsApi.global).mockResolvedValue(STATS);
  });

  it('returns the global stats', async () => {
    const { result } = renderHook(() => useGlobalStats(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(STATS));
    expect(statsApi.global).toHaveBeenCalled();
  });
});
