import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAlfajorReviews } from './useAlfajorReviews';
import { reviewsApi } from '../api/reviews.api';
import type { PaginatedReviews } from '../types/reviews.types';

vi.mock('../api/reviews.api', () => ({
  reviewsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const PAGE: PaginatedReviews = {
  items: [
    {
      id: 'r1',
      userId: 'u1',
      author: { id: 'u1', username: 'pepe', avatarUrl: null },
      alfajorId: 'a1',
      ratingGeneral: 8,
      dulzor: 7,
      cantidadDDL: 9,
      calidadBano: 8,
      ratioTapaRelleno: 6,
      textura: 8,
      comentario: 'rico',
      fotoUrl: null,
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

describe('useAlfajorReviews', () => {
  beforeEach(() => vi.mocked(reviewsApi.list).mockReset());

  it('fetches the first page of reviews for the alfajor', async () => {
    vi.mocked(reviewsApi.list).mockResolvedValue(PAGE);

    const { result } = renderHook(() => useAlfajorReviews('a1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0]).toEqual(PAGE);
    expect(reviewsApi.list).toHaveBeenCalledWith({
      alfajorId: 'a1',
      page: 1,
      limit: 10,
    });
  });

  it('does not fetch when there is no alfajorId', async () => {
    const { result } = renderHook(() => useAlfajorReviews(''), { wrapper });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(reviewsApi.list).not.toHaveBeenCalled();
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(reviewsApi.list).mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useAlfajorReviews('a1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
