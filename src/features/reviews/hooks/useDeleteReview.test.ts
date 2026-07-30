import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDeleteReview } from './useDeleteReview';
import { reviewsApi } from '../api/reviews.api';
import { notifyError, notifySuccess } from '@/shared/lib/toast';

vi.mock('../api/reviews.api', () => ({
  reviewsApi: { remove: vi.fn() },
}));
vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateQueries = vi.spyOn(qc, 'invalidateQueries');
  return {
    invalidateQueries,
    Wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: qc }, children),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useDeleteReview', () => {
  it('borra la reseña, avisa por toast e invalida los caches derivados', async () => {
    vi.mocked(reviewsApi.remove).mockResolvedValue(undefined);
    const { Wrapper, invalidateQueries } = wrapper();
    const { result } = renderHook(() => useDeleteReview(), {
      wrapper: Wrapper,
    });

    act(() => result.current.mutate('r1'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(reviewsApi.remove).toHaveBeenCalledWith('r1');
    expect(notifySuccess).toHaveBeenCalledWith('Reseña eliminada');
    const invalidatedKeys = invalidateQueries.mock.calls.map(
      (call) => call[0]?.queryKey,
    );
    expect(invalidatedKeys).toContainEqual(['feed']);
    expect(invalidatedKeys).toContainEqual(['reviews']);
    expect(invalidatedKeys).toContainEqual(['alfajores']);
    expect(invalidatedKeys).toContainEqual(['profile']);
    expect(invalidatedKeys).toContainEqual(['ranking']);
  });

  it('avisa por toast de error y no invalida nada si falla', async () => {
    vi.mocked(reviewsApi.remove).mockRejectedValue(new Error('nope'));
    const { Wrapper, invalidateQueries } = wrapper();
    const { result } = renderHook(() => useDeleteReview(), {
      wrapper: Wrapper,
    });

    act(() => result.current.mutate('r1'));

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(notifyError).toHaveBeenCalledWith('No pudimos borrar la reseña');
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
