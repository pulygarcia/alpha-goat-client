import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsPage } from './StatsPage';
import { useGlobalStats } from '../hooks/useGlobalStats';

vi.mock('../hooks/useGlobalStats', () => ({
  useGlobalStats: vi.fn(),
}));
vi.mock('@/shared/components/dome-gallery/CommunityDomeGallery', () => ({
  CommunityDomeGallery: () => <div>dome-gallery</div>,
}));
vi.mock('./StatCounter', () => ({
  StatCounter: ({ label, value }: { label: string; value: number }) => (
    <div>
      {label}: {value}
    </div>
  ),
}));

const mocked = vi.mocked(useGlobalStats);

describe('StatsPage', () => {
  it('shows a skeleton while loading', () => {
    mocked.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    } as never);
    render(<StatsPage />);

    expect(
      screen.getByTestId('stats-counters-skeleton'),
    ).toBeInTheDocument();
  });

  it('shows an error message on failure', () => {
    mocked.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    } as never);
    render(<StatsPage />);

    expect(
      screen.getByText('No pudimos cargar las estadísticas. Probá recargar.'),
    ).toBeInTheDocument();
  });

  it('renders the dome gallery and the counters once data loads', () => {
    mocked.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        reviewsTotal: 10,
        alfajoresTotal: 5,
        usersTotal: 3,
        alfajoresContributedByUsers: 2,
      },
    } as never);
    render(<StatsPage />);

    expect(screen.getByText('dome-gallery')).toBeInTheDocument();
    expect(screen.getByText('Reseñas: 10')).toBeInTheDocument();
    expect(screen.getByText('Alfajores: 5')).toBeInTheDocument();
    expect(screen.getByText('Usuarios: 3')).toBeInTheDocument();
    expect(screen.getByText('Aportados: 2')).toBeInTheDocument();
  });
});
