import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RankingList } from './RankingList';
import { useGlobalRanking } from '../hooks/useGlobalRanking';
import type { RankingItem } from '../types/ranking.types';

vi.mock('../hooks/useGlobalRanking', () => ({
  useGlobalRanking: vi.fn(),
}));

const item = (
  id: string,
  score: number,
  reviewsCount: number,
): RankingItem => ({
  id,
  nombre: `Alfajor ${id}`,
  tipo: 'CHOCOLATE',
  score,
  reviewsCount,
  marca: { id: `m-${id}`, nombre: `Marca ${id}`, logoUrl: null },
});

const makeState = (over: Partial<ReturnType<typeof useGlobalRanking>>) =>
  ({
    data: undefined,
    isLoading: false,
    isError: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    ...over,
  }) as unknown as ReturnType<typeof useGlobalRanking>;

const withPages = (items: RankingItem[]) =>
  ({ pages: [{ items, total: items.length, page: 1, limit: 20 }] }) as never;

describe('RankingList', () => {
  beforeEach(() => vi.mocked(useGlobalRanking).mockReset());

  it('renders each alfajor with its derived position, score and review count', () => {
    vi.mocked(useGlobalRanking).mockReturnValue(
      makeState({
        data: withPages([item('a1', 9.1, 40), item('a2', 8.45, 12)]),
      }),
    );

    render(<RankingList />);

    // Posición derivada del offset: 01, 02.
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('Alfajor a1')).toBeInTheDocument();
    expect(screen.getByText('Marca a1')).toBeInTheDocument();
    expect(screen.getByText('9.1')).toBeInTheDocument();
    expect(screen.getByText(/40 reseñas/)).toBeInTheDocument();
  });

  it('shows a loading state while fetching the first page', () => {
    vi.mocked(useGlobalRanking).mockReturnValue(makeState({ isLoading: true }));
    render(<RankingList />);
    expect(screen.getByTestId('ranking-skeleton')).toBeInTheDocument();
  });

  it('shows an error message when the request fails', () => {
    vi.mocked(useGlobalRanking).mockReturnValue(makeState({ isError: true }));
    render(<RankingList />);
    expect(screen.getByText(/no pudimos cargar/i)).toBeInTheDocument();
  });

  it('shows an empty message when there are no ranked alfajores', () => {
    vi.mocked(useGlobalRanking).mockReturnValue(
      makeState({ data: withPages([]) }),
    );
    render(<RankingList />);
    expect(screen.getByText(/todavía no hay/i)).toBeInTheDocument();
  });

  it('loads more when the button is clicked', () => {
    const fetchNextPage = vi.fn();
    vi.mocked(useGlobalRanking).mockReturnValue(
      makeState({
        data: withPages([item('a1', 9, 10)]),
        hasNextPage: true,
        fetchNextPage,
      }),
    );

    render(<RankingList />);
    fireEvent.click(screen.getByRole('button', { name: /cargar más/i }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });
});
