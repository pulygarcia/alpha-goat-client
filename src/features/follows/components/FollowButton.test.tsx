import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FollowButton } from './FollowButton';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useToggleFollow } from '../hooks/useToggleFollow';

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));
vi.mock('../hooks/useToggleFollow', () => ({
  useToggleFollow: vi.fn(),
}));

const mockedUser = vi.mocked(useCurrentUser);
const mockedToggle = vi.mocked(useToggleFollow);

function setUser(id: string | null) {
  mockedUser.mockReturnValue({
    data: id ? { id } : undefined,
  } as unknown as ReturnType<typeof useCurrentUser>);
}

function setToggle(over: Partial<ReturnType<typeof useToggleFollow>> = {}) {
  const mutate = vi.fn();
  mockedToggle.mockReturnValue({
    mutate,
    isPending: false,
    ...over,
  } as unknown as ReturnType<typeof useToggleFollow>);
  return mutate;
}

describe('FollowButton', () => {
  beforeEach(() => {
    mockedUser.mockReset();
    mockedToggle.mockReset();
  });

  it('renders "Seguir" when not following', () => {
    setUser('me');
    setToggle();
    render(<FollowButton userId="other" isFollowing={false} />);
    expect(screen.getByRole('button', { name: 'Seguir' })).toBeInTheDocument();
  });

  it('renders "Siguiendo" when following', () => {
    setUser('me');
    setToggle();
    render(<FollowButton userId="other" isFollowing={true} />);
    expect(screen.getByRole('button', { name: 'Siguiendo' })).toBeInTheDocument();
  });

  it('toggles with the current state on click', () => {
    setUser('me');
    const mutate = setToggle();
    render(<FollowButton userId="other" isFollowing={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mutate).toHaveBeenCalledWith({ userId: 'other', isFollowing: false });
  });

  it('is disabled and does not toggle while pending', () => {
    setUser('me');
    const mutate = setToggle({ isPending: true });
    render(<FollowButton userId="other" isFollowing={false} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('renders nothing for the current user', () => {
    setUser('me');
    setToggle();
    const { container } = render(<FollowButton userId="me" isFollowing={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
