import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUserReviews } from './useUserReviews';
import { reviewsApi } from '@/features/reviews/api/reviews.api';
import type { PaginatedReviews } from '@/features/reviews/types/reviews.types';

vi.mock('@/features/reviews/api/reviews.api', () => ({
  reviewsApi: { list: vi.fn() },
}));

const PAGE: PaginatedReviews = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useUserReviews', () => {
  beforeEach(() => vi.mocked(reviewsApi.list).mockReset());

  it('fetches the first page filtered by userId', async () => {
    vi.mocked(reviewsApi.list).mockResolvedValue(PAGE);

    const { result } = renderHook(() => useUserReviews('u1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reviewsApi.list).toHaveBeenCalledWith({
      userId: 'u1',
      page: 1,
      limit: 10,
    });
  });

  it('is disabled when no userId is provided', () => {
    const { result } = renderHook(() => useUserReviews(''), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(reviewsApi.list).not.toHaveBeenCalled();
  });

  it('exposes hasNextPage when more items remain', async () => {
    vi.mocked(reviewsApi.list).mockResolvedValue({ ...PAGE, total: 30 });

    const { result } = renderHook(() => useUserReviews('u1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });
});
