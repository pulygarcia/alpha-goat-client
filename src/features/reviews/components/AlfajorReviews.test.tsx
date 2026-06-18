import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlfajorReviews } from './AlfajorReviews';
import { useAlfajorReviews } from '../hooks/useAlfajorReviews';
import type { Review } from '../types/reviews.types';

vi.mock('../hooks/useAlfajorReviews', () => ({ useAlfajorReviews: vi.fn() }));
vi.mock('./ReviewCard', () => ({
  ReviewCard: ({ review }: { review: Review }) => <div>review-{review.id}</div>,
}));

const mocked = vi.mocked(useAlfajorReviews);

function makeReview(id: string): Review {
  return {
    id,
    userId: 'u1',
    author: { id: 'u1', username: 'pepe', avatarUrl: null },
    alfajorId: 'a1',
    ratingGeneral: 8,
    dulzor: 7,
    cantidadDDL: 9,
    calidadBano: 8,
    ratioTapaRelleno: 6,
    textura: 8,
    comentario: null,
    fotoUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function baseReturn(over: Partial<ReturnType<typeof useAlfajorReviews>> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    ...over,
  } as unknown as ReturnType<typeof useAlfajorReviews>;
}

function pages(items: Review[]) {
  return { pages: [{ items, total: items.length, page: 1, limit: 10 }] };
}

describe('AlfajorReviews', () => {
  beforeEach(() => mocked.mockReset());

  it('shows a loading state while fetching', () => {
    mocked.mockReturnValue(baseReturn({ isLoading: true }));
    render(<AlfajorReviews alfajorId="a1" />);
    expect(screen.getByTestId('alfajor-reviews-loading')).toBeInTheDocument();
  });

  it('shows an error message on failure', () => {
    mocked.mockReturnValue(baseReturn({ isError: true }));
    render(<AlfajorReviews alfajorId="a1" />);
    expect(
      screen.getByText(/no pudimos cargar las reseñas/i),
    ).toBeInTheDocument();
  });

  it('shows an empty state when there are no reviews', () => {
    mocked.mockReturnValue(baseReturn({ data: pages([]) as never }));
    render(<AlfajorReviews alfajorId="a1" />);
    expect(screen.getByText(/sé el primero/i)).toBeInTheDocument();
  });

  it('renders a card per review', () => {
    mocked.mockReturnValue(
      baseReturn({ data: pages([makeReview('1'), makeReview('2')]) as never }),
    );
    render(<AlfajorReviews alfajorId="a1" />);
    expect(screen.getByText('review-1')).toBeInTheDocument();
    expect(screen.getByText('review-2')).toBeInTheDocument();
  });

  it('calls fetchNextPage when "Cargar más" is clicked', () => {
    const fetchNextPage = vi.fn();
    mocked.mockReturnValue(
      baseReturn({
        data: pages([makeReview('1')]) as never,
        hasNextPage: true,
        fetchNextPage,
      }),
    );
    render(<AlfajorReviews alfajorId="a1" />);
    fireEvent.click(screen.getByRole('button', { name: /cargar más/i }));
    expect(fetchNextPage).toHaveBeenCalled();
  });
});
