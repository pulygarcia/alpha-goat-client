import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ContributionStats } from './ContributionStats';
import type { Profile } from '../types/profile.types';

const BASE: Profile = {
  id: 'u1',
  username: 'puly',
  avatarUrl: null,
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
  followersCount: 3,
  followingCount: 2,
  reviewsCount: 5,
  isFollowing: null,
};

describe('ContributionStats', () => {
  it('renders the four community contribution metrics', async () => {
    render(
      <ContributionStats
        profile={{
          ...BASE,
          commentsCount: 57,
          alfajoresAddedCount: 6,
          likesReceivedCount: 140,
          avgScore: 7.8,
        }}
      />,
    );

    expect(screen.getByText(/aportes a la comunidad/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('contrib-comments')).toHaveTextContent('57');
      expect(screen.getByTestId('contrib-added')).toHaveTextContent('6');
      expect(screen.getByTestId('contrib-likes')).toHaveTextContent('140');
      expect(screen.getByTestId('contrib-score')).toHaveTextContent('7.8');
    });
  });

  it('falls back to zero when contribution fields are missing', async () => {
    render(<ContributionStats profile={BASE} />);

    await waitFor(() => {
      expect(screen.getByTestId('contrib-comments')).toHaveTextContent('0');
      expect(screen.getByTestId('contrib-added')).toHaveTextContent('0');
      expect(screen.getByTestId('contrib-likes')).toHaveTextContent('0');
    });
  });

  it('shows a dash for the average score when there are no reviews', () => {
    render(<ContributionStats profile={{ ...BASE, avgScore: null }} />);

    expect(screen.getByTestId('contrib-score')).toHaveTextContent('—');
  });
});
