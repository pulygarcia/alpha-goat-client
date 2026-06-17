import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlfajoresCatalog } from './AlfajoresCatalog';
import { useAlfajores } from '../hooks/useAlfajores';
import type { Alfajor } from '../types/alfajores.types';

vi.mock('../hooks/useAlfajores', () => ({ useAlfajores: vi.fn() }));

// Debounce como identidad: el valor tipeado llega al hook sin esperar timers.
vi.mock('@/shared/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (v: unknown) => v,
}));

// Card mockeada (evita next/image en jsdom): solo el nombre.
vi.mock('./AlfajorCard', () => ({
  AlfajorCard: ({ alfajor }: { alfajor: Alfajor }) => (
    <div>{alfajor.nombre}</div>
  ),
}));

const mocked = vi.mocked(useAlfajores);

function makeItem(id: string, nombre: string): Alfajor {
  return {
    id,
    nombre,
    marcaId: 'm1',
    marca: { id: 'm1', nombre: 'Havanna', provincia: 'CABA', logoUrl: null },
    tipo: 'CHOCOLATE',
    descripcion: null,
    imagenUrl: null,
    status: 'APPROVED',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function baseReturn(over: Partial<ReturnType<typeof useAlfajores>> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    ...over,
  } as unknown as ReturnType<typeof useAlfajores>;
}

function pages(items: Alfajor[]) {
  return { pages: [{ items, total: items.length, page: 1, limit: 24 }] };
}

describe('AlfajoresCatalog', () => {
  beforeEach(() => mocked.mockReset());

  it('shows the loading skeleton while fetching', () => {
    mocked.mockReturnValue(baseReturn({ isLoading: true }));
    render(<AlfajoresCatalog />);
    expect(screen.getByTestId('alfajores-grid-skeleton')).toBeInTheDocument();
  });

  it('shows an error message on failure', () => {
    mocked.mockReturnValue(baseReturn({ isError: true }));
    render(<AlfajoresCatalog />);
    expect(screen.getByText(/no pudimos cargar/i)).toBeInTheDocument();
  });

  it('shows an empty message when there are no results', () => {
    mocked.mockReturnValue(baseReturn({ data: pages([]) as never }));
    render(<AlfajoresCatalog />);
    expect(screen.getByText(/no encontramos alfajores/i)).toBeInTheDocument();
  });

  it('renders a card per alfajor', () => {
    mocked.mockReturnValue(
      baseReturn({
        data: pages([
          makeItem('1', 'Jorgito'),
          makeItem('2', 'Guaymallén'),
        ]) as never,
      }),
    );
    render(<AlfajoresCatalog />);
    expect(screen.getByText('Jorgito')).toBeInTheDocument();
    expect(screen.getByText('Guaymallén')).toBeInTheDocument();
  });

  it('passes the search text to the query', () => {
    mocked.mockReturnValue(baseReturn({ data: pages([]) as never }));
    render(<AlfajoresCatalog />);

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'jorg' },
    });

    expect(mocked).toHaveBeenLastCalledWith({ q: 'jorg' });
  });

  it('calls fetchNextPage when "Cargar más" is clicked', () => {
    const fetchNextPage = vi.fn();
    mocked.mockReturnValue(
      baseReturn({
        data: pages([makeItem('1', 'Jorgito')]) as never,
        hasNextPage: true,
        fetchNextPage,
      }),
    );
    render(<AlfajoresCatalog />);

    fireEvent.click(screen.getByRole('button', { name: /cargar más/i }));
    expect(fetchNextPage).toHaveBeenCalled();
  });
});
