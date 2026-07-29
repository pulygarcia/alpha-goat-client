import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeeklyRanking } from './WeeklyRanking';
import { useWeeklyRanking } from '../hooks/useWeeklyRanking';
import type { WeeklyRankingItem } from '../types/ranking.types';

vi.mock('../hooks/useWeeklyRanking', () => ({
  useWeeklyRanking: vi.fn(),
}));

const mocked = vi.mocked(useWeeklyRanking);

function makeItem(over: Partial<WeeklyRankingItem> = {}): WeeklyRankingItem {
  return {
    id: 'a1',
    nombre: 'Cachafaz Negro Triple',
    score: 8.7,
    trend: 'up',
    marca: { id: 'm1', nombre: 'Cachafaz', logoUrl: null },
    ...over,
  };
}

function baseReturn(over: Partial<ReturnType<typeof useWeeklyRanking>> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    ...over,
  } as unknown as ReturnType<typeof useWeeklyRanking>;
}

describe('WeeklyRanking', () => {
  beforeEach(() => mocked.mockReset());

  it('renders the first item as the lead, with marca, score and a link to its detail', () => {
    mocked.mockReturnValue(baseReturn({ data: [makeItem()] }));
    render(<WeeklyRanking />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Cachafaz Negro Triple')).toBeInTheDocument();
    expect(screen.getByText(/Cachafaz$/)).toBeInTheDocument();
    expect(screen.getByText('8.7')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Cachafaz Negro Triple/ }),
    ).toHaveAttribute('href', '/alfajores/a1');
  });

  it('renders the rest as compact rows numbered from 2', () => {
    mocked.mockReturnValue(
      baseReturn({
        data: [
          makeItem(),
          makeItem({ id: 'a2', nombre: 'Havanna Mixto', score: 7.6 }),
          makeItem({ id: 'a3', nombre: 'Guaymallén Negro', score: 7.4 }),
        ],
      }),
    );
    render(<WeeklyRanking />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Havanna Mixto')).toBeInTheDocument();
    expect(screen.getByText('7.6')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Guaymallén Negro')).toBeInTheDocument();
  });

  it('links to the full ranking when there is data', () => {
    mocked.mockReturnValue(baseReturn({ data: [makeItem()] }));
    render(<WeeklyRanking />);
    expect(
      screen.getByRole('link', { name: /ver ranking completo/i }),
    ).toHaveAttribute('href', '/ranking');
  });

  it('renders the trend marker of the lead', () => {
    mocked.mockReturnValue(baseReturn({ data: [makeItem({ trend: 'new' })] }));
    render(<WeeklyRanking />);
    expect(screen.getByText('nuevo')).toBeInTheDocument();
  });

  it('shows an error message on failure', () => {
    mocked.mockReturnValue(baseReturn({ isError: true }));
    render(<WeeklyRanking />);
    expect(
      screen.getByText(/no pudimos cargar el ranking/i),
    ).toBeInTheDocument();
  });

  it('shows the empty state when there is no ranking', () => {
    mocked.mockReturnValue(baseReturn({ data: [] }));
    render(<WeeklyRanking />);
    expect(
      screen.getByText(/todavía no hay suficientes reseñas/i),
    ).toBeInTheDocument();
  });
});
