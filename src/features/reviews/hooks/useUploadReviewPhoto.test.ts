import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUploadReviewPhoto } from './useUploadReviewPhoto';
import { reviewsApi } from '../api/reviews.api';
import { notifyError } from '@/shared/lib/toast';
import { alfajorReviewsKey } from './useAlfajorReviews';

vi.mock('../api/reviews.api', () => ({
  reviewsApi: { uploadPhoto: vi.fn() },
}));
vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

let client: QueryClient;

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useUploadReviewPhoto', () => {
  beforeEach(() => {
    client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(reviewsApi.uploadPhoto).mockReset();
    vi.mocked(notifyError).mockReset();
  });

  it('uploads the file and invalidates the alfajor reviews, detail and feed', async () => {
    vi.mocked(reviewsApi.uploadPhoto).mockResolvedValue({ id: 'r1' } as never);
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const file = new File(['x'], 'review.png', { type: 'image/png' });

    const { result } = renderHook(() => useUploadReviewPhoto('a1'), {
      wrapper,
    });
    result.current.mutate({ reviewId: 'r1', file });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reviewsApi.uploadPhoto).toHaveBeenCalledWith('r1', file);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: alfajorReviewsKey('a1'),
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['alfajores', 'detail', 'a1'],
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['feed'] });
  });

  it('notifies error on failure', async () => {
    vi.mocked(reviewsApi.uploadPhoto).mockRejectedValueOnce(new Error('boom'));
    const file = new File(['x'], 'review.png', { type: 'image/png' });

    const { result } = renderHook(() => useUploadReviewPhoto('a1'), {
      wrapper,
    });
    result.current.mutate({ reviewId: 'r1', file });

    await waitFor(() => expect(notifyError).toHaveBeenCalled());
  });
});
