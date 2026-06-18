import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useMyAlfajorReview } from './useMyAlfajorReview';
import { reviewsApi } from '../api/reviews.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { PaginatedReviews, Review } from '../types/reviews.types';
import type { User } from '@/features/auth/types/auth.types';

vi.mock('../api/reviews.api', () => ({
  reviewsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const USER: User = {
  id: 'u1',
  email: 'a@b.com',
  username: 'pepe',
  avatarUrl: null,
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const MINE = { id: 'r1', alfajorId: 'a1', userId: 'u1' } as Review;

function page(items: Review[]): PaginatedReviews {
  return { items, total: items.length, page: 1, limit: 1 };
}

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useMyAlfajorReview', () => {
  beforeEach(() => {
    vi.mocked(reviewsApi.list).mockReset();
    useAuthStore.setState({ user: null });
  });

  it('returns the existing review of the current user', async () => {
    useAuthStore.setState({ user: USER });
    vi.mocked(reviewsApi.list).mockResolvedValue(page([MINE]));

    const { result } = renderHook(() => useMyAlfajorReview('a1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MINE);
    expect(reviewsApi.list).toHaveBeenCalledWith({
      alfajorId: 'a1',
      userId: 'u1',
      limit: 1,
    });
  });

  it('returns null when the user has no review for the alfajor', async () => {
    useAuthStore.setState({ user: USER });
    vi.mocked(reviewsApi.list).mockResolvedValue(page([]));

    const { result } = renderHook(() => useMyAlfajorReview('a1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('does not fetch when there is no session', async () => {
    const { result } = renderHook(() => useMyAlfajorReview('a1'), { wrapper });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(reviewsApi.list).not.toHaveBeenCalled();
  });
});
