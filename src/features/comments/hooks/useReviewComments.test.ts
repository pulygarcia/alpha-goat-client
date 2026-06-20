import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useReviewComments } from './useReviewComments';
import { commentsApi } from '../api/comments.api';
import type { PaginatedComments } from '../types/comments.types';

vi.mock('../api/comments.api', () => ({
  commentsApi: { list: vi.fn(), create: vi.fn() },
}));

const PAGE: PaginatedComments = {
  items: [
    {
      id: 'c1',
      reviewId: 'r1',
      userId: 'u1',
      author: { id: 'u1', username: 'pepe', avatarUrl: null },
      contenido: 'rico',
      likesCount: 0,
      isLiked: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useReviewComments', () => {
  beforeEach(() => vi.mocked(commentsApi.list).mockReset());

  it('fetches the first page of comments for the review', async () => {
    vi.mocked(commentsApi.list).mockResolvedValue(PAGE);

    const { result } = renderHook(() => useReviewComments('r1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0]).toEqual(PAGE);
    expect(commentsApi.list).toHaveBeenCalledWith('r1', { page: 1, limit: 10 });
  });

  it('does not fetch when there is no reviewId', async () => {
    const { result } = renderHook(() => useReviewComments(''), { wrapper });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(commentsApi.list).not.toHaveBeenCalled();
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(commentsApi.list).mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useReviewComments('r1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
