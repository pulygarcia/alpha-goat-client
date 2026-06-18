import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentList } from './CommentList';
import { useReviewComments } from '../hooks/useReviewComments';
import type { Comment } from '../types/comments.types';

vi.mock('../hooks/useReviewComments', () => ({
  useReviewComments: vi.fn(),
}));

const mocked = vi.mocked(useReviewComments);

function makeComment(
  id: string,
  contenido: string,
  username = 'pepe',
): Comment {
  return {
    id,
    reviewId: 'r1',
    userId: 'u1',
    author: { id: 'u1', username, avatarUrl: null },
    contenido,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function baseReturn(over: Partial<ReturnType<typeof useReviewComments>> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    ...over,
  } as unknown as ReturnType<typeof useReviewComments>;
}

describe('CommentList', () => {
  beforeEach(() => mocked.mockReset());

  it('shows a skeleton while loading', () => {
    mocked.mockReturnValue(baseReturn({ isLoading: true }));
    render(<CommentList reviewId="r1" />);
    expect(screen.getByTestId('comments-skeleton')).toBeInTheDocument();
  });

  it('shows an error message on failure', () => {
    mocked.mockReturnValue(baseReturn({ isError: true }));
    render(<CommentList reviewId="r1" />);
    expect(screen.getByText(/no pudimos cargar/i)).toBeInTheDocument();
  });

  it('shows the empty state when there are no comments', () => {
    mocked.mockReturnValue(
      baseReturn({
        data: { pages: [{ items: [], total: 0, page: 1, limit: 10 }] } as never,
      }),
    );
    render(<CommentList reviewId="r1" />);
    expect(screen.getByText(/todavía no hay comentarios/i)).toBeInTheDocument();
  });

  it('renders author and content for each comment across pages', () => {
    mocked.mockReturnValue(
      baseReturn({
        data: {
          pages: [
            {
              items: [makeComment('c1', 'rico', 'ana')],
              total: 2,
              page: 1,
              limit: 10,
            },
            {
              items: [makeComment('c2', 'malísimo', 'beto')],
              total: 2,
              page: 2,
              limit: 10,
            },
          ],
        } as never,
      }),
    );
    render(<CommentList reviewId="r1" />);
    expect(screen.getByText('rico')).toBeInTheDocument();
    expect(screen.getByText('ana')).toBeInTheDocument();
    expect(screen.getByText('malísimo')).toBeInTheDocument();
    expect(screen.getByText('beto')).toBeInTheDocument();
  });

  it('falls back to "Usuario" when the author is missing', () => {
    const orphan = { ...makeComment('c1', 'anon'), author: null };
    mocked.mockReturnValue(
      baseReturn({
        data: {
          pages: [{ items: [orphan], total: 1, page: 1, limit: 10 }],
        } as never,
      }),
    );
    render(<CommentList reviewId="r1" />);
    expect(screen.getByText('Usuario')).toBeInTheDocument();
  });

  it('calls fetchNextPage when "Cargar más" is clicked', () => {
    const fetchNextPage = vi.fn();
    mocked.mockReturnValue(
      baseReturn({
        data: {
          pages: [
            {
              items: [makeComment('c1', 'rico')],
              total: 20,
              page: 1,
              limit: 10,
            },
          ],
        } as never,
        hasNextPage: true,
        fetchNextPage,
      }),
    );
    render(<CommentList reviewId="r1" />);
    fireEvent.click(screen.getByText('Cargar más'));
    expect(fetchNextPage).toHaveBeenCalled();
  });
});
