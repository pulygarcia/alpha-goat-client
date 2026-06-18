import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlfajorDetail } from './AlfajorDetail';
import { useAlfajor } from '../hooks/useAlfajor';
import type { Alfajor } from '../types/alfajores.types';

vi.mock('../hooks/useAlfajor', () => ({ useAlfajor: vi.fn() }));
// Hijos con query hooks propios (tienen sus tests): se mockean para aislar el detalle.
vi.mock('@/features/reviews/components/AlfajorReviews', () => ({
  AlfajorReviews: () => null,
}));
vi.mock('@/features/reviews/components/QuickReviewModal', () => ({
  QuickReviewModal: () => null,
}));

const mocked = vi.mocked(useAlfajor);

const ALFAJOR: Alfajor = {
  id: 'a1',
  nombre: 'Jorgito Triple',
  marcaId: 'm1',
  marca: { id: 'm1', nombre: 'Jorgito', provincia: 'Córdoba', logoUrl: null },
  tipo: 'CHOCOLATE',
  descripcion: 'Tres tapas, mucho dulce de leche.',
  imagenUrl: null,
  status: 'APPROVED',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function baseReturn(over: Partial<ReturnType<typeof useAlfajor>> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    ...over,
  } as unknown as ReturnType<typeof useAlfajor>;
}

describe('AlfajorDetail', () => {
  beforeEach(() => mocked.mockReset());

  it('shows the loading skeleton while fetching', () => {
    mocked.mockReturnValue(baseReturn({ isLoading: true }));
    render(<AlfajorDetail id="a1" />);
    expect(screen.getByTestId('alfajor-detail-skeleton')).toBeInTheDocument();
  });

  it('shows a not-found message on a 404', () => {
    mocked.mockReturnValue(
      baseReturn({
        isError: true,
        error: { response: { status: 404 } } as never,
      }),
    );
    render(<AlfajorDetail id="missing" />);
    expect(
      screen.getByText(/no encontramos este alfajor/i),
    ).toBeInTheDocument();
  });

  it('shows a generic error message on non-404 failures', () => {
    mocked.mockReturnValue(
      baseReturn({
        isError: true,
        error: { response: { status: 500 } } as never,
      }),
    );
    render(<AlfajorDetail id="a1" />);
    expect(screen.getByText(/no pudimos cargar/i)).toBeInTheDocument();
  });

  it('renders the alfajor info when loaded', () => {
    mocked.mockReturnValue(baseReturn({ data: ALFAJOR }));
    render(<AlfajorDetail id="a1" />);

    expect(screen.getByText('Jorgito Triple')).toBeInTheDocument();
    expect(screen.getByText('Jorgito · Córdoba')).toBeInTheDocument();
    expect(
      screen.getByText('Tres tapas, mucho dulce de leche.'),
    ).toBeInTheDocument();
  });
});
