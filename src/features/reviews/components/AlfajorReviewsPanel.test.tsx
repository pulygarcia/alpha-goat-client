import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlfajorReviewsPanel } from './AlfajorReviewsPanel';
import { useAlfajorReviews } from '../hooks/useAlfajorReviews';

vi.mock('../hooks/useAlfajorReviews', () => ({ useAlfajorReviews: vi.fn() }));
vi.mock('./AlfajorReviewCard', () => ({
  AlfajorReviewCard: ({ vm }: { vm: { id: string } }) => (
    <article data-testid={`review-${vm.id}`} />
  ),
}));

const mocked = vi.mocked(useAlfajorReviews);

const REVIEW = {
  id: 'r1',
  userId: 'u1',
  author: { id: 'u1', username: 'martu', avatarUrl: null },
  alfajorId: 'a1',
  comentario: 'rico',
  fotoUrl: null,
  ratingGeneral: 9,
  dulzor: 7,
  cantidadDDL: 9,
  calidadBano: 8,
  ratioTapaRelleno: 7,
  textura: 8,
  createdAt: '2026-07-14T12:00:00.000Z',
  updatedAt: '2026-07-14T12:00:00.000Z',
};

function hook(over: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    ...over,
  } as unknown as ReturnType<typeof useAlfajorReviews>;
}

describe('AlfajorReviewsPanel', () => {
  beforeEach(() => mocked.mockReset());

  it('shows the skeleton while loading', () => {
    mocked.mockReturnValue(hook({ isLoading: true }));
    render(<AlfajorReviewsPanel alfajorId="a1" onReview={vi.fn()} />);
    expect(screen.getByTestId('alfajor-reviews-loading')).toBeInTheDocument();
  });

  it('shows an error block and retries on demand', async () => {
    const refetch = vi.fn();
    mocked.mockReturnValue(hook({ isError: true, refetch }));
    render(<AlfajorReviewsPanel alfajorId="a1" onReview={vi.fn()} />);
    expect(
      screen.getByText('No pudimos traer las reseñas'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('shows the empty state and opens the review modal from its CTA', async () => {
    const onReview = vi.fn();
    mocked.mockReturnValue(
      hook({ data: { pages: [{ items: [], page: 1, limit: 10, total: 0 }] } }),
    );
    render(<AlfajorReviewsPanel alfajorId="a1" onReview={onReview} />);
    expect(screen.getByText('Nadie lo reseñó todavía')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Ser el primero' }),
    );
    expect(onReview).toHaveBeenCalledOnce();
  });

  it('renders one card per review', () => {
    mocked.mockReturnValue(
      hook({
        data: { pages: [{ items: [REVIEW], page: 1, limit: 10, total: 1 }] },
      }),
    );
    render(<AlfajorReviewsPanel alfajorId="a1" onReview={vi.fn()} />);
    expect(screen.getByTestId('review-r1')).toBeInTheDocument();
  });

  it('loads the next page on demand', async () => {
    const fetchNextPage = vi.fn();
    mocked.mockReturnValue(
      hook({
        data: { pages: [{ items: [REVIEW], page: 1, limit: 10, total: 20 }] },
        hasNextPage: true,
        fetchNextPage,
      }),
    );
    render(<AlfajorReviewsPanel alfajorId="a1" onReview={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cargar más' }));
    expect(fetchNextPage).toHaveBeenCalledOnce();
  });
});
