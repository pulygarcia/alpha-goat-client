import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentLikeButton } from './CommentLikeButton';

const mutate = vi.fn();
const requireAuth = vi.fn((fn: () => void) => fn());
let isPending = false;

vi.mock('../hooks/useToggleCommentLike', () => ({
  useToggleCommentLike: () => ({ mutate, isPending }),
}));
vi.mock('@/shared/hooks/useRequireAuth', () => ({
  useRequireAuth: () => requireAuth,
}));

describe('CommentLikeButton', () => {
  beforeEach(() => {
    mutate.mockReset();
    requireAuth.mockClear();
    isPending = false;
  });

  it('shows the like count', () => {
    render(<CommentLikeButton commentId="c1" likesCount={5} isLiked={false} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('toggles the like through auth gating on click', () => {
    render(<CommentLikeButton commentId="c1" likesCount={5} isLiked={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(requireAuth).toHaveBeenCalled();
    expect(mutate).toHaveBeenCalledWith({ commentId: 'c1', isLiked: false });
  });

  it('reflects the liked state via aria-pressed', () => {
    render(<CommentLikeButton commentId="c1" likesCount={5} isLiked />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not disable the button while the like request is in flight', () => {
    isPending = true;
    render(<CommentLikeButton commentId="c1" likesCount={5} isLiked={false} />);
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button.className).not.toContain('cursor-not-allowed');
  });
});
