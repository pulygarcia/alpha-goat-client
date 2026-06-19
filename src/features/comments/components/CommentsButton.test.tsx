import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentsButton } from './CommentsButton';

vi.mock('./CommentsModal', () => ({
  CommentsModal: ({ open, reviewId }: { open: boolean; reviewId: string }) =>
    open ? <div data-testid="comments-modal">{reviewId}</div> : null,
}));

const summary = {
  author: 'pepe',
  avatarUrl: null,
  comentario: 'rico',
  createdAt: new Date().toISOString(),
};

describe('CommentsButton', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the comment count', () => {
    render(<CommentsButton reviewId="r1" count={4} summary={summary} />);
    expect(
      screen.getByRole('button', { name: /ver comentarios/i }),
    ).toHaveTextContent('4');
  });

  it('keeps the modal closed by default', () => {
    render(<CommentsButton reviewId="r1" count={4} summary={summary} />);
    expect(screen.queryByTestId('comments-modal')).not.toBeInTheDocument();
  });

  it('opens the modal on click, passing the reviewId', () => {
    render(<CommentsButton reviewId="r1" count={4} summary={summary} />);
    fireEvent.click(screen.getByRole('button', { name: /ver comentarios/i }));
    expect(screen.getByTestId('comments-modal')).toHaveTextContent('r1');
  });
});
