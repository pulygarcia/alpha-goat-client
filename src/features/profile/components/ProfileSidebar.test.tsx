import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfileSidebar } from './ProfileSidebar';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import type { Profile } from '../types/profile.types';

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock('@/features/follows/components/FollowButton', () => ({
  FollowButton: ({ userId }: { userId: string }) => (
    <button data-testid="follow-button" data-user={userId}>
      Seguir
    </button>
  ),
}));

const PROFILE: Profile = {
  id: 'u1',
  username: 'puly',
  avatarUrl: null,
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
  followersCount: 312,
  followingCount: 89,
  reviewsCount: 24,
  isFollowing: false,
};

function mockCurrentUser(id: string | null) {
  vi.mocked(useCurrentUser).mockReturnValue({
    data: id ? { id } : null,
  } as ReturnType<typeof useCurrentUser>);
}

describe('ProfileSidebar', () => {
  beforeEach(() => vi.mocked(useCurrentUser).mockReset());

  it('shows the username, handle and core counts', async () => {
    mockCurrentUser(null);
    render(<ProfileSidebar profile={PROFILE} />);

    expect(screen.getByText('puly')).toBeInTheDocument();
    expect(screen.getByText('@puly')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('stat-reviews')).toHaveTextContent('24');
      expect(screen.getByTestId('stat-followers')).toHaveTextContent('312');
      expect(screen.getByTestId('stat-following')).toHaveTextContent('89');
    });
  });

  it('renders the FollowButton when viewing someone else', () => {
    mockCurrentUser('other');
    render(<ProfileSidebar profile={PROFILE} />);

    expect(screen.getByTestId('follow-button')).toHaveAttribute(
      'data-user',
      'u1',
    );
    expect(
      screen.queryByRole('button', { name: /editar perfil/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the edit button on the own profile and calls onEditClick', () => {
    mockCurrentUser('u1');
    const onEditClick = vi.fn();
    render(<ProfileSidebar profile={PROFILE} onEditClick={onEditClick} />);

    const btn = screen.getByRole('button', { name: /editar perfil/i });
    btn.click();
    expect(onEditClick).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('follow-button')).not.toBeInTheDocument();
  });
});
