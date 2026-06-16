import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useRecommendations } from './useRecommendations';
import { recommendationsApi } from '../api/recommendations.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { RecommendationItem } from '../types/recommendations.types';
import type { User } from '@/features/auth/types/auth.types';

vi.mock('../api/recommendations.api', () => ({
  recommendationsApi: { list: vi.fn() },
}));

const USER: User = {
  id: '1',
  email: 'a@b.com',
  username: 'a',
  avatarUrl: null,
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const ITEMS: RecommendationItem[] = [
  {
    id: 'a1',
    nombre: 'Havanna Mixto',
    tipo: 'CHOCOLATE',
    matchPct: 92,
    score: 8.9,
    marca: { id: 'm1', nombre: 'Havanna', logoUrl: null },
  },
];

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useRecommendations', () => {
  beforeEach(() => {
    vi.mocked(recommendationsApi.list).mockReset();
    useAuthStore.setState({ user: null });
  });

  it('fetches recommendations when there is a session', async () => {
    useAuthStore.setState({ user: USER });
    vi.mocked(recommendationsApi.list).mockResolvedValue(ITEMS);

    const { result } = renderHook(() => useRecommendations(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(ITEMS);
    expect(recommendationsApi.list).toHaveBeenCalledTimes(1);
  });

  it('does not call the API when there is no user (auth-only endpoint)', async () => {
    const { result } = renderHook(() => useRecommendations(), { wrapper });

    // Sin sesión la query está deshabilitada: ni fetching ni request.
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(recommendationsApi.list).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('surfaces the error state when the request fails', async () => {
    useAuthStore.setState({ user: USER });
    vi.mocked(recommendationsApi.list).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useRecommendations(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
