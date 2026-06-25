import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserReviews } from './UserReviews';
import { useUserReviews } from '../hooks/useUserReviews';

vi.mock('../hooks/useUserReviews', () => ({
  useUserReviews: vi.fn(),
}));

// Stub del ReviewCard: aislamos la lista de las deps del card.
vi.mock('@/features/reviews/components/ReviewCard', () => ({
  ReviewCard: ({ vm }: { vm: { id: string } }) => (
    <div data-testid="review-card">{vm.id}</div>
  ),
}));

function mockQuery(over: Partial<ReturnType<typeof useUserReviews>>) {
  vi.mocked(useUserReviews).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    ...over,
  } as unknown as ReturnType<typeof useUserReviews>);
}

const page = (ids: string[]) => ({
  pages: [
    { items: ids.map((id) => ({ id })), total: ids.length, page: 1, limit: 10 },
  ],
});

describe('UserReviews', () => {
  beforeEach(() => vi.mocked(useUserReviews).mockReset());

  it('shows a loading state', () => {
    mockQuery({ isLoading: true });
    render(<UserReviews userId="u1" username="puly" />);
    expect(screen.getByTestId('user-reviews-loading')).toBeInTheDocument();
  });

  it('shows an error state', () => {
    mockQuery({ isError: true });
    render(<UserReviews userId="u1" username="puly" />);
    expect(screen.getByText(/no pudimos cargar/i)).toBeInTheDocument();
  });

  it('shows an empty state with the username', () => {
    mockQuery({ data: page([]) as never });
    render(<UserReviews userId="u1" username="puly" />);
    expect(screen.getByText(/puly/i)).toBeInTheDocument();
    expect(screen.queryByTestId('review-card')).not.toBeInTheDocument();
  });

  it('renders a card per review', () => {
    mockQuery({ data: page(['r1', 'r2', 'r3']) as never });
    render(<UserReviews userId="u1" username="puly" />);
    expect(screen.getAllByTestId('review-card')).toHaveLength(3);
  });

  it('calls fetchNextPage from the load-more button', () => {
    const fetchNextPage = vi.fn();
    mockQuery({
      data: page(['r1']) as never,
      hasNextPage: true,
      fetchNextPage,
    });
    render(<UserReviews userId="u1" username="puly" />);
    screen.getByRole('button', { name: /cargar más/i }).click();
    expect(fetchNextPage).toHaveBeenCalledOnce();
  });
});
