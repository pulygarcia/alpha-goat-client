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

  it('renders the top 3 as a podium with name, marca, score and position', () => {
    mocked.mockReturnValue(
      baseReturn({
        data: [
          makeItem(),
          makeItem({
            id: 'a2',
            nombre: 'Capitán del Espacio',
            score: 8.5,
            marca: { id: 'm2', nombre: 'Capitán', logoUrl: null },
          }),
          makeItem({
            id: 'a3',
            nombre: 'Jorgito Negro',
            score: 8.2,
            marca: { id: 'm3', nombre: 'Jorgito', logoUrl: null },
          }),
        ],
      }),
    );
    render(<WeeklyRanking />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Cachafaz Negro Triple')).toBeInTheDocument();
    expect(screen.getByText('Cachafaz')).toBeInTheDocument();
    expect(screen.getByText('8.7')).toBeInTheDocument();
    expect(screen.getByText('Capitán del Espacio')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('Jorgito Negro')).toBeInTheDocument();
    expect(screen.getByText('8.2')).toBeInTheDocument();
  });

  it('renders positions 4+ as compact rows below the podium', () => {
    mocked.mockReturnValue(
      baseReturn({
        data: [
          makeItem({ id: 'a1' }),
          makeItem({ id: 'a2' }),
          makeItem({ id: 'a3' }),
          makeItem({ id: 'a4', nombre: 'Fantoche Blanco', score: 7.9 }),
          makeItem({ id: 'a5', nombre: 'Terrabusi Clásico', score: 7.5 }),
        ],
      }),
    );
    render(<WeeklyRanking />);

    expect(screen.getByText('04')).toBeInTheDocument();
    expect(screen.getByText('Fantoche Blanco')).toBeInTheDocument();
    expect(screen.getByText('05')).toBeInTheDocument();
    expect(screen.getByText('Terrabusi Clásico')).toBeInTheDocument();
  });

  it('degrades to natural order when there are fewer than 3 items', () => {
    mocked.mockReturnValue(
      baseReturn({
        data: [
          makeItem(),
          makeItem({ id: 'a2', nombre: 'Capitán del Espacio', score: 8.5 }),
        ],
      }),
    );
    render(<WeeklyRanking />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('renders the trend marker for each direction', () => {
    mocked.mockReturnValue(
      baseReturn({
        data: [
          makeItem({ id: 'a1', trend: 'up' }),
          makeItem({ id: 'a2', trend: 'down' }),
          makeItem({ id: 'a3', trend: 'same' }),
          makeItem({ id: 'a4', trend: 'new' }),
        ],
      }),
    );
    render(<WeeklyRanking />);

    expect(screen.getByText('▲')).toBeInTheDocument();
    expect(screen.getByText('▼')).toBeInTheDocument();
    expect(screen.getByText('=')).toBeInTheDocument();
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
