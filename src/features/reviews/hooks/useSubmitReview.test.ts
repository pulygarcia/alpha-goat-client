import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSubmitReview } from './useSubmitReview';
import { reviewsApi } from '../api/reviews.api';
import type { CreateReviewInput, Review } from '../types/reviews.types';

vi.mock('../api/reviews.api', () => ({
  reviewsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const INPUT: CreateReviewInput = {
  alfajorId: 'a1',
  ratingGeneral: 8,
  dulzor: 7,
  cantidadDDL: 9,
  calidadBano: 8,
  ratioTapaRelleno: 6,
  textura: 8,
  comentario: 'rico',
};

const REVIEW = { id: 'r1', alfajorId: 'a1' } as Review;

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  function wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  }
  return { wrapper, invalidate };
}

describe('useSubmitReview', () => {
  beforeEach(() => {
    vi.mocked(reviewsApi.create).mockReset();
    vi.mocked(reviewsApi.update).mockReset();
  });

  it('creates a review and invalidates the list + alfajor detail', async () => {
    vi.mocked(reviewsApi.create).mockResolvedValue(REVIEW);
    const { wrapper, invalidate } = setup();

    const { result } = renderHook(() => useSubmitReview('a1'), { wrapper });
    result.current.mutate({ mode: 'create', input: INPUT });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reviewsApi.create).toHaveBeenCalledWith(INPUT);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['reviews', 'list', { alfajorId: 'a1' }],
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['alfajores', 'detail', 'a1'],
    });
  });

  it('updates an existing review by id', async () => {
    vi.mocked(reviewsApi.update).mockResolvedValue(REVIEW);
    const { wrapper } = setup();

    const { result } = renderHook(() => useSubmitReview('a1'), { wrapper });
    result.current.mutate({
      mode: 'edit',
      reviewId: 'r1',
      input: { ratingGeneral: 9 },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reviewsApi.update).toHaveBeenCalledWith('r1', { ratingGeneral: 9 });
    expect(reviewsApi.create).not.toHaveBeenCalled();
  });
});
