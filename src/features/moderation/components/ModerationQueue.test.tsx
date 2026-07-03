import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModerationQueue } from './ModerationQueue';
import { useModerationQueue } from '../hooks/useModerationQueue';
import type { PaginatedAlfajores } from '@/features/alfajores/types/alfajores.types';

vi.mock('../hooks/useModerationQueue', () => ({
  useModerationQueue: vi.fn(),
}));
vi.mock('./PendingAlfajorCard', () => ({
  PendingAlfajorCard: ({ alfajor }: { alfajor: { nombre: string } }) => (
    <div data-testid="pending-card">{alfajor.nombre}</div>
  ),
}));

function alfajor(id: string, nombre: string) {
  return {
    id,
    nombre,
    marcaId: 'm1',
    marca: null,
    tipo: 'CHOCOLATE',
    descripcion: null,
    imagenUrl: null,
    status: 'PENDING',
    createdAt: '2026-07-01T00:00:00.000Z',
  };
}

const refetch = vi.fn();

function mockQueue(
  state: Partial<{
    data: PaginatedAlfajores;
    isLoading: boolean;
    isError: boolean;
  }>,
) {
  vi.mocked(useModerationQueue).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch,
    ...state,
  } as never);
}

beforeEach(() => {
  refetch.mockClear();
  vi.mocked(useModerationQueue).mockClear();
});

describe('ModerationQueue', () => {
  it('shows a skeleton while loading', () => {
    mockQueue({ isLoading: true });
    render(<ModerationQueue />);

    expect(screen.getByTestId('moderation-skeleton')).toBeInTheDocument();
  });

  it('shows an error message with retry', async () => {
    const user = userEvent.setup();
    mockQueue({ isError: true });
    render(<ModerationQueue />);

    expect(
      screen.getByText('No pudimos cargar la cola de moderación.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows the empty state when there is nothing pending', () => {
    mockQueue({
      data: { items: [], total: 0, page: 1, limit: 12 } as PaginatedAlfajores,
    });
    render(<ModerationQueue />);

    expect(
      screen.getByText('No hay alfajores pendientes de moderación.'),
    ).toBeInTheDocument();
  });

  it('renders a card per pending alfajor without pagination for a single page', () => {
    mockQueue({
      data: {
        items: [alfajor('a1', 'Jorgito'), alfajor('a2', 'Guaymallén')],
        total: 2,
        page: 1,
        limit: 12,
      } as PaginatedAlfajores,
    });
    render(<ModerationQueue />);

    expect(screen.getAllByTestId('pending-card')).toHaveLength(2);
    expect(screen.queryByText(/Página/)).not.toBeInTheDocument();
  });

  it('paginates with prev/next when there are more pages', async () => {
    const user = userEvent.setup();
    mockQueue({
      data: {
        items: [alfajor('a1', 'Jorgito')],
        total: 20,
        page: 1,
        limit: 12,
      } as PaginatedAlfajores,
    });
    render(<ModerationQueue />);

    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← Anterior' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Siguiente →' }));

    expect(vi.mocked(useModerationQueue)).toHaveBeenLastCalledWith(2);
  });
});
