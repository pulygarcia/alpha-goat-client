import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlfajorDetail } from './AlfajorDetail';
import { useAlfajor } from '../hooks/useAlfajor';
import { useAlfajorReviews } from '@/features/reviews/hooks/useAlfajorReviews';
import type { Alfajor } from '../types/alfajores.types';

vi.mock('../hooks/useAlfajor', () => ({ useAlfajor: vi.fn() }));
vi.mock('@/features/reviews/hooks/useAlfajorReviews', () => ({
  useAlfajorReviews: vi.fn(),
}));
// Hijos con hooks propios (tienen sus tests): se mockean para aislar el detalle.
vi.mock('@/features/reviews/components/AlfajorReviewsPanel', () => ({
  AlfajorReviewsPanel: () => <div data-testid="reviews-panel" />,
}));
vi.mock('@/features/reviews/components/QuickReviewModal', () => ({
  QuickReviewModal: () => null,
}));
vi.mock('./AlfajorImageUploader', () => ({ AlfajorImageUploader: () => null }));

const mockedAlfajor = vi.mocked(useAlfajor);
const mockedReviews = vi.mocked(useAlfajorReviews);

const ALFAJOR: Alfajor = {
  id: 'a1',
  nombre: 'Jorgito Triple',
  marcaId: 'm1',
  marca: { id: 'm1', nombre: 'Jorgito', provincia: 'Córdoba', logoUrl: null },
  tipo: 'CHOCOLATE',
  descripcion: 'Tres tapas, mucho dulce de leche.',
  imagenUrl: null,
  status: 'APPROVED',
  avgRating: 8.4,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function alfajorHook(over: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    ...over,
  } as unknown as ReturnType<typeof useAlfajor>;
}

function reviewsHook(total = 12) {
  return {
    data: { pages: [{ items: [], page: 1, limit: 10, total }] },
  } as unknown as ReturnType<typeof useAlfajorReviews>;
}

describe('AlfajorDetail', () => {
  beforeEach(() => {
    mockedAlfajor.mockReset();
    mockedReviews.mockReset();
    mockedReviews.mockReturnValue(reviewsHook());
  });

  it('shows the loading skeleton while fetching', () => {
    mockedAlfajor.mockReturnValue(alfajorHook({ isLoading: true }));
    render(<AlfajorDetail id="a1" />);
    expect(screen.getByTestId('alfajor-detail-skeleton')).toBeInTheDocument();
  });

  it('shows a not-found message on a 404', () => {
    mockedAlfajor.mockReturnValue(
      alfajorHook({ isError: true, error: { response: { status: 404 } } }),
    );
    render(<AlfajorDetail id="missing" />);
    expect(
      screen.getByText(/no encontramos este alfajor/i),
    ).toBeInTheDocument();
  });

  it('shows a generic error message on non-404 failures', () => {
    mockedAlfajor.mockReturnValue(
      alfajorHook({ isError: true, error: { response: { status: 500 } } }),
    );
    render(<AlfajorDetail id="a1" />);
    expect(screen.getByText(/no pudimos cargar/i)).toBeInTheDocument();
    expect(screen.queryByTestId('reviews-panel')).not.toBeInTheDocument();
  });

  it('renders both columns and feeds the score block from the reviews total', () => {
    mockedAlfajor.mockReturnValue(alfajorHook({ data: ALFAJOR }));
    render(<AlfajorDetail id="a1" />);

    expect(screen.getByText('Jorgito Triple')).toBeInTheDocument();
    expect(screen.getByText('Jorgito')).toBeInTheDocument();
    expect(screen.getByText('Córdoba')).toBeInTheDocument();
    expect(screen.getByText('8.4')).toBeInTheDocument();
    expect(screen.getByText('12 reseñas')).toBeInTheDocument();
    expect(screen.getByTestId('reviews-panel')).toBeInTheDocument();
    expect(
      screen.getByText('Tres tapas, mucho dulce de leche.'),
    ).toBeInTheDocument();
  });

  it('reads the reviews count from the same query the panel uses', () => {
    mockedAlfajor.mockReturnValue(alfajorHook({ data: ALFAJOR }));
    render(<AlfajorDetail id="a1" />);
    expect(mockedReviews).toHaveBeenCalledWith('a1');
  });
});
