import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreateComment } from './useCreateComment';
import { reviewCommentsKey } from './useReviewComments';
import { commentsApi } from '../api/comments.api';
import { notifyError } from '@/shared/lib/toast';
import type { Comment } from '../types/comments.types';

vi.mock('../api/comments.api', () => ({
  commentsApi: { list: vi.fn(), create: vi.fn() },
}));

vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

const CREATED: Comment = {
  id: 'c1',
  reviewId: 'r1',
  userId: 'u1',
  author: { id: 'u1', username: 'pepe', avatarUrl: null },
  contenido: 'rico',
  likesCount: 0,
  isLiked: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
  const { result } = renderHook(() => useCreateComment('r1'), { wrapper });
  return { result, invalidate };
}

describe('useCreateComment', () => {
  beforeEach(() => {
    vi.mocked(commentsApi.create).mockReset();
    vi.mocked(notifyError).mockReset();
  });

  it('creates the comment and invalidates the review comments list', async () => {
    vi.mocked(commentsApi.create).mockResolvedValue(CREATED);
    const { result, invalidate } = setup();

    act(() => result.current.mutate({ contenido: 'rico' }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(commentsApi.create).toHaveBeenCalledWith('r1', {
      contenido: 'rico',
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: reviewCommentsKey('r1'),
    });
  });

  it('notifies an error when creation fails', async () => {
    vi.mocked(commentsApi.create).mockRejectedValue(new Error('boom'));
    const { result } = setup();

    act(() => result.current.mutate({ contenido: 'rico' }));

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        'No pudimos publicar el comentario',
      ),
    );
  });
});
