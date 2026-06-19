import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommentsModal } from './CommentsModal';

vi.mock('./CommentList', () => ({
  CommentList: ({ reviewId }: { reviewId: string }) => (
    <div data-testid="comment-list">{reviewId}</div>
  ),
}));
vi.mock('./CommentForm', () => ({
  CommentForm: ({ reviewId }: { reviewId: string }) => (
    <div data-testid="comment-form">{reviewId}</div>
  ),
}));
vi.mock('@/shared/providers/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'u1', username: 'yo', avatarUrl: null } }),
}));

const summary = {
  author: 'pepe',
  avatarUrl: null,
  comentario: 'rico',
  createdAt: new Date().toISOString(),
};

describe('CommentsModal', () => {
  it('renders the review summary, list and form when open', () => {
    render(
      <CommentsModal
        reviewId="r1"
        summary={summary}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Pepe')).toBeInTheDocument();
    expect(screen.getByText(/@pepe/)).toBeInTheDocument();
    expect(screen.getByText('rico')).toBeInTheDocument();
    expect(screen.getByTestId('comment-list')).toHaveTextContent('r1');
    expect(screen.getByTestId('comment-form')).toHaveTextContent('r1');
  });

  it('renders nothing when closed', () => {
    render(
      <CommentsModal
        reviewId="r1"
        summary={summary}
        open={false}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('comment-list')).not.toBeInTheDocument();
  });

  it('omits the quote when the review has no comment', () => {
    render(
      <CommentsModal
        reviewId="r1"
        summary={{ ...summary, comentario: null }}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.queryByText('“rico”')).not.toBeInTheDocument();
    expect(screen.getByTestId('comment-list')).toBeInTheDocument();
  });
});
