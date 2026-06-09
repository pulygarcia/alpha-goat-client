import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturedMarcas } from './FeaturedMarcas';
import { useFeaturedMarcas } from '../hooks/useFeaturedMarcas';
import type { FeaturedMarca } from '../types/marcas.types';

vi.mock('../hooks/useFeaturedMarcas', () => ({
  useFeaturedMarcas: vi.fn(),
}));

const mocked = vi.mocked(useFeaturedMarcas);

function makeMarca(over: Partial<FeaturedMarca> = {}): FeaturedMarca {
  return {
    id: 'm1',
    nombre: 'Cachafaz',
    provincia: 'Buenos Aires',
    logoUrl: null,
    productCount: 14,
    avgScore: 7.8,
    ...over,
  };
}

function baseReturn(over: Partial<ReturnType<typeof useFeaturedMarcas>> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    ...over,
  } as unknown as ReturnType<typeof useFeaturedMarcas>;
}

describe('FeaturedMarcas', () => {
  beforeEach(() => mocked.mockReset());

  it('renders a card per marca with name and meta', () => {
    mocked.mockReturnValue(
      baseReturn({
        data: [
          makeMarca(),
          makeMarca({ id: 'm2', nombre: 'Tatín', provincia: null, productCount: 1, avgScore: 7.6 }),
        ],
      }),
    );
    render(<FeaturedMarcas />);

    expect(screen.getByText('Cachafaz')).toBeInTheDocument();
    expect(screen.getByText(/14 productos · 7\.8 prom\. · Buenos Aires/)).toBeInTheDocument();
    // singular y sin provincia
    expect(screen.getByText('Tatín')).toBeInTheDocument();
    expect(screen.getByText(/^1 producto · 7\.6 prom\.$/)).toBeInTheDocument();
  });

  it('shows the logo image when logoUrl exists and the initial when it does not', () => {
    mocked.mockReturnValue(
      baseReturn({
        data: [
          makeMarca({ logoUrl: 'https://cdn.example/cachafaz.png' }),
          makeMarca({ id: 'm2', nombre: 'Tatín' }),
        ],
      }),
    );
    render(<FeaturedMarcas />);

    expect(screen.getByRole('img', { name: 'Cachafaz' })).toHaveAttribute(
      'src',
      'https://cdn.example/cachafaz.png',
    );
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('shows an error message on failure', () => {
    mocked.mockReturnValue(baseReturn({ isError: true }));
    render(<FeaturedMarcas />);
    expect(screen.getByText(/no pudimos cargar las marcas/i)).toBeInTheDocument();
  });

  it('shows the empty state when there are no marcas', () => {
    mocked.mockReturnValue(baseReturn({ data: [] }));
    render(<FeaturedMarcas />);
    expect(screen.getByText(/todavía no hay marcas en foco/i)).toBeInTheDocument();
  });
});
