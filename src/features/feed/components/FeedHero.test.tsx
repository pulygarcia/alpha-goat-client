import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeedHero } from './FeedHero';
import { useFeedHero } from '../hooks/useFeedHero';
import { useFeedFilters } from '../store/feedFilters.store';
import type { FeedHero as FeedHeroData } from '../types/feed.types';

vi.mock('../hooks/useFeedHero', () => ({
  useFeedHero: vi.fn(),
}));

vi.mock('@/shared/hooks/useRevealOnScroll', () => ({
  useRevealOnScroll: () => ({
    ref: { current: null },
    revealed: true,
    animate: false,
  }),
}));

const mocked = vi.mocked(useFeedHero);

function baseReturn(
  over: Partial<ReturnType<typeof useFeedHero>> = {},
): ReturnType<typeof useFeedHero> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    ...over,
  } as unknown as ReturnType<typeof useFeedHero>;
}

function makeHero(): FeedHeroData {
  return {
    alfajor: {
      id: 'a1',
      nombre: 'Jorgito',
      tipo: 'CHOCOLATE',
      imagenUrl: null,
      marca: { id: 'm1', nombre: 'Havanna', provincia: 'CABA' },
    },
    ratings: {
      general: 8.4,
      dulzor: 8,
      cantidadDDL: 7,
      calidadBano: 9,
      ratioTapaRelleno: 6,
      textura: 8,
    },
    stats: {
      reviewsThisWeek: 12,
      reviewsLastWeek: 10,
      deltaPct: 20,
      totalReviews: 340,
    },
    period: { from: '2026-07-14', to: '2026-07-21' },
  };
}

describe('FeedHero', () => {
  beforeEach(() => {
    mocked.mockReset();
    useFeedFilters.setState({ scope: null });
  });

  it('renders the full hero with radar data when scope is null', () => {
    mocked.mockReturnValue(baseReturn({ data: makeHero() }));
    render(<FeedHero />);
    expect(screen.getByText('Jorgito')).toBeInTheDocument();
    expect(screen.getByText(/Havanna/)).toBeInTheDocument();
    expect(screen.getByText('Total reseñas')).toBeInTheDocument();
  });

  it('renders a collapsed bar (no radar/marca/stats) when a scope is active', () => {
    useFeedFilters.setState({ scope: 'today' });
    mocked.mockReturnValue(baseReturn({ data: makeHero() }));
    render(<FeedHero />);

    expect(screen.getByText('Jorgito')).toBeInTheDocument();
    expect(screen.getByText('8.4')).toBeInTheDocument();
    expect(screen.getByText('Goat del momento')).toBeInTheDocument();
    expect(screen.getByTestId('feed-hero-mini-radar')).toBeInTheDocument();
    expect(screen.queryByText(/Havanna/)).not.toBeInTheDocument();
    expect(screen.queryByText('Total reseñas')).not.toBeInTheDocument();
  });

  it('renders nothing in collapsed mode while loading', () => {
    useFeedFilters.setState({ scope: 'week' });
    mocked.mockReturnValue(baseReturn({ isLoading: true }));
    const { container } = render(<FeedHero />);
    expect(container).toHaveTextContent('');
  });

  it('renders nothing in collapsed mode on error', () => {
    useFeedFilters.setState({ scope: 'following' });
    mocked.mockReturnValue(baseReturn({ isError: true }));
    const { container } = render(<FeedHero />);
    expect(container).toHaveTextContent('');
  });

  it('renders nothing in collapsed mode when there is no data', () => {
    useFeedFilters.setState({ scope: 'today' });
    mocked.mockReturnValue(baseReturn({ data: undefined }));
    const { container } = render(<FeedHero />);
    expect(container).toHaveTextContent('');
  });
});
