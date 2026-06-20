import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
  type InfiniteData,
} from '@tanstack/react-query';
import React from 'react';
import { useToggleCommentLike } from './useToggleCommentLike';
import { reviewCommentsKey } from './useReviewComments';
import { commentsApi } from '../api/comments.api';
import { notifyError } from '@/shared/lib/toast';
import type { Comment, PaginatedComments } from '../types/comments.types';

vi.mock('../api/comments.api', () => ({
  commentsApi: { like: vi.fn(), unlike: vi.fn() },
}));
vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

const KEY = reviewCommentsKey('r1');

function comment(id: string, likesCount: number, isLiked: boolean): Comment {
  return {
    id,
    reviewId: 'r1',
    userId: 'u1',
    author: { id: 'u1', username: 'pepe', avatarUrl: null },
    contenido: 'rico',
    likesCount,
    isLiked,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  };
}

function seed(items: Comment[]): InfiniteData<PaginatedComments> {
  return {
    pages: [{ items, total: items.length, page: 1, limit: 10 }],
    pageParams: [1],
  };
}

function setup(initial: Comment[]) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  client.setQueryDefaults(['comments', 'list'], { enabled: false });
  client.setQueryData(KEY, seed(initial));

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);

  const { result } = renderHook(() => useToggleCommentLike(), { wrapper });
  const row = () =>
    client.getQueryData<InfiniteData<PaginatedComments>>(KEY)!.pages[0]
      .items[0];
  return { result, client, row };
}

describe('useToggleCommentLike', () => {
  beforeEach(() => {
    vi.mocked(commentsApi.like).mockReset();
    vi.mocked(commentsApi.unlike).mockReset();
    vi.mocked(notifyError).mockReset();
  });

  it('optimistically likes the comment and calls like()', async () => {
    vi.mocked(commentsApi.like).mockResolvedValue();
    const { result, row } = setup([comment('c1', 3, false)]);

    act(() => {
      result.current.mutate({ commentId: 'c1', isLiked: false });
    });

    await waitFor(() => expect(row().isLiked).toBe(true));
    expect(row().likesCount).toBe(4);
    expect(commentsApi.like).toHaveBeenCalledWith('c1');
    expect(commentsApi.unlike).not.toHaveBeenCalled();
  });

  it('calls unlike() and decrements when already liked', async () => {
    vi.mocked(commentsApi.unlike).mockResolvedValue();
    const { result, row } = setup([comment('c1', 3, true)]);

    act(() => {
      result.current.mutate({ commentId: 'c1', isLiked: true });
    });

    await waitFor(() => expect(row().isLiked).toBe(false));
    expect(row().likesCount).toBe(2);
    expect(commentsApi.unlike).toHaveBeenCalledWith('c1');
  });

  it('rolls back and toasts on error', async () => {
    vi.mocked(commentsApi.like).mockRejectedValue(new Error('boom'));
    const { result, row } = setup([comment('c1', 3, false)]);

    act(() => {
      result.current.mutate({ commentId: 'c1', isLiked: false });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(row().isLiked).toBe(false);
    expect(row().likesCount).toBe(3);
    expect(notifyError).toHaveBeenCalledWith('No pudimos actualizar el like');
  });
});
