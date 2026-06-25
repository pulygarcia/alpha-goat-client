import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LikeButton } from './LikeButton';
import { useToggleLike } from '../hooks/useToggleLike';
import { useRequireAuth } from '@/shared/hooks/useRequireAuth';

vi.mock('../hooks/useToggleLike', () => ({ useToggleLike: vi.fn() }));
vi.mock('@/shared/hooks/useRequireAuth', () => ({ useRequireAuth: vi.fn() }));

const mockedToggle = vi.mocked(useToggleLike);
const mockedRequireAuth = vi.mocked(useRequireAuth);

function setRequireAuth(authed = true) {
  mockedRequireAuth.mockReturnValue((action: () => void) => {
    if (authed) action();
  });
}

function setToggle(over: Partial<ReturnType<typeof useToggleLike>> = {}) {
  const mutate = vi.fn();
  mockedToggle.mockReturnValue({
    mutate,
    isPending: false,
    ...over,
  } as unknown as ReturnType<typeof useToggleLike>);
  return mutate;
}

describe('LikeButton', () => {
  beforeEach(() => {
    mockedToggle.mockReset();
    mockedRequireAuth.mockReset();
    setRequireAuth();
  });

  it('shows the like count', () => {
    setToggle();
    render(<LikeButton reviewId="r1" likes={7} isLiked={false} />);
    expect(screen.getByRole('button')).toHaveTextContent('7');
  });

  it('reflects the liked state via aria-pressed', () => {
    setToggle();
    render(<LikeButton reviewId="r1" likes={7} isLiked={true} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles with the current state on click', () => {
    const mutate = setToggle();
    render(<LikeButton reviewId="r1" likes={7} isLiked={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mutate).toHaveBeenCalledWith({ reviewId: 'r1', isLiked: false });
  });

  it('redirects instead of toggling for an anonymous user', () => {
    const mutate = setToggle();
    setRequireAuth(false);
    render(<LikeButton reviewId="r1" likes={7} isLiked={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mutate).not.toHaveBeenCalled();
  });

  it('does not disable the button but skips toggling while pending', () => {
    const mutate = setToggle({ isPending: true });
    render(<LikeButton reviewId="r1" likes={7} isLiked={false} />);
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button.className).not.toContain('cursor-not-allowed');
    fireEvent.click(button);
    expect(mutate).not.toHaveBeenCalled();
  });
});
