import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileView } from './ProfileView';
import { useProfile } from '../hooks/useProfile';
import type { Profile } from '../types/profile.types';

vi.mock('../hooks/useProfile', () => ({ useProfile: vi.fn() }));
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ data: null }),
}));
vi.mock('./ProfileSidebar', () => ({
  ProfileSidebar: ({ profile }: { profile: Profile }) => (
    <div data-testid="profile-sidebar">{profile.username}</div>
  ),
}));
vi.mock('./ContributionStats', () => ({
  ContributionStats: ({ profile }: { profile: Profile }) => (
    <div data-testid="contribution-stats">{profile.username}</div>
  ),
}));
vi.mock('./UserReviews', () => ({
  UserReviews: ({ userId }: { userId: string }) => (
    <div data-testid="user-reviews">{userId}</div>
  ),
}));
vi.mock('./EditProfileModal', () => ({
  EditProfileModal: () => <div data-testid="edit-modal" />,
}));

const PROFILE: Profile = {
  id: 'u1',
  username: 'puly',
  avatarUrl: null,
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
  followersCount: 3,
  followingCount: 2,
  reviewsCount: 5,
  isFollowing: false,
  commentsCount: 0,
  alfajoresAddedCount: 0,
  likesReceivedCount: 0,
  avgScore: null,
};

function mockProfile(over: Partial<ReturnType<typeof useProfile>>) {
  vi.mocked(useProfile).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    ...over,
  } as unknown as ReturnType<typeof useProfile>);
}

describe('ProfileView', () => {
  beforeEach(() => vi.mocked(useProfile).mockReset());

  it('shows a loading state', () => {
    mockProfile({ isLoading: true });
    render(<ProfileView username="puly" />);
    expect(screen.getByTestId('profile-loading')).toBeInTheDocument();
  });

  it('shows a not-found message on 404', () => {
    mockProfile({
      isError: true,
      error: { response: { status: 404 } } as never,
    });
    render(<ProfileView username="ghost" />);
    expect(screen.getByText(/no encontramos/i)).toBeInTheDocument();
  });

  it('shows a generic error on other failures', () => {
    mockProfile({
      isError: true,
      error: { response: { status: 500 } } as never,
    });
    render(<ProfileView username="puly" />);
    expect(screen.getByText(/no pudimos cargar/i)).toBeInTheDocument();
  });

  it('renders the sidebar, contribution stats and the reviews on success', () => {
    mockProfile({ data: PROFILE });
    render(<ProfileView username="puly" />);
    expect(screen.getByTestId('profile-sidebar')).toHaveTextContent('puly');
    expect(screen.getByTestId('contribution-stats')).toHaveTextContent('puly');
    expect(screen.getByTestId('user-reviews')).toHaveTextContent('u1');
  });
});
