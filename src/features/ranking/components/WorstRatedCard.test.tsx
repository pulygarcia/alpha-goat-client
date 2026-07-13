import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorstRatedCard } from './WorstRatedCard';
import { useWorstRated } from '../hooks/useWorstRated';
import type { WorstRatedItem } from '../types/ranking.types';

vi.mock('../hooks/useWorstRated', () => ({
  useWorstRated: vi.fn(),
}));

const mocked = vi.mocked(useWorstRated);

const ITEM: WorstRatedItem = {
  id: 'a1',
  nombre: 'Alfajor Triste',
  tipo: 'CHOCOLATE',
  score: 1.8,
  reviewsCount: 12,
  imagenUrl: null,
  marca: { id: 'm1', nombre: 'Marca X', logoUrl: null },
};

function baseReturn(over: Partial<ReturnType<typeof useWorstRated>> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    ...over,
  } as unknown as ReturnType<typeof useWorstRated>;
}

describe('WorstRatedCard', () => {
  beforeEach(() => mocked.mockReset());

  it('renders the headline, alfajor info and a link to its detail', () => {
    mocked.mockReturnValue(baseReturn({ data: ITEM }));
    render(<WorstRatedCard />);

    expect(screen.getByText('El peor votado')).toBeInTheDocument();
    expect(screen.getByText('Alfajor Triste')).toBeInTheDocument();
    expect(screen.getByText(/Marca X/)).toBeInTheDocument();
    expect(screen.getByText('1.8')).toBeInTheDocument();
    expect(screen.getByText(/12 reseñas/)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/alfajores/a1');
  });

  it('renders the alfajor image when imagenUrl is present', () => {
    mocked.mockReturnValue(
      baseReturn({ data: { ...ITEM, imagenUrl: 'https://cdn.test/foto.jpg' } }),
    );
    render(<WorstRatedCard />);
    expect(
      screen.getByRole('img', { name: 'Alfajor Triste' }),
    ).toBeInTheDocument();
  });

  it('renders no image when imagenUrl is null', () => {
    mocked.mockReturnValue(baseReturn({ data: ITEM }));
    render(<WorstRatedCard />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders nothing while loading', () => {
    mocked.mockReturnValue(baseReturn({ isLoading: true }));
    const { container } = render(<WorstRatedCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing on error (the feed must not break for this block)', () => {
    mocked.mockReturnValue(baseReturn({ isError: true }));
    const { container } = render(<WorstRatedCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when no alfajor qualifies (204 -> null)', () => {
    mocked.mockReturnValue(baseReturn({ data: null }));
    const { container } = render(<WorstRatedCard />);
    expect(container).toBeEmptyDOMElement();
  });
});
